"use strict";

L.Control.OpenDAP = L.Control.extend( {

  options: {},

  initialize: function ( options ) {
    L.setOptions( this, options );
  },

  onAdd: function ( map ) {
    var name = 'leaflet-control-opendap',
      container = L.DomUtil.create( 'div', name + ' leaflet-bar' );

    this._map = map;
    this._svg = this._createSvg( 'inspect', this.options.chart );

    map.on( 'mousemove', _.debounce( this._mouseMove.bind( this ), 200 ), this );

    return container;
  },

  onRemove: function ( map ) {
  },

  _mouseMove: function ( event ) {
    this.options.getData( event.latlng, function ( err, data ) {

      var d = data;

      var width = this.width;
      var height = this.height;

      var x = d3.time.scale()
        .range( [0, width] );

      var y = d3.scale.linear()
        .range( [height, 0] );

      var xAxis = d3.svg.axis()
        .scale( x )
        .orient( "bottom" );

      var yAxis = d3.svg.axis()
        .scale( y )
        .orient( "left" );

      var line = d3.svg.line()
        .x( function ( d ) {
              return x( d.date );
            } )
        .y( function ( d ) {
              return y( d.value );
            } );

      x.domain( d3.extent( d, function ( d ) {
        return d.date;
      } ) );
      y.domain( d3.extent( d, function ( d ) {
        return d.value;
      } ) );

      var svg = this._svg;

      svg.selectAll( "g" ).remove();
      svg.append( "g" )
        .attr( "class", "x axis" )
        .attr( "transform", "translate(0," + height + ")" )
        .call( xAxis );

      svg.append( "g" )
        .attr( "class", "y axis" )
        .call( yAxis )
        .append( "text" )
        .attr( "transform", "rotate(-90)" )
        .attr( "y", 6 )
        .attr( "dy", ".71em" )
        .style( "text-anchor", "end" );

      svg.append( "g" )
        .attr( "class", "data" )
        .append( "path" )
        .datum( d )
        .attr( "class", "line" )
        .attr( "d", line );

    }.bind( this ) );
  },

  _createSvg: function ( className, container ) {

    var inspect = L.DomUtil.create( 'div', className, container );

    var margin = this.margin =
                 this.options.margin ||
                 {top: 20, right: 20, bottom: 30, left: 50},
      width = this.width =
              ( this.options.width || 600 ) - margin.left - margin.right,
      height = this.height =
               ( this.options.height || 300 ) - margin.top - margin.bottom;

    var svg = this._svg = d3.select( inspect ).append( "svg" )
      .attr( "width", width + margin.left + margin.right )
      .attr( "height", height + margin.top + margin.bottom )
      .append( "g" )
      .attr( "transform", "translate(" + margin.left + "," + margin.top + ")" );

    return svg;
  }
} );

L.Map.mergeOptions( {
  opendapControl: false
} );

L.Map.addInitHook( function () {
  if ( this.options.opendapControl ) {
    this.opendapControl = new L.Control.OpenDAP();
    this.addControl( this.opendapControl );
  }
} );

L.control.opendap = function ( options ) {
  return new L.Control.OpenDAP( options );
};

L.TileLayer.OpenDAP = L.Class.extend( {

  options: {
    opacity        : 1,
    gradientTexture: false,
    alphaRange     : 1
  },

  initialize: function ( options ) {
    this.data = [];
    L.setOptions( this, options );
  },

  onAdd: function ( map ) {
    this.map = map;
    var mapsize = map.getSize();
    var options = this.options;

    var c = document.createElement( "canvas" );
    c.id = 'webgl-leaflet-' + L.Util.stamp( this );
    c.width = mapsize.x;
    c.height = mapsize.y;
    c.style.opacity = options.opacity;
    c.style.position = 'absolute';

    map.getPanes().overlayPane.appendChild( c );

    this.options.getData( 0, map.getBounds(), function ( err, data ) {
      var config = {
        canvas         : c,
        gradientTexture: options.gradientTexture,
        fragment       : options.fragment,
        vertex         : options.vertex,
        alphaRange     : [0, options.alphaRange],
        rows           : data.latitudes.length - 1,
        cols           : data.longitudes.length - 1,
        data           : data.data
      };
      this.data = data.data;
      this.WebGLHeatMap = createOverlay( config );
      this._plot();
    }.bind( this ) );

    this.canvas = c;

    map.on( "move", this._plot, this );

    /* hide layer on zoom, because it doesn't animate zoom */
    map.on( "zoomstart", this._hide, this );
    map.on( "zoomend", this._show, this );

  },

  onRemove: function ( map ) {
    map.getPanes().overlayPane.removeChild( this.canvas );
    map.off( "move", this._plot, this );
    map.off( "zoomstart", this._hide, this );
    map.off( "zoomend", this._show, this );
  },

  _hide: function () {
    this.canvas.style.display = 'none';
  },

  _show: function () {
    this.canvas.style.display = 'block';
  },

  _clear: function () {
    var heatmap = this.WebGLHeatMap;
    heatmap.clear();
    heatmap.display( this.map );
  },

  _resizeRequest: undefined,

  _plot: function () {
    this.active = true;
    var map = this.map;
    if ( this._resizeRequest !== map._resizeRequest ) {
      this.resize();
      this._resizeRequest = map._resizeRequest;
    }
    var heatmap = this.WebGLHeatMap;
    heatmap.clear();
    L.DomUtil.setPosition( this.canvas,
                           map.latLngToLayerPoint( map.getBounds().getNorthWest() ) );
    var dataLen = this.data.length;
    if ( dataLen ) {
      for ( var i = 0; i < dataLen; i++ ) {
        var dataVal = this.data[i],
          latlng = new L.LatLng( dataVal[0], dataVal[1] ),
          point = map.latLngToContainerPoint( latlng );

        heatmap.addPoint( Math.floor( point.x ), Math.floor( point.y ), dataVal[2] );

      }
      heatmap.update( );
      heatmap.display( map );
    }
  },

  resize: function () {
    //helpful for maps that change sizes
    var mapsize = this.map.getSize();
    this.canvas.width = mapsize.x;
    this.canvas.height = mapsize.y;

    this.WebGLHeatMap.adjustSize();
  },

  addDataPoint: function ( lat, lon, value ) {
    this.data.push( [lat, lon, value / 50] );
  },

  setData: function ( dataset ) {
    this.data = dataset;
  },

  clearData: function () {
    this.data = [];
  },

  update: function () {
    this._plot();
  }
} );

L.layer = function ( options ) {
};

L.layer.opendap = function ( options ) {
  return new L.TileLayer.OpenDAP( options );
};

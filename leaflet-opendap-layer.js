"use strict";

L.TileLayer.OpenDAP = L.Class.extend( {

  options: {
    opacity        : 1
  },

  initialize: function ( options ) {
    L.setOptions( this, options );
    this.data = [];
  },

  findData: function( data, name ) {
    return _.find( data, function( i ) { return i.das.name == name } ).data;
  },

  process_data: function( variable, data ) {

    var all_data = this.findData( data, variable );
    var var_data = this.findData( all_data, variable );

    var data = [];
    //var times = this.findData( all_data, 'time' );
    var latitudes = this.findData( all_data, 'latitude' );
    var longitudes = this.findData( all_data, 'longitude' );

    //for ( var time = 0; time < var_data.length ; time++ ) {
      var d1 = var_data[0];
      for ( var lat = 0; lat < d1.length - 1; lat++ ) {
        var d2 = d1[lat];
        for ( var lng = 0; lng < d2.length - 1 ; lng++ ) {
          var _lat = latitudes[lat];
          var _lng = longitudes[lng];
          data.push( [ _lat, _lng, d2[lng] ] );
        }
      }
    //}

    return {
      data: data,
      rows: latitudes.length,
      cols: longitudes.length
    };
  },

  onAdd: function ( map ) {
    this.map = map;
    var mapsize = map.getSize();
    var options = this.options;

    var canvas = options.canvas;
    canvas.id = 'webgl-leaflet-' + L.Util.stamp( this );
    canvas.width = mapsize.x;
    canvas.height = mapsize.y;
    canvas.style.opacity = options.opacity;
    canvas.style.position = 'absolute';

    map.getPanes().overlayPane.appendChild( canvas );

    var config = {
      canvas  : canvas,
      fragment: options.fragment,
      vertex  : options.vertex
    };
    this.overlay = createOverlay( config );

    var variable = this.options.variable;
    var query = {
      time     : {
        min: moment().unix(),
        max: moment().unix(),
        step: 1
      },
      latitude : { step: 1 },
      longitude: { step: 1 }
    };
    this.options.kettstreet.dap( variable, query, function( err, resp ){
      var data = this.process_data( variable, resp );
      this.rows = data.rows;
      this.cols = data.cols;
      this.data = data.data;
      this._plot();
    }.bind( this ) );

    this.canvas = canvas;

    var slider = options.time.slider;
    var stop = L.DomEvent.stopPropagation;
    this.options.kettstreet.dim( "time", function( err, data ) {
      slider.step = 60 * 60;
      var times = this.findData( data, 'time' );
      slider.min = times[0];
      slider.max = times[times.length - 1];
    }.bind( this ) );

    L.DomEvent
      .on(slider, 'click',     stop)
      .on(slider, 'mousedown', stop)
      .on(slider, 'dblclick',  stop)
      .on(slider, 'change',    L.DomEvent.preventDefault)
      .on(slider, 'input',    this._rollTime, this)
      .on(slider, 'change',    this._rollTime, this);

    this._slider = slider;

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

  _rollTime: function(e) {
    var variable = this.options.variable;
    var query = {
      time     : {
        min: moment( parseInt( e.target.value ) * 1000 ).unix(),
        max: moment( parseInt( e.target.value ) * 1000 ).unix(),
        step: 1
      },
      latitude : { step: 2 },
      longitude: { step: 2 }
    };
    this.options.kettstreet.dap( variable, query, function( err, resp ){
      var data = this.process_data( variable, resp );
      this.rows = data.rows;
      this.cols = data.cols;
      this.data = data.data;
      this._plot();
    }.bind( this ) );
  },

  _hide: function () {
    this.canvas.style.display = 'none';
  },

  _show: function () {
    this.canvas.style.display = 'block';
  },

  _clear: function () {
    var overlay = this.overlay;
    overlay.clear();
    overlay.display( this.map );
  },

  _resizeRequest: undefined,

  _plot: function () {
    this.active = true;
    var map = this.map;
    if ( this._resizeRequest !== map._resizeRequest ) {
      this.resize();
      this._resizeRequest = map._resizeRequest;
    }
    var overlay = this.overlay;
    overlay.clear();
    L.DomUtil.setPosition( this.canvas, map.latLngToLayerPoint( map.getBounds().getNorthWest() ) );
    var dataLen = this.data.length;
    if ( dataLen ) {
      var data = [];
      for ( var i = 0; i < dataLen; i++ ) {
        var dataVal = this.data[i],
          latlng = new L.LatLng( dataVal[0], dataVal[1] ),
          point = map.latLngToContainerPoint( latlng );
        //overlay.addPoint( Math.floor( point.x ), Math.floor( point.y ), dataVal[2] );
        data.push( [ Math.floor( point.x ), Math.floor( point.y ), dataVal[2] ] );
      }
      overlay.update( );
      overlay.display( data, this.rows, this.cols );
    }
  },

  resize: function () {
    //helpful for maps that change sizes
    var mapsize = this.map.getSize();
    this.canvas.width = mapsize.x;
    this.canvas.height = mapsize.y;

    this.overlay.resize();
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

Polymer( 'leaflet-opendap-layer', {

  url : "", variable : "",

  provider: function( xhr ) {
    return function( url, callback ) {
      var options = {
        url: url, responseType: 'arraybuffer', callback: function ( buffer ) {
          callback( undefined, buffer );
        }
      };
      xhr.request( options );
    };
  },

  created: function () {
  },

  containerChanged: function () {
    if ( this.container ) {
      var config = {
        url     : this.url,
        provider: this.provider( this.$.xhr )
      };
      var options = {
        variable  : this.variable,
        canvas    : this.$.canvas,
        time      : {
          slider: this.$.time
        },
        fragment  : this.$.fragment,
        vertex    : this.$.points,
        kettstreet: kettstreet( config )
      };
      this.layer = new L.layer.opendap( options );
      this.container.addLayer( this.layer );
    }
  },

  detached: function () {
    if ( this.container && this.layer ) {
      this.container.removeControl( this.layer );
    }
  }
} );

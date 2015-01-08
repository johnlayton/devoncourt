"use strict";

L.TileLayer.OpenDAP = L.Class.extend( {

  options: {
    opacity        : 1
    //gradientTexture: false,
    //alphaRange     : 1
  },

  initialize: function ( options ) {
    this.data = [];
    L.setOptions( this, options );
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

    this.options.getData( moment(), map.getBounds(), function ( err, data ) {
      this.rows = data.rows;
      this.cols = data.cols;
      this.data = data.data;
      this._plot();
    }.bind( this ) );

    this.canvas = canvas;

    var slider = options.time.slider;
    var stop = L.DomEvent.stopPropagation;
    slider.step = 60 * 60 * 1000;
    slider.min = this.options.time.min.format('x');
    slider.max = this.options.time.max.format('x');

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
    console.log( e.target.value );

    console.log(  moment( e.target.value ) );

    this.options.getData( moment( parseInt( e.target.value ) ), this.map.getBounds(), function ( err, data ) {
      this.rows = data.rows;
      this.cols = data.cols;
      this.data = data.data;
      this._plot();
    }.bind( this ) );
/*
    var dt = new Date( parseInt( e.target.value ) )
    this._label.innerHTML = dt.toLocaleString();
    for (var i = 0; i < this.s.length; i++) {
      this._wmslayers[i].setParams({ time: dt.toISOString() });
    }
    for (var i = 0; i < this._tilelayers.length; i++) {
      this._tilelayers[i].options['time'] = dt.toISOString();
      this._tilelayers[i].redraw();
    }
*/
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

  /*
  addDataPoint: function ( lat, lon, value ) {
    this.data.push( [lat, lon, value / 50] );
  },

  setData: function ( dataset ) {
    this.data = dataset;
  },

  clearData: function () {
    this.data = [];
  },
  */

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

  request : function ( url, callback ) {
    var options = {
      url: url, responseType: 'arraybuffer', callback: function ( buffer ) {
        callback( undefined, jsdap( buffer ) );
      }
    };
    this.$.xhr.request( options );
  },

  findData: function( data, name ) {
    return _.find( data, function( i ) { return i.var.name == name } ).data;
  },

  created: function () {
  },

/*
  ready: function () {
    debugger;
    this.request( this.url + '.dods?time,latitude,longitude', function ( err, data ) {
      this.dapvar = data;
    }.bind( this ) )
  },
*/

  process_data: function( data ) {
    var all_data = this.findData( data[1], this.variable );
    var var_data = this.findData( all_data, this.variable );

    var data = [];
    //var times = this.findData( all_data, 'time' );
    var latitudes = this.findData( all_data, 'latitude' );
    var longitudes = this.findData( all_data, 'longitude' );

    //debugger;

    for ( var time = 0; time < var_data.length ; time++ ) {
      var d1 = var_data[time];
      for ( var lat = 0; lat < d1.length - 1; lat++ ) {
        var d2 = d1[lat];
        for ( var lng = 0; lng < d2.length - 1 ; lng++ ) {
          var _lat = latitudes[lat];
          var _lng = longitudes[lng];
          data.push( [ _lat, _lng, d2[lng] ] );
        }
      }
    }

    return {
      data: data,
      rows: latitudes.length,
      cols: longitudes.length
    };
  },

  request_data : function( time, bounds, callback ) {

    console.log( time );

    if ( this.dapvar ) {
      var times = this.findData( this.dapvar[1], 'time' ).data;
      var lngs = this.findData( this.dapvar[1], 'longitude' ).data;
      var lats = this.findData( this.dapvar[1], 'latitude' ).data;
      var t1 = Math.max( _.findLastIndex( times, function ( i ) {
        return moment( i * 1000 ).isBefore( time );
      } ), 0 );
      var t2 = t1;
      var x1 = Math.max( _.findLastIndex( lngs, function ( i ) {
        return i < bounds.getWest()
      } ), 0 );
      var x2 = Math.min( _.findLastIndex( lngs, function ( i ) {
        return i < bounds.getEast()
      } ), lngs.length - 1);
      var y1 = Math.max( _.findLastIndex( lats, function ( i ) {
        return i < bounds.getSouth()
      } ), 0 );
      var y2 = Math.min( _.findLastIndex( lats, function ( i ) {
        return i < bounds.getNorth()
      } ), lats.length - 1);
      var url = this.url + ".dods?" + this.variable + "[" + t1 + ":1:" + t2 + "][" + y1 + ":2:" + y2 + "][" + x1 + ":2:" + x2 + "]";

      console.log( url );

      this.request( url, function ( err, data ) { callback( err, this.process_data( data ) ); }.bind( this ) );
    }
  },

  containerChanged: function () {
    if ( this.container ) {
      this.request( this.url + '.dods?time,latitude,longitude', function ( err, data ) {
        this.dapvar = data;
        var options = {
          canvas  : this.$.canvas,
          time : {
            slider : this.$.time,
            min : moment( this.findData( data[1], 'time' ).data[0] * 1000 ),
            max : moment( this.findData( data[1], 'time' ).data[162] * 1000 )
          },
          fragment: this.$.fragment,
          vertex  : this.$.points,
          getData : this.request_data.bind( this )
        };
        this.layer = new L.layer.opendap( options );
        this.container.addLayer( this.layer );
      }.bind( this ) )
    }
  },

  detached: function () {
    if ( this.container && this.layer ) {
      this.container.removeControl( this.layer );
    }
  }
} );

"use strict";

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
      this.overlay = createOverlay( config );
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
    L.DomUtil.setPosition( this.canvas,
                           map.latLngToLayerPoint( map.getBounds().getNorthWest() ) );
    var dataLen = this.data.length;
    if ( dataLen ) {
      for ( var i = 0; i < dataLen; i++ ) {
        var dataVal = this.data[i],
          latlng = new L.LatLng( dataVal[0], dataVal[1] ),
          point = map.latLngToContainerPoint( latlng );

        overlay.addPoint( Math.floor( point.x ), Math.floor( point.y ), dataVal[2] );

      }
      overlay.update( );
      overlay.display( map );
    }
  },

  resize: function () {
    //helpful for maps that change sizes
    var mapsize = this.map.getSize();
    this.canvas.width = mapsize.x;
    this.canvas.height = mapsize.y;

    this.overlay.adjustSize();
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

  ready: function () {
    this.request( this.url + '.dods?time,latitude,longitude', function ( err, data ) {
      this.dapvar = data;
      this.containerChanged();
    }.bind( this ) )
  },

  process_data: function( data ) {
    var all_data = this.findData( data[1], this.variable );
    var dim_data = this.findData( all_data, this.variable );

    var data = [];
    //var times = this.findData( all_data, 'time' );
    var latitudes = this.findData( all_data, 'latitude' );
    var longitudes = this.findData( all_data, 'longitude' );

    for ( var time = 0; time < dim_data.length ; time++ ) {
      var d1 = dim_data[time];
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
      latitudes: latitudes,
      longitudes: longitudes
    };
  },

  request_data : function( time, bounds, callback ) {
    if ( this.dapvar ) {

      var times = this.findData( this.dapvar[1], 'time' ).data;
      var lngs = this.findData( this.dapvar[1], 'longitude' ).data;
      var lats = this.findData( this.dapvar[1], 'latitude' ).data;

      var t1 = 0;
      var t2 = t1 + 1;
      var x1 = Math.max( _.findLastIndex( lngs, function ( i ) {
        return i < bounds.getSouthWest().lng
      } ), 0 );
      var x2 = Math.min( _.findLastIndex( lngs, function ( i ) {
        return i < bounds.getNorthEast().lng
      } ), lngs.length - 1);
      var y1 = Math.max( _.findLastIndex( lats, function ( i ) {
        return i < bounds.getSouthWest().lat
      } ), 0 );
      var y2 = Math.min( _.findLastIndex( lats, function ( i ) {
        return i < bounds.getNorthEast().lat
      } ), lats.length - 1);
      var url = this.url + ".dods?" + this.variable + "[" + t1 + ":1:" + t1 + "][" + y1 + ":5:" + y2 + "][" + x1 + ":5:" + x2 + "]"
      this.request( url, function ( err, data ) { callback( err, this.process_data( data ) ); }.bind( this ) );
    }
  },

  containerChanged: function () {
    if ( this.container ) {
      var options = {
        fragment  : this.$.fragment,
        vertex    : this.$.points,
        getData : this.request_data.bind( this )
      };
      this.layer = new L.layer.opendap( options );
      this.container.addLayer( this.layer );
    }
  },

  detached: function () {
    if ( this.container && this.feature ) {
      this.container.removeControl( this.feature );
    }
  }
} );

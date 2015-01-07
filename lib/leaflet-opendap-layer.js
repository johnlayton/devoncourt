"use strict";

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
    console.log( "Created..." );
  },

  ready: function () {
    this.request( this.url + '.dods?time,latitude,longitude', function ( err, data ) {
      this.dapvar = data;
      this.containerChanged();
    }.bind( this ) )
  },

  process: function( data ) {

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

      var t1 = 0;
      var t2 = t1 + 1;

      var lngs = this.findData( this.dapvar[1], 'longitude' ).data;
      var lats = this.findData( this.dapvar[1], 'latitude' ).data;

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
      var url = this.url + ".dods?" + this.variable + "[" + t1 + ":1:" + t2 + "][" + y1 + ":5:" + y2 + "][" + x1 + ":5:" + x2 + "]"
      this.request( url, function ( err, data ) { callback( err, this.process( data ) ); }.bind( this ) );
    }
  },

  containerChanged: function () {
    if ( this.container ) {
      this.layer = new L.layer.opendap( {
                                          fragment  : this.$.fragment,
                                          vertex    : this.$.points,
                                          getData : this.request_data.bind( this )
                                        } );
      this.container.addLayer( this.layer );
    }
  },

  detached: function () {
    if ( this.container && this.feature ) {
      this.container.removeControl( this.feature );
    }
  }
} );

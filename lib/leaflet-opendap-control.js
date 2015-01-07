"use strict";

Polymer( 'leaflet-opendap-control', {

  url: "", variable: "", position: "bottomright", height: 300, width: 500,

  request : function( url, callback ) {
    this.$.xhr.request( { url: url, responseType: 'arraybuffer', callback: function( buffer ) {
      callback( undefined, jsdap( buffer ) );
    } } );
  },

  created: function () {

  },

  ready: function () {
    this.request( this.url + '.dods?time,latitude,longitude',
                  function( err, data ) { this.dapvar =  data; }.bind( this ) )
  },

  findData: function( data, name ) {
    return _.find( data, function( i ) { return i.var.name == name } ).data;
  },

  process: function( data ) {
    var dim_data = this.findData( data[1], this.variable );
    var values = _.flatten( this.findData( dim_data, this.variable ) );
    var dates = _.map( this.findData( dim_data, 'time' ), function ( val ) {
      return moment( val * 1000 ).toDate();
    } ) ;
    return _.filter( _.map( _.zip( dates, values ), function ( arr ) {
      return { date : arr[0], value : arr[1] }
    } ), function ( a ) {
      return parseInt( a.value ) > -32760;
    } );
  },

  request_data : function( latlng, callback ) {
    var t1 = 0;
    var t2 = _.findLastIndex( this.findData( this.dapvar[1], 'time' ).data, function ( i ) {
      return true;
    } );
    var x1 = _.findLastIndex( this.findData( this.dapvar[1], 'latitude' ).data, function ( i ) {
      return i < latlng.lat
    } );
    var x2 = x1 + 1;
    var y1 = _.findLastIndex( this.findData( this.dapvar[1], 'longitude' ).data, function ( i ) {
      return i < latlng.lng
    } );
    var y2 = y1 + 1;
    this.request( this.url + ".dods?" + this.variable + "[" + t1 + ":1:" + t2 + "][" + y2 + ":1:" + y2 + "][" + x2 + ":1:" + x2 + "]",
                  function( err, data ) { callback( err, this.process( data ) ); }.bind( this ) );
  },

  containerChanged: function () {
    if ( this.container ) {
      var control = L.control.opendap( {
                                         chart   : this.$.chart,
                                         height  : this.height,
                                         width   : this.width,
                                         getData : this.request_data.bind( this )
                                       } );
      this.control = control;
      this.container.addControl( this.control );
    }
  },

  detached: function () {
    if ( this.container && this.control ) {
      this.container.removeControl( this.control );
    }
  }

} );
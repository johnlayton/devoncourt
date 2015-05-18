"use strict";

Polymer( 'leaflet-opendap-provider', {

  url      : "",

  provider: function( xhr ) {
    return function( url, callback ) {
      var options = {
        url: url, responseType: 'arraybuffer',
        callback: function ( buffer ) {
          callback( undefined, buffer );
        }
      };
      xhr.request( options );
    };
  },

  created : function () {
  },

  ready : function () {
  },

  urlChanged: function () {
    if ( this.url ) {
      this.kettstreet = kettstreet( {
        url       : this.url,
        provider  : this.provider( this.$.xhr )
      } );
    }
  }
} );
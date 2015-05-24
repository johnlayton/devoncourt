"use strict";

Polymer( 'leaflet-geojson-marker-template', {

  observe: {
    'container' : 'containerChanged'
  },

  created : function () {
    console.log( 'created leaflet-geojson-marker-template' );
  },

  formatJson : function( value ) {
    return JSON.stringify( value );
  }

} );
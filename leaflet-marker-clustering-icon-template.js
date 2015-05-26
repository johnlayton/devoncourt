"use strict";

Polymer( 'leaflet-marker-clustering-icon-template', {

  publish : {
    icon : ''
  },

  created : function () {
    console.log( 'created leaflet-marker-clustering-icon-template' );
  },

  iconChanged : function() {
    console.log( "icon changed -> " + this.icon );
  }
} );
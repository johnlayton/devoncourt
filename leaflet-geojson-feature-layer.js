"use strict";

Polymer( 'leaflet-geojson-feature-layer', {

  icon     : "",
  size     : [25,25],

  observe: {
    'container' : 'containerChanged'
  },

  publish : {
    layer : null
  },

  created : function () {
    console.log( 'created leaflet-geojson-feature-layer' );
  },

  containerChanged : function () {
    if ( this.container && this.url ) {

      var icon = this.icon;
      var size = this.size;

      this.$.xhr.request( { url : this.url, responseType: 'json',
        callback: function ( data ) {
          this.layer = L.geoJson( data, {
            onEachFeature: function ( feature, layer )
            {
              if ( feature.properties )
              {
                var popup = this.getElementsByTagName( 'leaflet-geojson-marker-template' )[0];
                var template = document.importNode( popup.children[0], true);
                //var template = document.importNode( popup, true);
                //template.feature = feature;
                template.properties = feature.properties;
                var div = document.createElement('div');
                div.appendChild( template );
                layer.bindPopup( div );
              }
            }.bind( this ),
            pointToLayer: function ( feature, latlng )
            {
              return L.marker( latlng, {
                icon: L.icon( { iconUrl: icon, iconSize: size } )
              } );
            }
          } );

          this.layer.url = this.url;
          this.container.addLayer( this.layer );

        }.bind( this )
      } );

      this.registerMapOnChildren();

    }
  },

  registerMapOnChildren: function() {
    for (var i = 0; i < this.children.length; i++) {
      this.children[i].container = this.container;
    }
    this.onMutation(this, this.registerMapOnChildren);
  },

  detached: function () {
    if ( this.container && this.layer ) {
      this.container.removeLayer( this.layer );
    }
  }
} );
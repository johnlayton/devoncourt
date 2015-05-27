"use strict";

Polymer( 'leaflet-geojson-feature-layer', {

  icon     : "",
  size     : [25,25],
  layer    : {},

  observe: {
    'container' : 'containerChanged'
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
              var template = document.importNode( this.querySelector( "template#popup" ), true);
              template.properties = feature.properties || {};
              var div = document.createElement('div');
              div.appendChild( template );
              layer.bindPopup( div );
            }.bind( this ),
            pointToLayer: function ( feature, latlng )
            {
              if ( this.querySelector( "template#icon" ) ) {
                var template = document.importNode( this.querySelector( "template#icon" ), true);
                template.properties = feature.properties || {};
                var div = document.createElement('div');
                div.appendChild( template );

                var icon = new L.HtmlIcon ( {
                                              html : div
                                              //className : '',
                                              //iconSize  : L.point ( 40, 40 )
                                            } );

                return L.marker( latlng, {
                  icon: icon //L.icon( { iconUrl: icon, iconSize: size } )
                } );
              } else {
                return L.marker( latlng, {
                  icon: L.icon( { iconUrl: icon, iconSize: size } )
                } );
              }
            }.bind( this )
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
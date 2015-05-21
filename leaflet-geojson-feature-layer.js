"user strict"

PolymerExpressions.prototype.formatJson = function ( input ) {
  return JSON.stringify( input, null, ' ' );
};

PolymerExpressions.prototype.formatDate = function ( input ) {
  return new Date( input );
};

Polymer( 'leaflet-geojson-feature-layer', {

  icon     : "",
  size     : [25,25],

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

      this.layer = L.layerGroup();
      this.container.addLayer( this.layer );

      this.$.xhr.request( { url : this.url, responseType: 'json',
        callback: function ( data ) {
          this.layer.addLayer( L.geoJson( data, {
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
          } ) );
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
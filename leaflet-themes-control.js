"user strict"

Polymer( 'leaflet-themes-control', {

  names : function( themes ) {
    return themes.names();
  },

  selectTheme: function(evt, detail) {
    this.theme = this.themes.theme( evt.srcElement.selected );
  },

  created : function () {
    this.themes = createThemes();
    //        this.theme = this.themes.theme( "jet" );
  }

} );
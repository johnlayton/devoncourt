"user strict"

Polymer( 'leaflet-opendap', {

  observe: {
    'container' : 'containerChanged'
  },

  created : function () {
    //debugger;
  },

  ready : function () {
    //var self = this;
    var themes = this.$.themes.getDistributedNodes();
    [].forEach.call(themes, function(theme, i) {
    }.bind(this));
  },

  currentChanged : function() {
    console.log( arguments );
  },

  themeChanged : function() {
    console.log( arguments );
  },

  kettstreetChanged : function () {
    console.log( this.kettstreet.das( function ( err, data ) {
      if ( err ) {
        console.log( err );
      }
      else {
        console.log( data );
      }
    } ) );
  },

  containerChanged: function() {
    this.$.layer.container = this.container;
    this.onMutation(this, this.containerChanged);
  }


} ) ;
"use strict";

Polymer( 'leaflet-opendap-chart', {

  observe: {
    'container' : 'containerChanged'
  },

  created : function () {
  },

  ready : function () {
    //var self = this;
    /*
     var themes = this.$.themes.getDistributedNodes();
     [].forEach.call(themes, function(theme, i) {
     }.bind(this));
     */
  },

  kettstreetChanged : function () {
    console.log( this.ketstreet );
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
    this.$.chart.container = this.container;
    this.onMutation(this, this.containerChanged);
  }

} ) ;

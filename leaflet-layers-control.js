"user strict"

Polymer( 'leaflet-layers-control', {

  created : function () {
  },

  ready : function () {
  },

  containerChanged : function () {
    if ( this.container ) {
      //debugger;

      //console.log( this.container.getLayers() );

      this.control = L.control.layers()
      //var config = {
      //  chart  : this.$.chart,
      //  height : this.height,
      //  width  : this.width,
      //  getData: this.request_data.bind( this )
      //};
      //var control = L.control.opendap( config );
      //this.control = control;
      this.container.addControl( this.control );
    }
  },

  detached : function () {
    if ( this.container && this.control ) {
      this.container.removeControl( this.control );
    }
  }
} );

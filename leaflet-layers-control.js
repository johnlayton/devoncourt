"user strict"

Polymer( 'leaflet-layers-control', {

  created : function () {
  },

  ready : function () {
    var observer = new MutationObserver(function(mutations) {
    }.bind(this));

    observer.observe(this, {childList: true, attributes: true});

    for (var i = 0; i < this.children.length; i++) {
      observer.observe(this.children[i], {childList: true, attributes: true, model :true});
    }

  },

  containerChanged : function () {
    if ( this.container ) {
      this.control = L.control.layers();
      this.container.addControl( this.control );
      //this.container.on('layeradd', function( e ) {
      //  this.addLayer( e.layer );
      //}, this);
      this.registerMapOnChildren();
    }
  },

  registerMapOnChildren: function() {
    for (var i = 0; i < this.children.length; i++) {
      this.children[i].container = this.container;
    }
    this.onMutation(this, this.registerMapOnChildren);
  },

  detached : function () {
    if ( this.container && this.control ) {
      this.container.removeControl( this.control );
    }
  },

  addLayer: function( layer ) {
    for ( var i = 0; i < this.children.length; i++ ) {
      if ( layer.url && layer.url.match( this.children[i].url ) ) {
        this.container.addLayer( layer );
        this.control.addOverlay( layer, this.children[i].name );
      }
    }
  }

} );

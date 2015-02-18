"user strict"

Polymer( 'leaflet-layers-control', {

  created : function () {
  },

  ready : function () {
    console.log( " leaflet-layers-control ready ");

    var observer = new MutationObserver(function(mutations) {
      console.log( mutations );
    }.bind(this));

    observer.observe(this, {childList: true, attributes: true});

    for (var i = 0; i < this.children.length; i++) {
      console.log( this.children[i].layer );
      console.log( this.children[i].name );
      console.log( this.children[i].model );

      observer.observe(this.children[i], {childList: true, attributes: true, model :true});
      //this.onMutation( this.children[i], function() {
      //  debugger;
      //} );
    }

  },

  //ready: function() {
  //  // Observe a single mutation.
  //  this.onMutation(this, this.childrenUpdated);
  //},
  //
  //childrenUpdated: function(observer, mutations) {
  //  mutations.forEach(function(record) {
  //    console.log(record.addedNodes);
  //  }.bind(this));
  //},

  containerChanged : function () {
    if ( this.container ) {

      //this.map = this.container;

      //debugger;

      //console.log( this.container.getLayers() );

      this.control = L.control.layers();
      //for (var i = 0; i < this.children.length; i++) {
      //  console.log( this.children[i].layer );
      //  console.log( this.children[i].name );
      //  this.control.addOverlay( this.children[i].layer, this.children[i].name );
      //}

      //var config = {
      //  chart  : this.$.chart,
      //  height : this.height,
      //  width  : this.width,
      //  getData: this.request_data.bind( this )
      //};
      //var control = L.control.opendap( config );
      //this.control = control;
      this.container.addControl( this.control );

      //console.log( this.$.markers );

      //for (var i = 0; i < this.children.length; i++) {
      //  var e = this.children[i];
      //  if (e.isLayer && e.isLayer()) {
      //    defaultLayerRequired = false;
      //  }
      //}
      //if (defaultLayerRequired) {
      //  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      //    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery &copy; <a href="http://mapbox.com">Mapbox</a>',
      //    maxZoom: 18
      //  }).addTo(this.map);
      //}

      this.registerMapOnChildren();

      //for (var i = 0; i < this.children.length; i++) {
      //  console.log( this.children[i].layer );
      //  console.log( this.children[i].name );
      //  console.log( this.children[i].model );
      //
      //  this.onMutation( this.children[i], function() {
      //    debugger;
      //  } );
      //}
      //this.onMutation(this, this.registerMapOnChildren);
    }
  },

  registerMapOnChildren: function() {
    for (var i = 0; i < this.children.length; i++) {
      this.children[i].container = this;

      console.log( this.children[i].layer );
      console.log( this.children[i].name );
      //
      //
      //this.control.addOverlay( this.children[i].layer, this.children[i].name );
    }
    this.onMutation(this, this.registerMapOnChildren);
  },

  detached : function () {
    if ( this.container && this.control ) {
      this.container.removeControl( this.control );
    }
  },

  addLayer: function( layer ) {
    for (var i = 0; i < this.children.length; i++) {
      console.log( this.children[i].url );
      console.log( layer.url );
      if ( layer.url.match( this.children[i].url ) ) {

        console.log( "Match...." );

        this.container.addLayer( layer );
        this.control.addOverlay( layer, this.children[i].name );
      }
    }
  }
} );

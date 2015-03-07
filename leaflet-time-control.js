"user strict"

L.Control.Time = L.Control.extend( {

  options: {},

  initialize: function ( options ) {
    L.setOptions( this, options );
  },

  onAdd: function ( map ) {
    var name = 'leaflet-control-time',
      container = L.DomUtil.create( 'div', name + ' leaflet-bar' );

    this._map = map;

    container.appendChild( this.options.ui );

    //this._svg = this._createSvg( 'inspect', this.options.chart );

    //map.on( 'mousemove', _.debounce( this._mouseMove.bind( this ), 200 ), this );

    console.log( "Add to Map " + container );

    return container;
  }

} );

L.Map.mergeOptions({
  timeControl: false
});

L.Map.addInitHook(function () {
  if (this.options.timeControl) {
    this.timeControl = new L.Control.Time();
    this.addControl(this.timeControl);
  }
});

L.control.time = function ( options ) {
  return new L.Control.Time( options );
};




Polymer( 'leaflet-time-control', {

  created : function () {
  },

  toMoment : function ( value ) {
    return moment( parseInt( value ) * 1000 ).format( "HH:mm DD-MMM-YYYY" );
  },

  containerChanged : function () {
    if ( this.container ) {
      this.control = L.control.time( {
        ui : this.$.time
      } );
      this.container.addControl( this.control );
    }
  },

  detached : function () {
    if ( this.container && this.control ) {
      this.container.removeControl( this.control );
    }
  }

} );
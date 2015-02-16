"use strict";

L.TileLayer.OpenDAP = L.Class.extend( {

  options: {
    opacity : 1
  },

  initialize: function ( options ) {
    L.setOptions( this, options );
    this.data = [];
  },

  findData: function( data, name ) {
    return _.find( data, function( i ) { return i.das.name == name } ).data;
  },

  process_data: function( variable, data ) {

    var all_data = this.findData( data, variable );
    var var_data = this.findData( all_data, variable );

    var result = [];
    //var times = this.findData( all_data, 'time' );
    var latitudes = this.findData( all_data, 'latitude' );
    var longitudes = this.findData( all_data, 'longitude' );

    for ( var time = 0; time < var_data.length ; time++ ) {
      var d1 = var_data[0];
      for ( var lat = 0; lat < d1.length; lat++ ) {
        var d2 = d1[lat];
        for ( var lng = 0; lng < d2.length; lng++ ) {
          var _lat = latitudes[lat];
          var _lng = longitudes[lng];
          result.push( [ _lat, _lng, d2[lng] ] );
        }
      }
    }
    return {
      data: result,
      rows: latitudes.length,
      cols: longitudes.length
    };
  },

  onAdd: function ( map ) {
    this.map = map;
    var mapsize = map.getSize();
    var options = this.options;

    var canvas = options.canvas;
    canvas.id = 'webgl-leaflet-' + L.Util.stamp( this );
    canvas.width = mapsize.x;
    canvas.height = mapsize.y;
    canvas.style.opacity = options.opacity;
    canvas.style.position = 'absolute';

    map.getPanes().overlayPane.appendChild( canvas );

    var config = {
      canvas  : canvas,
      fragment: options.fragment,
      vertex  : options.vertex
    };
    this.overlay = createOverlay( config );

    this.canvas = canvas;

    this._createTimeSlider();
    this._createThresholdSlider();

    this._currentTime = moment();
    this._currentThreshold = 0;

    map.on( "move", this._update, this );

    /* hide layer on zoom, because it doesn't animate zoom */
    map.on( "zoomstart", this._hide, this );
    map.on( "zoomend", this._show, this );
    map.on( "resize", this._update, this );

  },

  onRemove: function ( map ) {
    map.getPanes().overlayPane.removeChild( this.canvas );
    map.off( "move", this._plot, this );
    map.off( "zoomstart", this._hide, this );
    map.off( "zoomend", this._show, this );
  },

  _createTimeSlider: function() {
    var slider = this.options.time.slider;
    var stop = L.DomEvent.stopPropagation;
    this.options.kettstreet.dim( "time", function( err, data ) {
      slider.step = 60 * 60;
      var times = this.findData( data, 'time' );
      slider.min = times[0];
      slider.max = times[times.length - 1];
      slider.value = parseInt( moment().unix() );
      this._rollTime( { target: { value: parseInt( moment().unix() ) } } )
    }.bind( this ) );

    L.DomEvent
      .on(slider, 'click',     stop)
      .on(slider, 'mousedown', stop)
      .on(slider, 'dblclick',  stop)
      //.on(slider, 'change',    L.DomEvent.preventDefault)
      .on(slider, 'immediate-value-change',    this._rollTime, this);
      //.on(slider, 'input',     this._rollTime, this);
      //.on(slider, 'change',    this._rollTime, this);

    return slider;
  },

  _createThresholdSlider: function() {
    var slider = this.options.threshold.slider;
    var stop = L.DomEvent.stopPropagation;

    this.options.kettstreet.das( function( err, data ) {
      slider.step = 1;
      slider.min = parseInt( data[this.options.variable].attributes['valid_min'] );
      slider.max = parseInt( data[this.options.variable].attributes['valid_max'] );
      slider.value = slider.min;
    }.bind( this ) );

    L.DomEvent
      .on(slider, 'click',     stop)
      .on(slider, 'mousedown', stop)
      .on(slider, 'dblclick',  stop)
      .on(slider, 'change',    L.DomEvent.preventDefault)
      .on(slider, 'input',     this._updateThreshold, this);
      //.on(slider, 'change',    this._updateThreshold, this);

    return slider;
  },

  _updateThreshold: function( e ) {
    this._currentThreshold = e.target.value;
    this._plot();
  },

  _rollTime: function(e) {
    //this._currentTime = moment( parseInt( e.target.value ) * 1000 );
    this._currentTime = moment( parseInt( this.options.time.slider.immediateValue ) * 1000 );
    //console.log( moment( parseInt( this.options.time.slider.immediateValue ) * 1000 ) );
    //console.log( this._currentTime );
    this._update();
  },

  _rollTime_2 : function ( e ) {
    this._currentTime = moment( parseInt( e.target.value ) * 1000 );
    this._update();
  },

  _update: function() {
    var sth = this.map.getBounds().getSouth(),
        nth = this.map.getBounds().getNorth(),
        est = this.map.getBounds().getEast(),
        wst = this.map.getBounds().getWest();
    var variable = this.options.variable;
    var query = {
      time     : {
        min: this._currentTime.unix(),
        max: this._currentTime.unix(),
        step: 1
      },
      latitude : {
        min : sth,
        max : nth,
        step: 2
      },
      longitude: {
        min : wst,
        max : est,
        step: 2
      }
    };
    this.options.kettstreet.dap( variable, query, function( err, resp ){
      var data = this.process_data( variable, resp );
      this.rows = data.rows;
      this.cols = data.cols;
      this.data = data.data;
      this._plot();
    }.bind( this ) );
  },

  _hide: function () {
    this.canvas.style.display = 'none';
  },

  _show: function () {
    this.canvas.style.display = 'block';
  },

  _clear: function () {
    var overlay = this.overlay;
    overlay.clear();
    overlay.display( this.map );
  },

  _resizeRequest: undefined,

  _plot: function () {
    this.active = true;
    var map = this.map;
    if ( this._resizeRequest !== map._resizeRequest ) {
      this.resize();
      this._resizeRequest = map._resizeRequest;
    }
    var overlay = this.overlay;
    overlay.clear();
    L.DomUtil.setPosition( this.canvas, map.latLngToLayerPoint( map.getBounds().getNorthWest() ) );
    var dataLen = this.data.length;
    if ( dataLen ) {
      var data = [];
      for ( var i = 0; i < dataLen; i++ ) {
        var dataVal = this.data[i],
          latlng = new L.LatLng( dataVal[0], dataVal[1] ),
          point = map.latLngToContainerPoint( latlng );
        data.push( [ Math.floor( point.x ), Math.floor( point.y ), dataVal[2] ] );
      }
      overlay.update( { min: this._currentThreshold } );
      overlay.display( data, this.rows, this.cols );
    }
  },

  resize: function () {
    //helpful for maps that change sizes
    var mapsize = this.map.getSize();
    this.canvas.width = mapsize.x;
    this.canvas.height = mapsize.y;

    this.overlay.resize();
  },

  update: function () {
    this._plot();
  }
} );

L.layer = function ( options ) {
};

L.layer.opendap = function ( options ) {
  return new L.TileLayer.OpenDAP( options );
};

Polymer( 'leaflet-opendap-layer', {

  url : "", variable : "",

/*
  toMoment: {
    toDOM: function(value) {
      console.log( "toDOM = " + value );

      console.log( this.seconds );
      return moment( value ).format("ddd, hA");
    },
    toModel: function(value) {
      console.log( "toModel = " + value );
      console.log( this.seconds );
      return moment( value ).format("ddd, hA");
    }
  },
*/
  toMoment: function(value) {
    //console.log( "toDOM = " + value );
    //console.log( this.seconds );
    //console.log( moment( parseInt( value ) * 1000 ) );
    return moment( parseInt( value ) * 1000 ).format("ddd, hA");
    //return value;
  },

  provider: function( xhr ) {
    return function( url, callback ) {
      var options = {
        url: url, responseType: 'arraybuffer',
        callback: function ( buffer ) {
          callback( undefined, buffer );
        }
      };
      xhr.request( options );
    };
  },

  created: function () {
  },

  containerChanged: function () {
    if ( this.container ) {
      var config = {
        url     : this.url,
        provider: this.provider( this.$.xhr )
      };
      var options = {
        variable  : this.variable,
        canvas    : this.$.canvas,
        time      : {
          slider: this.$.time
        },
        threshold : {
          slider: this.$.threshold
        },
        fragment  : this.$.fragment,
        vertex    : this.$.points,
        kettstreet: kettstreet( config )
      };
      this.layer = new L.layer.opendap( options );
      this.container.addLayer( this.layer );
    }
  },

  detached: function () {
    if ( this.container && this.layer ) {
      this.container.removeControl( this.layer );
    }
  }
} );

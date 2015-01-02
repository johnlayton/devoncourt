"use strict";

L.Control.OpenDAP = L.Control.extend({

  options: {},

  initialize: function (options) {
    L.setOptions(this, options);
  },

  onAdd: function (map) {
    var name = 'leaflet-control-opendap',
      container = L.DomUtil.create('div', name + ' leaflet-bar');

    this._map = map;
    this._svg = this._createSvg( 'inspect', this.options.getContainer() );

    map.on('mousemove', _.debounce( this._mouseMove.bind( this ), 200 ), this );

    return container;
  },

  onRemove: function (map) {
  },

  _mouseMove : function(event) {
    this.options.getData( event.latlng, function( data ) {

      var d = data;

      var width = this.width;
      var height = this.height;

      var x = d3.time.scale()
        .range( [0, width] );

      var y = d3.scale.linear()
        .range( [height, 0] );

      var xAxis = d3.svg.axis()
        .scale( x )
        .orient( "bottom" );

      var yAxis = d3.svg.axis()
        .scale( y )
        .orient( "left" );

      var line = d3.svg.line()
        .x( function ( d ) { return x( d.date ); } )
        .y( function ( d ) { return y( d.value ); } );

      x.domain( d3.extent( d, function ( d ) {
        return d.date;
      } ) );
      y.domain( d3.extent( d, function ( d ) {
        return d.value;
      } ) );

      var svg = this._svg;

      svg.selectAll( "g" ).remove();
      svg.append( "g" )
        .attr( "class", "x axis" )
        .attr( "transform", "translate(0," + height + ")" )
        .call( xAxis );

      svg.append( "g" )
        .attr( "class", "y axis" )
        .call( yAxis )
        .append( "text" )
        .attr( "transform", "rotate(-90)" )
        .attr( "y", 6 )
        .attr( "dy", ".71em" )
        .style( "text-anchor", "end" );

      svg.append( "g" )
          .attr( "class", "data" )
          .append( "path" )
            .datum( d )
            .attr( "class", "line" )
            .attr( "d", line );

    }.bind( this ) );
  },

  _createSvg : function( className, container ) {

    var inspect = L.DomUtil.create('div', className, container);

    var margin = this.margin = this.options.margin || {top : 20, right : 20, bottom : 30, left : 50},
      width = this.width = ( this.options.width || 600 ) - margin.left - margin.right,
      height = this.height = ( this.options.height || 300 ) - margin.top - margin.bottom;


    var svg = this._svg = d3.select( inspect ).append( "svg" )
      .attr( "width", width + margin.left + margin.right )
      .attr( "height", height + margin.top + margin.bottom )
      .append( "g" )
      .attr( "transform", "translate(" + margin.left + "," + margin.top + ")" );

    return svg;
  }
});

L.Map.mergeOptions({
  opendapControl: false
});

L.Map.addInitHook(function () {
  if (this.options.opendapControl) {
    this.opendapControl = new L.Control.OpenDAP();
    this.addControl(this.opendapControl);
  }
});

L.control.opendap = function (options) {
  return new L.Control.OpenDAP(options);
};


Polymer( 'leaflet-opendap-control', {
  position: "bottomleft",

  url: "",

  dim: "",

  request : function( url, callback ) {
    this.$.xhr.request( { url: url, responseType: 'arraybuffer', callback: function( buffer ) {
      callback( jsdap( buffer ) );
    } } );
  },

  created: function () {

  },

  ready: function () {
    this.request( this.url + '.dods?time,latitude,longitude',
                  function( data ) { this.dapvar =  data; }.bind( this ) )
  },

  findData: function( data, name ) {
    return _.find( data, function( i ) { return i.var.name == name } ).data;
  },

  process: function( data ) {
    var dim_data = this.findData( data[1], this.dim );
    var values = _.flatten( this.findData( dim_data, this.dim ) );
    var dates = _.map( this.findData( dim_data, 'time' ), function ( val ) {
      return moment( val * 1000 ).toDate();
    } ) ;
    var d = _.filter( _.map( _.zip( dates, values ), function ( arr ) {
      return { date : arr[0], value : arr[1] }
    } ), function ( a ) {
      return parseInt( a.value ) > -32760;
    } );
    return d;
  },

  request_data : function( latlng, callback ) {
    var t1 = 0;
    var t2 = _.findLastIndex( this.findData( this.dapvar[1], 'time' ).data, function ( i ) {
      return true;
    } );
    var x1 = _.findLastIndex( this.findData( this.dapvar[1], 'latitude' ).data, function ( i ) {
      return i < latlng.lat
    } );
    var x2 = x1 + 1;
    var y1 = _.findLastIndex( this.findData( this.dapvar[1], 'longitude' ).data, function ( i ) {
      return i < latlng.lng
    } );
    var y2 = y1 + 1;
    this.request( this.url + ".dods?" + this.dim + "[" + t1 + ":1:" + t2 + "][" + y2 + ":1:" + y2 + "][" + x2 + ":1:" + x2 + "]",
                  function( data ) { callback( this.process( data ) ); }.bind( this ) );
  },

  containerChanged: function () {
    if ( this.container ) {
      var control = L.control.opendap( {
        getContainer: function() { return this.$.chart; }.bind( this ),
        getData: this.request_data.bind( this )
      } );
      this.control = control;
      this.container.addControl( this.control );
    }
  },

  detached: function () {
    if ( this.container && this.control ) {
      this.container.removeControl( this.control );
    }
  }

} );
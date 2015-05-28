"use strict";

L.Control.OpenDAP = L.Control.extend( {

  options: {},

  initialize: function ( options ) {
    L.setOptions( this, options );
  },

  onAdd: function ( map ) {
    var name = 'leaflet-control-chart',
      container = L.DomUtil.create( 'div', name + ' leaflet-bar' );

    this._map = map;
    this._svg = this._createSvg( 'inspect', this.options.chart );

    map.on( 'mousemove', _.debounce( this._mouseMove.bind( this ), 200 ), this );

    return container;
  },

  onRemove: function ( map ) {
  },

  findData: function( data, name ) {
    return _.find( data, function( i ) { return i.das.name == name } ).data;
  },

  process_data : function ( data ) {
    var dim_data = this.findData( data, this.options.variable );
    //var values = _.flatten( this.findData( dim_data, this.options.variable ) );
    var values = _.map( this.findData( dim_data, this.options.variable ), function( val ) {
      return val[0][0];
    } );
    var dates = _.map( this.findData( dim_data, 'time' ), function ( val ) {
      return moment( val * 1000 ).toDate();
    } );
    return _.filter( _.map( _.zip( dates, values ), function ( arr ) {
      return {date : arr[0], value : arr[1]}
    } ), function ( a ) {
      return parseInt( a.value ) > -32760;
    } );
  },

  _mouseMove: function ( event ) {
    var variable = this.options.variable;
    var query = {
      time     : {step: 1},
      latitude : {min: event.latlng.lat, max: event.latlng.lat, step: 1},
      longitude: {min: event.latlng.lng, max: event.latlng.lng, step: 1}
    };

    this.options.kettstreet.dap( variable, query, function ( err, data) {
      var d = this.process_data( data );

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
        .x( function ( d ) {
              return x( d.date );
            } )
        .y( function ( d ) {
              return y( d.value );
            } );

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

  _createSvg: function ( className, container ) {

    var inspect = L.DomUtil.create( 'div', className, container );

    var margin = this.margin =
                 this.options.margin ||
                 {top: 20, right: 20, bottom: 30, left: 50},
      width = this.width =
              ( this.options.width || 600 ) - margin.left - margin.right,
      height = this.height =
               ( this.options.height || 300 ) - margin.top - margin.bottom;

    var svg = this._svg = d3.select( inspect ).append( "svg" )
      .attr( "width", width + margin.left + margin.right )
      .attr( "height", height + margin.top + margin.bottom )
      .append( "g" )
      .attr( "transform", "translate(" + margin.left + "," + margin.top + ")" );

    return svg;
  }
} );

L.Map.mergeOptions( {
  opendapChart: false
} );

L.Map.addInitHook( function () {
  if ( this.options.opendapChart ) {
    this.opendapChart = new L.Control.OpenDAP();
    this.addControl( this.opendapChart );
  }
} );

L.control.opendap = function ( options ) {
  return new L.Control.OpenDAP( options );
};

Polymer( 'leaflet-opendap-chart-control', {

  variable : "",
  position : "bottomright",
  height : 300,
  width : 500,

  observe: {
    'container kettstreet' : 'containerChanged'
  },


  created : function () {
  },

  containerChanged : function () {
    if ( this.container && this.kettstreet ) {
      console.log( this.kettstreet.das( function ( err, data ) {
        if ( err ) {
          console.log( err );
        }
        else {
          console.log( data );
        }
      } ) );

      var options = {
        chart      : this.$.chart,
        height     : this.height,
        width      : this.width,
        variable   : this.variable,
        kettstreet : this.kettstreet
      };

      this.control = L.control.opendap( options );
      this.container.addControl( this.control );
    }
  },

  detached : function () {
    if ( this.container && this.control ) {
      this.container.removeControl( this.control );
    }
  }
} );

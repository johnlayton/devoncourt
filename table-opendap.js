"use strict";

Polymer( 'table-opendap', {

  times: [],
  latitudes: [],
  longitudes: [],

  step : {
    time : 1,
    lat  : 5,
    lng  : 5
  },

  data: [],

  observe: {
    'kettstreet theme' : 'kettstreetChanged'
  },

  created: function () {
  },

  ready: function () {
  },

  toMoment: function(value) {
    return moment.unix( value ).format("HH:mm DD-MMM-YYYY");
  },

  toShortForm: function( value ) {
    return Math.round( value * 100 ) / 100;
  },

  toColour: function( value ) {
    if ( this.theme ) {
      return "rgb(" + this.theme.colour( parseFloat( value ) ).join(",")  + ")"
    } else {
      return 'lightblue';
    }
  },

  asList : function( value ) {

    console.log( value );

    return value.join(',');
  },

/*
  ready : function () {
    //var self = this;
    var themes = this.$.themes.getDistributedNodes();
    [].forEach.call(themes, function(theme, i) {
    }.bind(this));
  },
*/

  //currentChanged : function() {
  //  console.log( arguments );
  //},
  //
  //themeChanged : function() {
  //  console.log( arguments );
  //},

  stepChanged : function() {
    console.log( this.step );
  },

  kettstreetChanged : function () {

    if ( this.kettstreet && this.kettstreet.dim && this.theme && this.step ) {

      this.kettstreet.dim( 'time,latitude,longitude', function( err, data ) {

        var times      = data[0].data;
        var latitudes  = data[1].data.reverse();
        var longitudes = data[2].data;

        var step = this.step;

        console.log( "**************************" );
        console.log( step );
        console.log( step['time'] );
        console.log( step.lat );
        console.log( step.lng );
        console.log( "**************************" );

        //debugger;

        var query = {
          time : {
            min  : times[0],
            max  : times[0],
            step : step.time || 1
          },
          latitude : {
            max : latitudes[0],
            min : latitudes[latitudes.length - 1],
            step: step.lat || 2
          },
          longitude: {
            min : longitudes[0],
            max : longitudes[longitudes.length - 1],
            step: step.lng || 2
          }
        };

        this.kettstreet.dap( this.variable, query, function( err, data) {
          this.data = data[0].data[0].data[0].reverse();
          this.times = data[0].data[1].data;
          this.latitudes = data[0].data[2].data.reverse();
          this.longitudes = data[0].data[3].data;
        }.bind( this ) )

      }.bind( this ) );
    }
  }

} ) ;
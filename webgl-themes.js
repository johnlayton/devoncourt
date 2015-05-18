(function ( root, factory ) {
  if ( typeof exports === 'object' ) {
    module.exports = factory();
  }
  else if ( typeof define === 'function' && define.amd ) {
    define( [], factory );
  }
  else {
    createThemes = factory();
  }
}( this, function () {

  var themes = {
    "jet"       : [{"index" : 0, "rgb" : [0, 0, 131]},
                   {"index" : 0.125, "rgb" : [0, 60, 170]},
                   {"index" : 0.375, "rgb" : [5, 255, 255]},
                   {"index" : 0.625, "rgb" : [255, 255, 0]},
                   {"index" : 0.875, "rgb" : [250, 0, 0]},
                   {"index" : 1, "rgb" : [128, 0, 0, 0.6]}],
    "hsv"       : [{"index" : 0, "rgb" : [255, 0, 0]},
                   {"index" : 0.169, "rgb" : [253, 255, 2]},
                   {"index" : 0.173, "rgb" : [247, 255, 2]},
                   {"index" : 0.337, "rgb" : [0, 252, 4]},
                   {"index" : 0.341, "rgb" : [0, 252, 10]},
                   {"index" : 0.506, "rgb" : [1, 249, 255]},
                   {"index" : 0.671, "rgb" : [2, 0, 253]},
                   {"index" : 0.675, "rgb" : [8, 0, 253]},
                   {"index" : 0.839, "rgb" : [255, 0, 251]},
                   {"index" : 0.843, "rgb" : [255, 0, 245]},
                   {"index" : 1, "rgb" : [255, 0, 6]}],
    "hot"       : [{"index" : 0, "rgb" : [0, 0, 0]},
                   {"index" : 0.3, "rgb" : [230, 0, 0]},
                   {"index" : 0.6, "rgb" : [255, 210, 0]},
                   {"index" : 1, "rgb" : [255, 255, 255]}],
    "cool"      : [{"index" : 0, "rgb" : [0, 255, 255]},
                   {"index" : 1, "rgb" : [255, 0, 255]}],
    "spring"    : [{"index" : 0, "rgb" : [255, 0, 255]},
                   {"index" : 1, "rgb" : [255, 255, 0]}],
    "summer"    : [{"index" : 0, "rgb" : [0, 128, 102]},
                   {"index" : 1, "rgb" : [255, 255, 102]}],
    "autumn"    : [{"index" : 0, "rgb" : [255, 0, 0]},
                   {"index" : 1, "rgb" : [255, 255, 0]}],
    "winter"    : [{"index" : 0, "rgb" : [0, 0, 255]},
                   {"index" : 1, "rgb" : [0, 255, 128]}],
    "bone"      : [{"index" : 0, "rgb" : [0, 0, 0]},
                   {"index" : 0.376, "rgb" : [84, 84, 116]},
                   {"index" : 0.753, "rgb" : [169, 200, 200]},
                   {"index" : 1, "rgb" : [255, 255, 255]}],
    "copper"    : [{"index" : 0, "rgb" : [0, 0, 0]},
                   {"index" : 0.804, "rgb" : [255, 160, 102]},
                   {"index" : 1, "rgb" : [255, 199, 127]}],
    "greys"     : [{"index" : 0, "rgb" : [0, 0, 0]},
                   {"index" : 1, "rgb" : [255, 255, 255]}],
    "yignbu"    : [{"index" : 0, "rgb" : [8, 29, 88]},
                   {"index" : 0.125, "rgb" : [37, 52, 148]},
                   {"index" : 0.25, "rgb" : [34, 94, 168]},
                   {"index" : 0.375, "rgb" : [29, 145, 192]},
                   {"index" : 0.5, "rgb" : [65, 182, 196]},
                   {"index" : 0.625, "rgb" : [127, 205, 187]},
                   {"index" : 0.75, "rgb" : [199, 233, 180]},
                   {"index" : 0.875, "rgb" : [237, 248, 217]},
                   {"index" : 1, "rgb" : [255, 255, 217]}],
    "greens"    : [{"index" : 0, "rgb" : [0, 68, 27]},
                   {"index" : 0.125, "rgb" : [0, 109, 44]},
                   {"index" : 0.25, "rgb" : [35, 139, 69]},
                   {"index" : 0.375, "rgb" : [65, 171, 93]},
                   {"index" : 0.5, "rgb" : [116, 196, 118]},
                   {"index" : 0.625, "rgb" : [161, 217, 155]},
                   {"index" : 0.75, "rgb" : [199, 233, 192]},
                   {"index" : 0.875, "rgb" : [229, 245, 224]},
                   {"index" : 1, "rgb" : [247, 252, 245]}],
    "yiorrd"    : [{"index" : 0, "rgb" : [128, 0, 38]},
                   {"index" : 0.125, "rgb" : [189, 0, 38]},
                   {"index" : 0.25, "rgb" : [227, 26, 28]},
                   {"index" : 0.375, "rgb" : [252, 78, 42]},
                   {"index" : 0.5, "rgb" : [253, 141, 60]},
                   {"index" : 0.625, "rgb" : [254, 178, 76]},
                   {"index" : 0.75, "rgb" : [254, 217, 118]},
                   {"index" : 0.875, "rgb" : [255, 237, 160]},
                   {"index" : 1, "rgb" : [255, 255, 204]}],
    "bluered"   : [{"index" : 0, "rgb" : [0, 0, 255]},
                   {"index" : 1, "rgb" : [255, 0, 0]}],
    "rdbu"      : [{"index" : 0, "rgb" : [5, 10, 172]},
                   {"index" : 0.35, "rgb" : [106, 137, 247]},
                   {"index" : 0.5, "rgb" : [190, 190, 190]},
                   {"index" : 0.6, "rgb" : [220, 170, 132]},
                   {"index" : 0.7, "rgb" : [230, 145, 90]},
                   {"index" : 1, "rgb" : [178, 10, 28]}],
    "picnic"    : [{"index" : 0, "rgb" : [0, 0, 255]},
                   {"index" : 0.1, "rgb" : [51, 153, 255]},
                   {"index" : 0.2, "rgb" : [102, 204, 255]},
                   {"index" : 0.3, "rgb" : [153, 204, 255]},
                   {"index" : 0.4, "rgb" : [204, 204, 255]},
                   {"index" : 0.5, "rgb" : [255, 255, 255]},
                   {"index" : 0.6, "rgb" : [255, 204, 255]},
                   {"index" : 0.7, "rgb" : [255, 153, 255]},
                   {"index" : 0.8, "rgb" : [255, 102, 204]},
                   {"index" : 0.9, "rgb" : [255, 102, 102]},
                   {"index" : 1, "rgb" : [255, 0, 0]}],
    "rainbow"   : [{"index" : 0, "rgb" : [150, 0, 90]},
                   {"index" : 0.125, "rgb" : [0, 0, 200]},
                   {"index" : 0.25, "rgb" : [0, 25, 255]},
                   {"index" : 0.375, "rgb" : [0, 152, 255]},
                   {"index" : 0.5, "rgb" : [44, 255, 150]},
                   {"index" : 0.625, "rgb" : [151, 255, 0]},
                   {"index" : 0.75, "rgb" : [255, 234, 0]},
                   {"index" : 0.875, "rgb" : [255, 111, 0]},
                   {"index" : 1, "rgb" : [255, 0, 0]}],
    "portland"  : [{"index" : 0, "rgb" : [12, 51, 131]},
                   {"index" : 0.25, "rgb" : [10, 136, 186]},
                   {"index" : 0.5, "rgb" : [242, 211, 56]},
                   {"index" : 0.75, "rgb" : [242, 143, 56]},
                   {"index" : 1, "rgb" : [217, 30, 30]}],
    "blackbody" : [{"index" : 0, "rgb" : [0, 0, 0]},
                   {"index" : 0.2, "rgb" : [230, 0, 0]},
                   {"index" : 0.4, "rgb" : [230, 210, 0]},
                   {"index" : 0.7, "rgb" : [255, 255, 255]},
                   {"index" : 1, "rgb" : [160, 200, 255]}],
    "earth"     : [{"index" : 0, "rgb" : [0, 0, 130]},
                   {"index" : 0.1, "rgb" : [0, 180, 180]},
                   {"index" : 0.2, "rgb" : [40, 210, 40]},
                   {"index" : 0.4, "rgb" : [230, 230, 50]},
                   {"index" : 0.6, "rgb" : [120, 70, 20]},
                   {"index" : 1, "rgb" : [255, 255, 255]}],
    "electric"  : [{"index" : 0, "rgb" : [0, 0, 0]},
                   {"index" : 0.15, "rgb" : [30, 0, 100]},
                   {"index" : 0.4, "rgb" : [120, 0, 100]},
                   {"index" : 0.6, "rgb" : [160, 90, 0]},
                   {"index" : 0.8, "rgb" : [230, 200, 0]},
                   {"index" : 1, "rgb" : [255, 250, 220]}],
    "alpha"     : [{"index" : 0, "rgb" : [255, 255, 255, 0]},
                   {"index" : 0, "rgb" : [255, 255, 255, 1]}]
  };

  var Theme = (function(){
    var Theme = function( name, colours ) {

      //var name = name;
      var colours = colours;
      var name = name;
      var options = {};

      //var findLast = function( arr, otherwise, callback ) {
      //  for ( var i = arr.length - 1; i > 0; --i ) {
      //    if( callback( arr[i] ) ) {
      //      return arr[i];
      //    }
      //  }
      //  return otherwise;
      //};

      this.color = function( i ) {
        if ( i > ( options.min || 0 ) ) {
          var res = _.findLast( colours, function( ent ) {
              return ent.index < ( i / 40 );
            } ).rgb || [0.0, 0.0, 0.0];
          return res;
        }
        else {
          return [0.0, 0.0, 0.0];
        }

        //if ( i > ( options.min || 0 ) ) {
        //  var res = _.findLast( colours,  { "rgb" : [0.0, 0.0, 0.0] }, function( ent ) {
        //      return ent.index < ( i / 40 );
        //  } );
        //  //console.log( "Color :: " + res );
        //  var u = res.rgb; //.concat([0.6]);
        //  console.log( res );
        //  console.log( u );
        //  return u;
        //}
        //else {
        //  return [0.0, 0.0, 0.0];
        //}
      };



      //var rgb = function ( options, i ) {
      //  if ( i > ( options.min || 0 ) ) {
      //    var res = _.findLast( options.themes.theme(), function( ent ) {
      //        return ent.index < ( i / 40 );
      //      } ).rgb || [0.0, 0.0, 0.0, 0.0];
      //    return res;
      //  }
      //  else {
      //    return [0.0, 0.0, 0.0, 0.0];
      //  }
      //};

      //this.name = name;
    };

    return Theme;
  })();

  var Themes = (function () {
    var Themes = function ( options ) {

      //debugger;

      this.options = options;
      //this.select = function( theme ) {
      //  selected = theme;
      //};
      //
      //this.theme = function() {
      //  return themes[selected];
      //}
      //var createThemes = function( t ) {
      //  var result = [];
      //  for (var n in t) {
      //    if( t.hasOwnProperty( n ) ) {
      //      result.push( new Theme( n, t[n] ) );
      //    }
      //  }
      //  return result;
      //};
      //
      //this.themes = createThemes( base );

      //debugger;

      this.names = function() {
        return Object.keys( themes );
      };

      this.theme = function( name ) {
        return new Theme( name, themes[name] );
      };
    };

    //var selected = 'jet';

    //Themes.themes = createThemes( themes );

    return Themes;
  })();

  return function ( options ) {
    return new Themes( options );
  };

} ));
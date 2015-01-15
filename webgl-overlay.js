(function ( root, factory ) {
  if ( typeof exports === 'object' ) {
    module.exports = factory();
  }
  else if ( typeof define === 'function' && define.amd ) {
    define( [], factory );
  }
  else {
    createOverlay = factory();
  }
}( this, function () {

  var themes = {
    "jet"      : [{"index": 0, "rgb": [0, 0, 131, 0.6]},
                  {"index": 0.125, "rgb": [0, 60, 170, 0.6]},
                  {"index": 0.375, "rgb": [5, 255, 255, 0.6]},
                  {"index": 0.625, "rgb": [255, 255, 0, 0.6]},
                  {"index": 0.875, "rgb": [250, 0, 0, 0.6]},
                  {"index": 1, "rgb": [128, 0, 0, 0.6]}],
    "hsv"      : [{"index": 0, "rgb": [255, 0, 0]},
                  {"index": 0.169, "rgb": [253, 255, 2]},
                  {"index": 0.173, "rgb": [247, 255, 2]},
                  {"index": 0.337, "rgb": [0, 252, 4]},
                  {"index": 0.341, "rgb": [0, 252, 10]},
                  {"index": 0.506, "rgb": [1, 249, 255]},
                  {"index": 0.671, "rgb": [2, 0, 253]},
                  {"index": 0.675, "rgb": [8, 0, 253]},
                  {"index": 0.839, "rgb": [255, 0, 251]},
                  {"index": 0.843, "rgb": [255, 0, 245]},
                  {"index": 1, "rgb": [255, 0, 6]}],
    "hot"      : [{"index": 0, "rgb": [0, 0, 0]},
                  {"index": 0.3, "rgb": [230, 0, 0]},
                  {"index": 0.6, "rgb": [255, 210, 0]},
                  {"index": 1, "rgb": [255, 255, 255]}],
    "cool"     : [{"index": 0, "rgb": [0, 255, 255]},
                  {"index": 1, "rgb": [255, 0, 255]}],
    "spring"   : [{"index": 0, "rgb": [255, 0, 255]},
                  {"index": 1, "rgb": [255, 255, 0]}],
    "summer"   : [{"index": 0, "rgb": [0, 128, 102]},
                  {"index": 1, "rgb": [255, 255, 102]}],
    "autumn"   : [{"index": 0, "rgb": [255, 0, 0]},
                  {"index": 1, "rgb": [255, 255, 0]}],
    "winter"   : [{"index": 0, "rgb": [0, 0, 255]},
                  {"index": 1, "rgb": [0, 255, 128]}],
    "bone"     : [{"index": 0, "rgb": [0, 0, 0]},
                  {"index": 0.376, "rgb": [84, 84, 116]},
                  {"index": 0.753, "rgb": [169, 200, 200]},
                  {"index": 1, "rgb": [255, 255, 255]}],
    "copper"   : [{"index": 0, "rgb": [0, 0, 0]},
                  {"index": 0.804, "rgb": [255, 160, 102]},
                  {"index": 1, "rgb": [255, 199, 127]}],
    "greys"    : [{"index": 0, "rgb": [0, 0, 0]},
                  {"index": 1, "rgb": [255, 255, 255]}],
    "yignbu"   : [{"index": 0, "rgb": [8, 29, 88]},
                  {"index": 0.125, "rgb": [37, 52, 148]},
                  {"index": 0.25, "rgb": [34, 94, 168]},
                  {"index": 0.375, "rgb": [29, 145, 192]},
                  {"index": 0.5, "rgb": [65, 182, 196]},
                  {"index": 0.625, "rgb": [127, 205, 187]},
                  {"index": 0.75, "rgb": [199, 233, 180]},
                  {"index": 0.875, "rgb": [237, 248, 217]},
                  {"index": 1, "rgb": [255, 255, 217]}],
    "greens"   : [{"index": 0, "rgb": [0, 68, 27]},
                  {"index": 0.125, "rgb": [0, 109, 44]},
                  {"index": 0.25, "rgb": [35, 139, 69]},
                  {"index": 0.375, "rgb": [65, 171, 93]},
                  {"index": 0.5, "rgb": [116, 196, 118]},
                  {"index": 0.625, "rgb": [161, 217, 155]},
                  {"index": 0.75, "rgb": [199, 233, 192]},
                  {"index": 0.875, "rgb": [229, 245, 224]},
                  {"index": 1, "rgb": [247, 252, 245]}],
    "yiorrd"   : [{"index": 0, "rgb": [128, 0, 38]},
                  {"index": 0.125, "rgb": [189, 0, 38]},
                  {"index": 0.25, "rgb": [227, 26, 28]},
                  {"index": 0.375, "rgb": [252, 78, 42]},
                  {"index": 0.5, "rgb": [253, 141, 60]},
                  {"index": 0.625, "rgb": [254, 178, 76]},
                  {"index": 0.75, "rgb": [254, 217, 118]},
                  {"index": 0.875, "rgb": [255, 237, 160]},
                  {"index": 1, "rgb": [255, 255, 204]}],
    "bluered"  : [{"index": 0, "rgb": [0, 0, 255]},
                  {"index": 1, "rgb": [255, 0, 0]}],
    "rdbu"     : [{"index": 0, "rgb": [5, 10, 172]},
                  {"index": 0.35, "rgb": [106, 137, 247]},
                  {"index": 0.5, "rgb": [190, 190, 190]},
                  {"index": 0.6, "rgb": [220, 170, 132]},
                  {"index": 0.7, "rgb": [230, 145, 90]},
                  {"index": 1, "rgb": [178, 10, 28]}],
    "picnic"   : [{"index": 0, "rgb": [0, 0, 255]},
                  {"index": 0.1, "rgb": [51, 153, 255]},
                  {"index": 0.2, "rgb": [102, 204, 255]},
                  {"index": 0.3, "rgb": [153, 204, 255]},
                  {"index": 0.4, "rgb": [204, 204, 255]},
                  {"index": 0.5, "rgb": [255, 255, 255]},
                  {"index": 0.6, "rgb": [255, 204, 255]},
                  {"index": 0.7, "rgb": [255, 153, 255]},
                  {"index": 0.8, "rgb": [255, 102, 204]},
                  {"index": 0.9, "rgb": [255, 102, 102]},
                  {"index": 1, "rgb": [255, 0, 0]}],
    "rainbow"  : [{"index": 0, "rgb": [150, 0, 90]},
                  {"index": 0.125, "rgb": [0, 0, 200]},
                  {"index": 0.25, "rgb": [0, 25, 255]},
                  {"index": 0.375, "rgb": [0, 152, 255]},
                  {"index": 0.5, "rgb": [44, 255, 150]},
                  {"index": 0.625, "rgb": [151, 255, 0]},
                  {"index": 0.75, "rgb": [255, 234, 0]},
                  {"index": 0.875, "rgb": [255, 111, 0]},
                  {"index": 1, "rgb": [255, 0, 0]}],
    "portland" : [{"index": 0, "rgb": [12, 51, 131]},
                  {"index": 0.25, "rgb": [10, 136, 186]},
                  {"index": 0.5, "rgb": [242, 211, 56]},
                  {"index": 0.75, "rgb": [242, 143, 56]},
                  {"index": 1, "rgb": [217, 30, 30]}],
    "blackbody": [{"index": 0, "rgb": [0, 0, 0]},
                  {"index": 0.2, "rgb": [230, 0, 0]},
                  {"index": 0.4, "rgb": [230, 210, 0]},
                  {"index": 0.7, "rgb": [255, 255, 255]},
                  {"index": 1, "rgb": [160, 200, 255]}],
    "earth"    : [{"index": 0, "rgb": [0, 0, 130]},
                  {"index": 0.1, "rgb": [0, 180, 180]},
                  {"index": 0.2, "rgb": [40, 210, 40]},
                  {"index": 0.4, "rgb": [230, 230, 50]},
                  {"index": 0.6, "rgb": [120, 70, 20]},
                  {"index": 1, "rgb": [255, 255, 255]}],
    "electric" : [{"index": 0, "rgb": [0, 0, 0]},
                  {"index": 0.15, "rgb": [30, 0, 100]},
                  {"index": 0.4, "rgb": [120, 0, 100]},
                  {"index": 0.6, "rgb": [160, 90, 0]},
                  {"index": 0.8, "rgb": [230, 200, 0]},
                  {"index": 1, "rgb": [255, 250, 220]}],
    "alpha"    : [{"index": 0, "rgb": [255, 255, 255, 0]},
                  {"index": 0, "rgb": [255, 255, 255, 1]}]
  };

  var Overlay = (function () {

    var gl;

    var create_indices = function( rows, columns ) {
      var indices = [], index = 0;
      for ( var row = 0; row < ( rows - 2 ); ++row ) {
        indices[index++] = row * ( columns - 1 );
        for ( var column = 0; column < ( columns - 1 ); ++column ) {
          indices[index++] = row * ( columns - 1 ) + column;
          indices[index++] = (row + 1) * ( columns - 1 ) + column;
        }
        indices[index++] = (row + 1) * ( columns - 1 ) + (columns - 2);
      }
      return indices;
    };

    var initGL = function( options ) {
      try {
        gl = options.canvas.getContext( "experimental-webgl" );
        gl.viewportWidth = options.canvas.width;
        gl.viewportHeight = options.canvas.height;

        var w = 2/options.canvas.width;
        var h = -2/options.canvas.height;
        pixelsToWebGLMatrix.set([ w, 0, 0, 0,
                                  0, h, 0, 0,
                                  0, 0, 0, 0,
                                 -1, 1, 0, 1]);
      }
      catch ( e ) {
      }
      if ( !gl ) {
        alert( "Could not initialise WebGL, sorry :-(" );
      }
    };

    var getShader = function( gl, html ) {

      //var shaderScript = document.getElementById( id );
      var shaderScript = html;

      if ( !shaderScript ) {
        return null;
      }

      var str = "";
      var k = shaderScript.firstChild;
      while ( k ) {
        if ( k.nodeType == 3 ) {
          str += k.textContent;
        }
        k = k.nextSibling;
      }

      var shader;
      if ( shaderScript.type == "x-shader/x-fragment" ) {
        shader = gl.createShader( gl.FRAGMENT_SHADER );
      }
      else if ( shaderScript.type == "x-shader/x-vertex" ) {
        shader = gl.createShader( gl.VERTEX_SHADER );
      }
      else {
        return null;
      }

      gl.shaderSource( shader, str );
      gl.compileShader( shader );

      if ( !gl.getShaderParameter( shader, gl.COMPILE_STATUS ) ) {
        alert( gl.getShaderInfoLog( shader ) );
        return null;
      }

      return shader;
    };

    var shaderProgram;

    var initShaders = function( options ) {
      var fragmentShader = getShader( gl, options.fragment );
      var vertexShader = getShader( gl, options.vertex );

      shaderProgram = gl.createProgram();
      gl.attachShader( shaderProgram, vertexShader );
      gl.attachShader( shaderProgram, fragmentShader );
      gl.linkProgram( shaderProgram );

      if ( !gl.getProgramParameter( shaderProgram, gl.LINK_STATUS ) ) {
        alert( "Could not initialise shaders" );
      }

      gl.useProgram( shaderProgram );

      shaderProgram.vertexPositionAttribute = gl.getAttribLocation( shaderProgram, "aVertexPosition" );
      gl.enableVertexAttribArray( shaderProgram.vertexPositionAttribute );

      shaderProgram.vertexColorAttribute = gl.getAttribLocation( shaderProgram, "aVertexColor" );
      gl.enableVertexAttribArray( shaderProgram.vertexColorAttribute );

      //shaderProgram.pMatrixUniform = gl.getUniformLocation( shaderProgram, "uPMatrix" );
      //shaderProgram.mvMatrixUniform = gl.getUniformLocation( shaderProgram, "uMVMatrix" );

      shaderProgram.mapMatrixUniform = gl.getUniformLocation( shaderProgram, "mapMatrix" );
    };

    var pixelsToWebGLMatrix = new Float32Array(16);
    var mapMatrix = new Float32Array(16);

    //var mvMatrix = mat4.create();
    //var pMatrix = mat4.create();
    //
    //function setMatrixUniforms() {
    //  gl.uniformMatrix4fv( shaderProgram.pMatrixUniform, false, pMatrix );
    //  gl.uniformMatrix4fv( shaderProgram.mvMatrixUniform, false, mvMatrix );
    //}

    var squareVertexPositionBuffer;
    var squareVertexColorBuffer;

    var initBuffers = function( data, indicies ) {
      squareVertexPositionBuffer = squareVertexPositionBuffer || gl.createBuffer();
      gl.bindBuffer( gl.ARRAY_BUFFER, squareVertexPositionBuffer );
      var vertices = [];
      for ( var i = 0, len = indicies.length; i < len; i++ ) {
        //vertices.push( ( data[indicies[i]][0] / gl.viewportWidth ) * 1 );
        //vertices.push( ( data[indicies[i]][1] / gl.viewportHeight ) * -1 );

        if ( !data[indicies[i]] ) {
          console.log( "Missing Data " + i + " -> " + indicies[i]);
          debugger;
        }
        vertices.push( data[indicies[i]][0] );
        vertices.push( data[indicies[i]][1] );
        vertices.push( 0.0 );
      }

      gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( vertices ), gl.STATIC_DRAW );
      squareVertexPositionBuffer.itemSize = 3;
      squareVertexPositionBuffer.numItems = indicies.length;

      squareVertexColorBuffer = squareVertexColorBuffer || gl.createBuffer();
      gl.bindBuffer( gl.ARRAY_BUFFER, squareVertexColorBuffer );
      colors = [];
      for ( var i = 0, len = indicies.length; i < len; i++ ) {
        var col = rgb( data[indicies[i]][2] );
        colors.push( col[0] / 255 );
        colors.push( col[1] / 255 );
        colors.push( col[2] / 255 );
        colors.push( col[3] );
      }

      //debugger;

      gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( colors ), gl.STATIC_DRAW );
      squareVertexColorBuffer.itemSize = 4;
      squareVertexColorBuffer.numItems = indicies.length;
    };

    var drawScene = function() {
      gl.viewport( 0, 0, gl.viewportWidth, gl.viewportHeight );
      gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

      mapMatrix.set(pixelsToWebGLMatrix);

      gl.bindBuffer( gl.ARRAY_BUFFER, squareVertexPositionBuffer );
      gl.vertexAttribPointer( shaderProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0 );

      gl.bindBuffer( gl.ARRAY_BUFFER, squareVertexColorBuffer );
      gl.vertexAttribPointer( shaderProgram.vertexColorAttribute, 4, gl.FLOAT, false, 0, 0 );

      //setMatrixUniforms();
      gl.uniformMatrix4fv( shaderProgram.mapMatrixUniform, false, mapMatrix );
      gl.drawArrays( gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems );
      //gl.drawArrays( gl.POINTS, 0, squareVertexPositionBuffer.numItems );
    };

    var rgb = function ( i ) {
      if ( i > 0 ) {
        var res = _.findLast( themes.jet, function( ent ) {
          return ent.index < ( i / 40 );
        } ).rgb || [0.0, 0.0, 0.0, 0.0];

        //console.log( res );

        return res;
        ////var val = 255 * 255 * 255 * i;
        ////return [( val >> 0  ) & 255, ( val >> 8  ) & 255, ( val >> 16 ) & 255, 0.8];
        //var val = 255 * 255 * i;
        //return [( val >> 0 ) & 255, 0, ( val >> 8 ) & 255, 0.8];
      }
      else {
        return [0.0, 0.0, 0.0, 0.0];
      }
      /*
       return [ 0.0, 0.0, 0.0, 1.0]
       */
    };
/*
    function LatLongToPixelXY(latitude, longitude) {
      var pi_180 = Math.PI / 180.0;
      var pi_4 = Math.PI * 4;
      var sinLatitude = Math.sin(latitude * pi_180);
      var pixelY = (0.5 - Math.log((1 + sinLatitude) / (1 - sinLatitude)) / (pi_4)) * 256;
      var pixelX = ((longitude + 180) / 360) * 256;

      var pixel = { x: pixelX, y: pixelY };

      return pixel;
    }

    function translateMatrix(matrix, tx, ty) {
      // translation is in last column of matrix
      matrix[12] += matrix[0] * tx + matrix[4] * ty;
      matrix[13] += matrix[1] * tx + matrix[5] * ty;
      matrix[14] += matrix[2] * tx + matrix[6] * ty;
      matrix[15] += matrix[3] * tx + matrix[7] * ty;
    }

    function scaleMatrix(matrix, scaleX, scaleY) {
      // scaling x and y, which is just scaling first two columns of matrix
      matrix[0] *= scaleX;
      matrix[1] *= scaleX;
      matrix[2] *= scaleX;
      matrix[3] *= scaleX;

      matrix[4] *= scaleY;
      matrix[5] *= scaleY;
      matrix[6] *= scaleY;
      matrix[7] *= scaleY;
    }
*/
    var Overlay = function ( options ) {
      this.options = options;
      //this.data = [];

      initGL( options );
      initShaders( options );

      gl.clearColor( 0.0, 0.0, 0.0, 0.0 );
      gl.enable( gl.DEPTH_TEST );
    };

    Overlay.prototype.clear = function () {
      console.log( "clear" );
    };

    Overlay.prototype.addPoint = function ( x, y, val ) {
      console.log( "addPoint" + arguments );
      //this.data.push( [x, y, val] );
    };

    Overlay.prototype.update = function () {
      console.log( "update" );
    };

    Overlay.prototype.resize = function () {
      console.log( "resize" );
    };

    Overlay.prototype.display = function ( data, rows, cols) {
      console.log( "display" );
      //initBuffers( this.data, create_indices( this.options.rows,
      //                                        this.options.cols ) );

      initBuffers( data, create_indices( rows, cols ) );
      drawScene();
    };

    return Overlay;
  })();

  return function ( options ) {
    return new Overlay( options );
  };

} ));
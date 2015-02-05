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

  var Overlay = (function () {

    var gl;

    var create_indices = function( rows, columns ) {
      var indices = [], index = 0;
      for ( var row = 0; row < ( rows - 1 ); ++row ) {
        indices[index++] = row * ( columns );
        for ( var column = 0; column < ( columns ); ++column ) {
          indices[index++] = row * ( columns ) + column;
          indices[index++] = (row + 1) * ( columns ) + column;
        }
        indices[index++] = (row + 1) * ( columns ) + (columns - 1);
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

    var initBuffers = function( options, data, indicies ) {
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
        var col = rgb( options, data[indicies[i]][2] );
        colors.push( col[0] / 255 );
        colors.push( col[1] / 255 );
        colors.push( col[2] / 255 );
        colors.push( col[3] );
      }

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

    var rgb = function ( options, i ) {
      if ( i > ( options.min || 0 ) ) {
        var res = _.findLast( themes('jet'), function( ent ) {
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
      //console.log( "clear" );
    };

    Overlay.prototype.addPoint = function ( x, y, val ) {
      //console.log( "addPoint" + arguments );
      //this.data.push( [x, y, val] );
    };

    Overlay.prototype.update = function ( options ) {
      //console.log( "update" );
      if ( options && options.min ) {
        this.options.min = options.min;
      }
    };

    Overlay.prototype.resize = function () {
      //console.log( "resize" );
    };

    Overlay.prototype.display = function ( data, rows, cols) {
      initBuffers( this.options, data, create_indices( rows, cols ) );
      drawScene();
    };

    return Overlay;
  })();

  return function ( options ) {
    return new Overlay( options );
  };

} ));
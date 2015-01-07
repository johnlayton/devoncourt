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
      for ( var r = 0; r < rows - 1; ++r ) {
        indices[index++] = r * columns;
        for ( var c = 0; c < columns; ++c ) {
          indices[index++] = r * columns + c;
          indices[index++] = (r + 1) * columns + c;
        }
        indices[index++] = (r + 1) * columns + (columns - 1);
      }
      return indices;
    };

    var initGL = function( options ) {
      try {
        gl = options.canvas.getContext( "experimental-webgl" );
        gl.viewportWidth = options.canvas.width;
        gl.viewportHeight = options.canvas.height;

        pixelsToWebGLMatrix.set([2/options.canvas.width, 0, 0, 0, 0, -2/options.canvas.height, 0, 0, 0, 0, 0, 0, -1, 1, 0, 1]);
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

    function setMatrixUniforms() {
      gl.uniformMatrix4fv( shaderProgram.mapMatrixUniform, false, mapMatrix );
    }

    var squareVertexPositionBuffer;
    var squareVertexColorBuffer;

    var initBuffers = function( data, indicies ) {
      squareVertexPositionBuffer = gl.createBuffer();
      gl.bindBuffer( gl.ARRAY_BUFFER, squareVertexPositionBuffer );
      var vertices = [];
      for ( var i = 0, len = indicies.length; i < len; i++ ) {
        //vertices.push( ( data[indicies[i]][0] / gl.viewportWidth ) * 1 );
        //vertices.push( ( data[indicies[i]][1] / gl.viewportHeight ) * -1 );
        vertices.push( data[indicies[i]][0] );
        vertices.push( data[indicies[i]][1] );
        vertices.push( 0.0 );
      }

      gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( vertices ), gl.STATIC_DRAW );
      squareVertexPositionBuffer.itemSize = 3;
      squareVertexPositionBuffer.numItems = indicies.length;

      squareVertexColorBuffer = gl.createBuffer();
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

    var drawScene = function( scale, offset ) {
      gl.viewport( 0, 0, gl.viewportWidth, gl.viewportHeight );
      gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

      mapMatrix.set(pixelsToWebGLMatrix);

      //scaleMatrix(mapMatrix, scale, scale);
      //translateMatrix(mapMatrix, -offset.x, -offset.y);

      //debugger;

      //mat4.perspective(pMatrix, (Math.PI / 2), gl.viewportWidth / gl.viewportHeight, 0.1, 10000.0 );

      //mat4.identity(mvMatrix);
      //mat4.translate(mvMatrix, mvMatrix, [-0.0, -0.0, -0.0]);

      gl.bindBuffer( gl.ARRAY_BUFFER, squareVertexPositionBuffer );
      gl.vertexAttribPointer( shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT,
                              false, 0, 0 );

      gl.bindBuffer( gl.ARRAY_BUFFER, squareVertexColorBuffer );
      gl.vertexAttribPointer( shaderProgram.vertexColorAttribute, squareVertexColorBuffer.itemSize, gl.FLOAT,
                              false, 0, 0 );

      //debugger;

      setMatrixUniforms();
      //gl.drawArrays( gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems );
      gl.drawArrays( gl.POINTS, 0, squareVertexPositionBuffer.numItems );
    };

    var rgb = function ( i ) {
      if ( i > 0 ) {
        //var val = 255 * 255 * 255 * i;
        //return [( val >> 0  ) & 255, ( val >> 8  ) & 255, ( val >> 16 ) & 255, 0.8];
        var val = 255 * 255 * i;
        return [( val >> 0 ) & 255, 128, ( val >> 8 ) & 255, 0.8];
      }
      else {
        return [0.0, 0.0, 0.0, 0.0];
      }
      /*
       return [ 0.0, 0.0, 0.0, 1.0]
       */
    };

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

    var Overlay = function ( options ) {
      this.options = options;
      this.data = [];

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
      this.data.push( [x, y, val] );
    };

    Overlay.prototype.update = function () {
      console.log( "update" );
    };

    Overlay.prototype.adjustSize = function () {
      console.log( "adjust-size" );
    };

    Overlay.prototype.display = function ( map ) {
      console.log( "display" );
      initBuffers( this.data, create_indices( this.options.rows,
                                              this.options.cols ) );

      var bounds = map.getBounds();
      var topLeft = new L.LatLng(bounds.getNorth(), bounds.getWest());
      var offset = LatLongToPixelXY(topLeft.lat, topLeft.lng);

      // -- Scale to current zoom
      var scale = Math.pow(2, map.getZoom());


      drawScene( scale, offset );
    };

    return Overlay;
  })();

  return function ( options ) {
    return new Overlay( options );
  };

} ));
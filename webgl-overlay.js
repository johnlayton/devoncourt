//"use strict";

(function ( root, factory ) {
  if ( typeof exports === 'object' ) {
    module.exports = factory();
  }
  else if ( typeof define === 'function' && define.amd ) {
    define( [], factory );
  }
  else {
    root.createOverlay = factory();
  }

  //if ( typeof exports === 'object' ) {
  //  module.exports = factory ();
  //}
  //else if ( typeof define === 'function' && define.amd ) {
  //  define ( [], factory );
  //}
  //else {
  //  root.returnExports = factory ();
  //}

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
        alert( "Could not initialise WebGL" );
      }
      if ( !gl ) {
        alert( "Could not initialise WebGL" );
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
      if ( indicies ) {
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
          var col = options.colour( data[indicies[i]][2] );
          colors.push( col[0] / 255 );
          colors.push( col[1] / 255 );
          colors.push( col[2] / 255 );
          //colors.push( col[3] );
          colors.push( options.opacity || 0.5 );
        }

        gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( colors ), gl.STATIC_DRAW );
        squareVertexColorBuffer.itemSize = 4;
        squareVertexColorBuffer.numItems = indicies.length;
      } else {
        squareVertexPositionBuffer = squareVertexPositionBuffer || gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, squareVertexPositionBuffer );

        var vertices = [];
        for ( var i = 0, len = data.length; i < len; i++ ) {
          //vertices.push( ( data[indicies[i]][0] / gl.viewportWidth ) * 1 );
          //vertices.push( ( data[indicies[i]][1] / gl.viewportHeight ) * -1 );
          vertices.push( data[i][0] );
          vertices.push( data[i][1] );
          vertices.push( 0.0 );
        }

        gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( vertices ), gl.STATIC_DRAW );
        squareVertexPositionBuffer.itemSize = 3;
        squareVertexPositionBuffer.numItems = data.length;

        squareVertexColorBuffer = squareVertexColorBuffer || gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, squareVertexColorBuffer );
        colors = [];

        console.log( data );

        for ( var i = 0, len = data.length; i < len; i++ ) {
          var col = options.colour( data[i][2] );
          colors.push( col[0] / 255 );
          colors.push( col[1] / 255 );
          colors.push( col[2] / 255 );
          //colors.push( col[3] );
          colors.push( options.opacity || 0.5 );
        }

        console.log( colors );

        gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( colors ), gl.STATIC_DRAW );
        squareVertexColorBuffer.itemSize = 4;
        squareVertexColorBuffer.numItems = data.length;
      }
    };

    var drawScene = function( drawArrays ) {
      gl.viewport( 0, 0, gl.viewportWidth, gl.viewportHeight );
      gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

      mapMatrix.set(pixelsToWebGLMatrix);

      gl.bindBuffer( gl.ARRAY_BUFFER, squareVertexPositionBuffer );
      gl.vertexAttribPointer( shaderProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0 );

      gl.bindBuffer( gl.ARRAY_BUFFER, squareVertexColorBuffer );
      gl.vertexAttribPointer( shaderProgram.vertexColorAttribute, 4, gl.FLOAT, false, 0, 0 );

      //setMatrixUniforms();
      gl.uniformMatrix4fv( shaderProgram.mapMatrixUniform, false, mapMatrix );

      drawArrays( gl );
    };

    var Overlay = function ( options ) {
      this.options = options;

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
    };

    Overlay.prototype.update = function ( options ) {

      if ( options && options.min ) {
        this.options.min = options.min;
      }
      if ( options && options.theme ) {
        this.options.colour = options.theme.colour;
        //this.options.colour = options.theme ? options.theme.color : function ( i ) {
        //  var jet = [{"index" : 0,     "rgb" : [0, 0, 131]},
        //             {"index" : 0.125, "rgb" : [0, 60, 170]},
        //             {"index" : 0.375, "rgb" : [5, 255, 255]},
        //             {"index" : 0.625, "rgb" : [255, 255, 0]},
        //             {"index" : 0.875, "rgb" : [250, 0, 0]}];
        //
        //  if ( i > ( options.min || 0 ) ) {
        //    var res = _.findLast( jet, function( ent ) {
        //        return ent.index < ( i / 40 );
        //      } ).rgb || [0.0, 0.0, 0.0];
        //    return res;
        //  }
        //  else {
        //    return [0.0, 0.0, 0.0];
        //  }
        //};
      }
      if ( options && options.opacity ) {
        this.options.opacity = options.opacity;
      }
      console.log( "Update" );
    };

    Overlay.prototype.resize = function () {
      console.log( "resize" );

/*
      var canvasHeight, canvasWidth;
      canvasWidth = this.options.canvas.offsetWidth || 2;
      canvasHeight = this.options.canvas.offsetHeight || 2;
      //if (this.width !== canvasWidth || this.height !== canvasHeight) {
        gl.viewport(0, 0, canvasWidth, canvasHeight);
        this.options.canvas.width = canvasWidth;
        this.options.canvas.height = canvasHeight;
        //this.width = canvasWidth;
        //this.height = canvasHeight;
        //return this.heights.resize(this.width, this.height);
      //}
*/
    };

    Overlay.prototype.displayPoints = function ( data) {
      console.log( "displayPoints" );
      initBuffers( this.options, data );
      drawScene( function( gl ) {
        gl.drawArrays( gl.POINTS, 0, squareVertexPositionBuffer.numItems );
      } );
    };

    Overlay.prototype.displayTriangles = function ( data, rows, cols) {
      console.log( "displayTriangles" );
      initBuffers( this.options, data, create_indices( rows, cols ) );
      drawScene( function( gl ) {
        gl.drawArrays( gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems );
      } );
    };

    Overlay.prototype.display = function ( data, rows, cols) {
      console.log( "display" );
      initBuffers( this.options, data, create_indices( rows, cols ) );
      drawScene(function( gl ) {
        gl.drawArrays( gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems );
      });
    };

    return Overlay;
  })();

  return function ( options ) {
    return new Overlay( options );
  };

} ));
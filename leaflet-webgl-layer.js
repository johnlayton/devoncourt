"use strict";

L.TileLayer.WebGL = L.Class.extend( {

  options: {
    minZoom    : 0,
    maxZoom    : 18,
    tileSize   : 256,
    zoomOffset : 0,
    subdomains : 'abc'
  },

	initialize: function (url, options) {
    options = L.setOptions(this, options);
    this._url = url;
    this._time = moment();
    //L.TileLayer.prototype.initialize.call( this, url, options );
	},

  onAdd: function ( map ) {
    this._map = map;
    var mapsize = map.getSize();
    var options = this.options;

    var canvas = options.canvas || L.DomUtil.create( 'canvas' );
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

/*
    this._createTimeSlider();
    this._createThresholdSlider();

    this._currentTime = moment();
    this._currentThreshold = 0;
*/

    /* hide layer on zoom, because it doesn't animate zoom */
    //map.on( "zoomstart", this._hide, this );
    //map.on( "zoomend", this._show, this );

    map.on( "resize", this._update, this );
    map.on( "move", this._update, this );

    this.redraw();
  },

  onRemove: function ( map ) {
    map.getPanes().overlayPane.removeChild( this.canvas );
    //map.off( "zoomstart", this._hide, this );
    //map.off( "zoomend", this._show, this );
    map.on( "resize", this._update, this );
    map.off( "move", this._update, this );
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
  },

  setTime : function( moment ) {
    this._time = moment;
    this._update();
  },

  resize: function () {
    var mapsize = this._map.getSize();
    this.canvas.width = mapsize.x;
    this.canvas.height = mapsize.y;

    this.overlay.resize();
  },

  redraw: function () {
		if (this._map) {
			this._reset();
			this._update();
		}
		return this;
	},

  _reset: function () {
	},

  _resizeRequest: undefined,
	_update: function () {

    var map = this._map;

    if ( this._resizeRequest !== map._resizeRequest ) {
      this.resize();
      this._resizeRequest = map._resizeRequest;
    }
    var overlay = this.overlay;
    overlay.clear();

    L.DomUtil.setPosition( this.canvas, map.latLngToLayerPoint( map.getBounds().getNorthWest() ) );

    //this.resize();

		if (!this._map) {
      return;
    }

		var map = this._map,
		    bounds = map.getPixelBounds(),
		    zoom = map.getZoom(),
		    tileSize = this._getTileSize();

		if (zoom > this.options.maxZoom || zoom < this.options.minZoom) {
			return;
		}

		var tileBounds = L.bounds(
		        bounds.min.divideBy(tileSize)._floor(),
		        bounds.max.divideBy(tileSize)._floor());

/*

		if (this.options.unloadInvisibleTiles || this.options.reuseTiles) {
			this._removeOtherTiles(tileBounds);
		}
*/
    Q.allSettled( this._requestTiles( tileBounds ) )
      .then( this._render.bind( this ) );
	},

	_getTileSize: function () {
		var map = this._map,
		    zoom = map.getZoom() + this.options.zoomOffset,
		    zoomN = this.options.maxNativeZoom,
		    tileSize = this.options.tileSize;

		if (zoomN && zoom > zoomN) {
			tileSize = Math.round(map.getZoomScale(zoom) / map.getZoomScale(zoomN) * tileSize);
		}

		return tileSize;
	},

	_requestTiles: function (bounds) {
		var queue = [], j, i, point;

		for (j = bounds.min.y; j <= bounds.max.y; j++) {
			for (i = bounds.min.x; i <= bounds.max.x; i++) {
				point = new L.Point(i, j);
        //queue.push( this.drawTile( undefined, point, this._map.getZoom()  ) );
        queue.push( this._requestTile( undefined, point, this._map.getZoom()  ) );
			}
		}

    debugger;

    return queue;
	},

	_getTileUrl: function (tilePoint) {
		var url = L.Util.template(this._url, L.extend({
			s: this._getSubdomain(tilePoint),
      t: tilePoint.t,
			z: tilePoint.z,
			x: tilePoint.x,
			y: tilePoint.y
		}, this.options));
    return url;
	},

	_getWrapTileNum: function () {
		var crs = this._map.options.crs,
		    size = crs.getSize(this._map.getZoom());
		return size.divideBy(this._getTileSize())._floor();
	},

	_getSubdomain: function (tilePoint) {
		var index = Math.abs(tilePoint.x + tilePoint.y) % this.options.subdomains.length;
		return this.options.subdomains[index];
	},

	_getZoomForUrl: function () {
		var options = this.options,
		    zoom = this._map.getZoom();
		if (options.zoomReverse) {
			zoom = options.maxZoom - zoom;
		}
		zoom += options.zoomOffset || 0;
		return options.maxNativeZoom ? Math.min(zoom, options.maxNativeZoom) : zoom;
	},

  _adjustTilePoint: function (tilePoint) {

		var limit = this._getWrapTileNum();

		// wrap tile coordinates
		if (!this.options.continuousWorld && !this.options.noWrap) {
			tilePoint.x = ((tilePoint.x % limit.x) + limit.x) % limit.x;
		}

		if (this.options.tms) {
			tilePoint.y = limit.y - tilePoint.y - 1;
		}

		tilePoint.z = this._getZoomForUrl();

    tilePoint.t = this._time.unix()
  },

  _requestTile: function ( tile, tilePoint, zoom ) {

    var tileSize = this._getTileSize();
    var map = this._map;

    var bounds = function( point ) {
      return L.bounds( point, point.add( L.point( 1, 1 ) ) );
    };

    var latLngbounds = function ( tileBounds ) {
      var bounds = L.bounds(
            tileBounds.min.multiplyBy( tileSize )._floor(),
            tileBounds.max.multiplyBy( tileSize )._floor() ),
          sw = map.unproject( bounds.getBottomLeft() ),
          ne = map.unproject( bounds.getTopRight() );

      return new L.LatLngBounds(sw, ne);
    };

    //debugger;
    //
    //console.log( tilePoint );
    //console.log( latLngbounds( bounds( tilePoint ) ) );


    this._adjustTilePoint(tilePoint);

    var deferred = Q.defer();

    var key = JSON.stringify( tilePoint );
    var url = this._getTileUrl( tilePoint );

    var provider = this.options.provider;
    var cache = this.options.cache;

    //console.log( key );

    var process = function( data ) {
      var result = [];
      var times      = data.head[0].values;
      var latitudes  = data.head[1].values;
      var longitudes = data.head[2].values;
      for ( var time = 0; time < times.length ; time++ ) {
        for ( var lat = 0; lat < latitudes.length; lat++ ) {
          for ( var lng = 0; lng < longitudes.length; lng++ ) {
            var _lat = latitudes[lat];
            var _lng = longitudes[lng];
            result.push( [ _lat, _lng, data.data[lat][lng] /*lng + ( lat * lng ) + ( time * lat * lng )]*/ ] );
          }
        }
      }
      return result;
    };

    cache.get( key, function( value ) {
      console.log( "From cache -> " + value );
      deferred.resolve( process( value ) );
    }, function() {
      provider( url, function( err, data ) {
        if ( err ) {
          deferred.reject(new Error(error));
        } else {
          cache.add( key, data );
          console.log( "From remote -> " + data );
          deferred.resolve( process( data ) );
        }
      } );
    } );

    return deferred.promise;
  },

  _render : function( results ) {
    var map = this._map;

    // merge the results
    var data = results.reduce( function( a,b ) {
      return a.concat( b.value );
    } , [] );

    // map the data to screen position
    data = data.map( function( a ) {
      var latlng = new L.LatLng( a[0], a[1] ),
          point = map.latLngToContainerPoint( latlng );
      return [Math.floor( point.x ), Math.floor( point.y ), a[2]];
    } );

    // render as points
    this.overlay.update( { min: this.options.min || 0 } );
    this.overlay.displayPoints( data );
  }

} );

L.layer = L.layer || function ( options ) {
};

L.layer.webgl = function ( url, options ) {
  return new L.TileLayer.WebGL( url, options );
};

Polymer( 'leaflet-webgl-layer', {

  url : "", variable : "", date : moment().unix(),

  observe: {
    'container storage': 'containerChanged',
    'date' : 'dateChanged'
  },

/*
   created: function () {
   },
*/

  ready: function () {
    var now = moment();
    this.$.slider.value = now.unix();
    this.$.slider.min   = now.add( -6, 'days' ).startOf( 'day' ).unix();
    this.$.slider.max   = now.add(  1, 'days' ).startOf( 'day' ).unix();
    this.$.slider.step  = 60 * 60;
  },

  toMoment: function(value) {
    return moment( parseInt( value ) * 1000 ).format("HH:mm DD-MMM-YYYY");
  },

  provider: function( xhr ) {
    return function( url, callback ) {
      var options = {
        url: url, responseType: 'json',
        callback: function ( data ) {
          callback( undefined, data );
        }
      };
      xhr.request( options );
    };
  },

  dateChanged : function() {
    if ( this.date && this.layer ) {
      this.layer.setTime( moment( this.date * 1000 ) );
    }
  },

  containerChanged: function () {
    if ( this.container && this.storage) {
      this.layer = new L.layer.webgl( this.url, {
        cache     : this.storage,
        provider  : this.provider( this.$.xhr ),
        canvas    : this.$.canvas,
        fragment  : this.$.fragment,
        vertex    : this.$.points
      } );
      this.container.addLayer( this.layer );
    }
  },

  detached: function () {
    if ( this.container && this.layer ) {
      this.container.removeLayer( this.layer );
    }
  }
} );

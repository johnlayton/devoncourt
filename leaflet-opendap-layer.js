"use strict";

L.TileLayer.OpenDAP = L.Class.extend( {

  options: {
    opacity    : 1,
    minZoom    : 0,
    maxZoom    : 18,
    tileSize   : 256,
    zoomOffset : 0,
    subdomains : 'abc'
  },

  initialize: function ( url, options ) {
    L.setOptions( this, options );
    this._url = url;
    this._currentTime = moment();
    this._currentThreshold = 0;
  },

  onAdd: function ( map ) {
    this.map = map;
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

    //this._createTimeSlider();
    //this._createThresholdSlider();

    map.on( "move", this._update, this );

    /* hide layer on zoom, because it doesn't animate zoom */
    map.on( "zoomstart", this._hide, this );
    map.on( "zoomend", this._show, this );
    map.on( "resize", this._update, this );

    this.redraw();
  },

  onRemove: function ( map ) {
    map.getPanes().overlayPane.removeChild( this.canvas );
    map.off( "move", this._update, this );
    map.off( "zoomstart", this._hide, this );
    map.off( "zoomend", this._show, this );
  },

/*
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
*/

  setCurrentTime : function( time ) {
    this._currentTime = time;
    this._update();
  },

  redraw: function () {
		if (this.map) {
			this._reset();
			this._update();
		}
		return this;
	},

  _reset: function () {
	},

  //_resizeRequest: undefined,
	_update: function () {

    var map = this.map,
        bounds = map.getPixelBounds(),
        zoom = map.getZoom(),
        tileSize = this._getTileSize();

    if ( this._resizeRequest !== map._resizeRequest ) {
      this.resize();
      this._resizeRequest = map._resizeRequest;
    }
    var overlay = this.overlay;
    overlay.clear();

    L.DomUtil.setPosition( this.canvas,
                           map.latLngToLayerPoint( map.getBounds().getNorthWest() ) );

		if (!this.map) {
      return;
    }

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
		var map = this.map,
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
        queue.push( this._requestTile( undefined, point, this.map.getZoom()  ) );
			}
		}
    return queue;
	},

  _requestTile: function ( tile, tilePoint, zoom ) {

    var map = this.map,
        options = this.options,
        cache = this.options.cache,
        tileSize = this._getTileSize();

    var bounds = function( point ) {
      return L.bounds( point, point.add( L.point( 1, 1 ) ) );
    };

    var latLng = function ( tileBounds ) {
      var bounds = L.bounds(
            tileBounds.min.multiplyBy( tileSize )._floor(),
            tileBounds.max.multiplyBy( tileSize )._floor() ),
          sw = map.unproject( bounds.getBottomLeft() ),
          ne = map.unproject( bounds.getTopRight() );

      return new L.LatLngBounds(sw, ne);
    };

    var latLngBnd = latLng( bounds( tilePoint ) );
    var sth = latLngBnd.getSouth(),
        nth = latLngBnd.getNorth(),
        est = latLngBnd.getEast(),
        wst = latLngBnd.getWest();
    var variable = options.variable;
    var query = {
      time     : {
        min: this._currentTime.unix(),
        max: this._currentTime.unix(),
        step: 1
      },
      latitude : {
        min : sth,
        max : nth,
        step: 1
      },
      longitude: {
        min : wst,
        max : est,
        step: 1
      }
    };

    this._adjustTilePoint(tilePoint);

    var deferred = Q.defer();

    var key = JSON.stringify( tilePoint );
    //var url = this._getTileUrl( tilePoint );

    var process = function( variable, data ) {

      var findData = function( data, name ) {
        return _.find( data, function( i ) { return i.das.name == name } ).data;
      };

      var all_data = findData( data, variable );
      var var_data = findData( all_data, variable );

      var result = [];
      //var times = this.findData( all_data, 'time' );
      var latitudes = findData( all_data, 'latitude' );
      var longitudes = findData( all_data, 'longitude' );

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

      return result;
    };

    cache.get( key, function( value ) {
      console.log( "From cache -> " + value );
      deferred.resolve( process( variable, value.data ) );
    }, function() {
      options.kettstreet.dap( variable, query, function( err, data ){
        if ( err ) {
          deferred.reject(new Error(err));
        } else {
          cache.add( key, { data : data } );
          console.log( "From remote -> " + data );
          deferred.resolve( process( variable, data ) );
        }
      } );
    } );

    return deferred.promise;
  },

  _render : function( results ) {
    var map = this.map;

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
		var crs = this.map.options.crs,
		    size = crs.getSize(this.map.getZoom());
		return size.divideBy(this._getTileSize())._floor();
	},

	_getSubdomain: function (tilePoint) {
		var index = Math.abs(tilePoint.x + tilePoint.y) % this.options.subdomains.length;
		return this.options.subdomains[index];
	},

	_getZoomForUrl: function () {
		var options = this.options,
		    zoom = this.map.getZoom();
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

    tilePoint.t = this._currentTime.unix()
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

  resize: function () {
    //helpful for maps that change sizes
    var mapsize = this.map.getSize();
    this.canvas.width = mapsize.x;
    this.canvas.height = mapsize.y;

    this.overlay.resize();
  },

  update: function () {
    this._update();
    //this._plot();
  }


} );

L.layer = function ( options ) {
};

L.layer.opendap = function ( url, options ) {
  return new L.TileLayer.OpenDAP( url, options );
};

Polymer( 'leaflet-opendap-layer', {

  url      : "",
  variable : "",
  //date     : moment().unix(),

  observe: {
    'container storage' : 'containerChanged',
    'current'           : 'currentChanged'
  },

  created: function () {
  },

  ready: function () {
  },

  toMoment: function(value) {
    return moment.unix( value ).format("HH:mm DD-MMM-YYYY");
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

  currentChanged: function() {
    if ( this.container && this.layer) {
      this.layer.setCurrentTime( moment.unix( this.current ) );
    }
  },

  containerChanged: function () {
    if ( this.container && this.storage) {
      var options = {
        cache     : this.storage,
        variable  : this.variable,
        canvas    : this.$.canvas,
        threshold : {
          slider: this.$.threshold
        },
        fragment  : this.$.fragment,
        vertex    : this.$.points,
        kettstreet: kettstreet( {
          url       : this.url,
          provider  : this.provider( this.$.xhr )
          //cache     : this.storage
        } )
      };
      this.layer = new L.layer.opendap( this.url, options );
      this.container.addLayer( this.layer );
    }
  },

  detached: function () {
    if ( this.container && this.layer ) {
      this.container.removeControl( this.layer );
    }
  }
} );

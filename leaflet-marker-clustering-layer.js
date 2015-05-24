"use strict";

(function ( root, factory ) {
  if ( typeof exports === 'object' ) {
    module.exports = factory ();
  }
  else if ( typeof define === 'function' && define.amd ) {
    define ( [], factory );
  }
  else {
    root.returnExports = factory ();
  }
} ( this, function () {

  L.Control.Clusters = L.Control.extend ( {
    options : {
      collapsed : true,
      position : 'topright',
      autoZIndex : true
      //html : function ( cluster ) {
      //  return cluster.getChildCount ()
      //}
    },

    initialize : function ( baseLayers, overlays, options ) {
      L.setOptions ( this, options );

      var self = this;
      this._clusters = L.markerClusterGroup ( {
        maxClusterRadius : 60,
        disableClusteringAtZoom : 10,
        showCoverageOnHover : true
      } );
/*
      this._clusters = L.markerClusterGroup ( {
        iconCreateFunction : function ( cluster ) {
          return L.divIcon ( {
            html : self.options.html ( cluster ),
            className : 'cluster-icon',
            iconSize : L.point ( 90, 40 ) } );
        },
        maxClusterRadius : 120,
        disableClusteringAtZoom : 10,
        showCoverageOnHover : false
      } );

*/
      this._layers = {};
      this._lastZIndex = 0;
      this._handlingClick = false;

      for ( var i in baseLayers ) {
        this._addLayer ( baseLayers[i], i );
      }

      for ( i in overlays ) {
        this._addLayer ( overlays[i], i, true );
      }
    },

    onAdd : function ( map ) {
      this._initLayout ();
      this._update ();

      map
        .on ( 'layeradd', this._onLayerChange, this )
        .on ( 'layerremove', this._onLayerChange, this );

      this._clusters.addTo ( map );

      return this._container;
    },

    onRemove : function ( map ) {
      map
        .off ( 'layeradd', this._onLayerChange )
        .off ( 'layerremove', this._onLayerChange );
    },

    addBaseLayer : function ( layer, name ) {
      this._addLayer ( layer, name );
      this._update ();
      return this;
    },

    addOverlay : function ( layer, name ) {
      this._addLayer ( layer, name, true );
      this._update ();
      return this;
    },

    removeLayer : function ( layer ) {
      var id = L.stamp ( layer );
      delete this._layers[id];
      this._update ();
      return this;
    },

    _initLayout : function () {
      var className = 'leaflet-control-clusters',
        container = this._container = L.DomUtil.create ( 'div', className );

      container.setAttribute ( 'aria-haspopup', true );

      if ( !L.Browser.touch ) {
        L.DomEvent.disableClickPropagation ( container );
        L.DomEvent.on ( container, 'mousewheel', L.DomEvent.stopPropagation );
      }
      else {
        L.DomEvent.on ( container, 'click', L.DomEvent.stopPropagation );
      }

      var form = this._form = L.DomUtil.create ( 'form', className + '-list' );

      if ( this.options.collapsed ) {
        if ( !L.Browser.android ) {
          L.DomEvent
            .on ( container, 'mouseover', this._expand, this )
            .on ( container, 'mouseout', this._collapse, this );
        }
        var link = this._layersLink =
                   L.DomUtil.create ( 'a', className + '-toggle', container );
        link.href = '#';
        link.title = 'Layers';

        if ( L.Browser.touch ) {
          L.DomEvent
            .on ( link, 'click', L.DomEvent.stop )
            .on ( link, 'click', this._expand, this );
        }
        else {
          L.DomEvent.on ( link, 'focus', this._expand, this );
        }

        this._map.on ( 'click', this._collapse, this );
        // TODO keyboard accessibility
      }
      else {
        this._expand ();
      }

      this._baseLayersList = L.DomUtil.create ( 'div', className + '-base', form );
      this._separator = L.DomUtil.create ( 'div', className + '-separator', form );
      this._overlaysList = L.DomUtil.create ( 'div', className + '-overlays', form );

      container.appendChild ( form );
    },

    _addLayer : function ( layer, name, overlay ) {
      var id = L.stamp ( layer );

      this._layers[id] = {
        layer : layer,
        name : name,
        overlay : overlay
      };

      if ( this.options.autoZIndex && layer.setZIndex ) {
        this._lastZIndex++;
        layer.setZIndex ( this._lastZIndex );
      }
    },

    _update : function () {
      if ( !this._container ) {
        return;
      }

      this._baseLayersList.innerHTML = '';
      this._overlaysList.innerHTML = '';

      var baseLayersPresent = false,
        overlaysPresent = false,
        i, obj;

      for ( i in this._layers ) {
        obj = this._layers[i];
        this._addItem ( obj );
        overlaysPresent = overlaysPresent || obj.overlay;
        baseLayersPresent = baseLayersPresent || !obj.overlay;
      }

      this._separator.style.display =
      overlaysPresent && baseLayersPresent ? '' : 'none';
    },

    _onLayerChange : function ( e ) {
      var obj = this._layers[L.stamp ( e.layer )];
      //var obj = e.layer;

      if ( !obj ) {
        return;
      }

      if ( !this._handlingClick ) {
        this._update ();
      }

      var type = obj.overlay ?
                 (e.type === 'layeradd' ? 'overlayadd' : 'overlayremove') :
                 (e.type === 'layeradd' ? 'baselayerchange' : null);

      if ( type ) {
        this._map.fire ( type, obj );
        //this._cluster.fire( type, obj );
      }
    },

    // IE7 bugs out if you create a radio dynamically, so you have to do it this hacky way (see http://bit.ly/PqYLBe)
    _createRadioElement : function ( name, checked ) {

      var radioHtml = '<input type="radio" class="leaflet-control-clusters-selector" name="' +
                      name + '"';
      if ( checked ) {
        radioHtml += ' checked="checked"';
      }
      radioHtml += '/>';

      var radioFragment = document.createElement ( 'div' );
      radioFragment.innerHTML = radioHtml;

      return radioFragment.firstChild;
    },

    _addItem : function ( obj ) {
      var label = document.createElement ( 'label' ),
        input,
        checked = obj.overlay ? this._clusters.hasLayer ( obj.layer.getLayers ()[0] ) :
                  this._map.hasLayer ( obj.layer );

      //console.log ( " Checked ... " + checked );
      //console.log ( " Overlay ... " + obj.overlay );
      //console.log ( this._clusters.getLayers () );
      //console.log ( obj.overlay ? obj.layer.getLayers () : obj.layer );

      if ( obj.overlay ) {
        input = document.createElement ( 'input' );
        input.type = 'checkbox';
        input.className = 'leaflet-control-clusters-selector';
        input.defaultChecked = checked;

        this._clusters.addLayer ( obj.layer );
      }
      else {
        input = this._createRadioElement ( 'leaflet-base-clusters', checked );
      }

      input.layerId = L.stamp ( obj.layer );

      L.DomEvent.on ( input, 'click', this._onInputClick, this );

      var name = document.createElement ( 'span' );
      name.innerHTML = ' ' + obj.name;

      label.appendChild ( input );
      label.appendChild ( name );

      var container = obj.overlay ? this._overlaysList : this._baseLayersList;
      container.appendChild ( label );

      return label;
    },

    _onInputClick : function () {
      var i, input, obj,
        inputs = this._form.getElementsByTagName ( 'input' ),
        inputsLen = inputs.length;

      this._handlingClick = true;

      for ( i = 0; i < inputsLen; i++ ) {
        input = inputs[i];
        obj = this._layers[input.layerId];
        if ( obj.overlay ) {
          if ( input.checked && !this._clusters.hasLayer ( obj.layer ) ) {
            //this._clusters.addLayers( obj.layer.getLayers() );
            this._clusters.addLayer ( obj.layer );
          }
          else if ( !input.checked /*&& this._clusters.hasLayer( obj.layer )*/ ) {
            this._clusters.removeLayers ( obj.layer.getLayers () );
          }
        }
        else {
          if ( input.checked && !this._map.hasLayer ( obj.layer ) ) {
            this._map.addLayer ( obj.layer );
          }
          else if ( !input.checked && this._map.hasLayer ( obj.layer ) ) {
            this._map.removeLayers ( obj.layer.getLayers () );
          }
        }
      }

      this._handlingClick = false;
    },

    _expand : function () {
      L.DomUtil.addClass ( this._container, 'leaflet-control-clusters-expanded' );
    },

    _collapse : function () {
      this._container.className =
      this._container.className.replace ( ' leaflet-control-clusters-expanded', '' );
    }
  } );

  L.control.clusters = function ( baseLayers, overlays, options ) {
    return new L.Control.Clusters ( baseLayers, overlays, options );
  };

} ));


Polymer( 'leaflet-marker-clustering-layer', {

  created : function () {
    console.log( 'created leaflet-marker-clustering-layer' );
  },

  containerChanged : function () {
    if ( this.container ) {
      this.control = L.control.clusters({}, {}, {});
      this.container.addControl( this.control );

      this.container.on('layeradd', function( e ) {
        this.addLayer( e.layer );
      }, this);

      this.registerMapOnChildren();
    }
  },

  registerMapOnChildren: function() {
    for (var i = 0; i < this.children.length; i++) {
      //this.children[i].container = this.container;
      this.children[i].container = this;
    }
    this.onMutation(this, this.registerMapOnChildren);
  },

  detached: function () {
    if ( this.container && this.layer ) {
      this.container.removeLayer( this.layer );
    }
  },

  addLayer: function( layer ) {
    for ( var i = 0; i < this.children.length; i++ ) {
      if ( ( layer.url && layer.url.match( this.children[i].url ) ) ||
           ( layer._url && layer._url.match( this.children[i].url ) ) ) {
        this.control.addOverlay( layer, this.children[i].name );
      }
    }
  }
} );
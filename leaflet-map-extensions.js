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

  L.HtmlIcon = L.Icon.extend({
    options: {
      iconSize: ['auto', 12], // also can be set through CSS
      /*
      iconAnchor: (Point)
      popupAnchor: (Point)
      html: (String)
      bgPos: (Point)
      */
      className: 'leaflet-html-icon',
      html: false
    },

    createIcon: function (oldIcon) {

      var div = (oldIcon && oldIcon.tagName === 'DIV') ? oldIcon : document.createElement('div'),
          options = this.options;

      if (!options.html) {
        return;
      }

      if (typeof options.html === 'string') {
        div.innerHTML = options.html;
      } else {
        while ( div.hasChildNodes() ) {
          div.removeChild( div.firstChild );
        }
        div.appendChild( options.html );
      }

      if (options.bgPos) {
        div.style.backgroundPosition =
                (-options.bgPos.x) + 'px ' + (-options.bgPos.y) + 'px';
      }

      this._setIconStyles(div, 'icon');

      return div;
    },

    createShadow: function () {
      return null;
    }
  });

  L.htmlIcon = function (options) {
    return new L.HtmlIcon(options);
  };

} ));



Polymer( 'leaflet-map-extensions', {



} );

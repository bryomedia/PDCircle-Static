/**
 * --------------------------------------------------------------------------
 * Ace (v3.1.1): util.js
   Some Utility Functions
*/

// import $ from 'jquery'
// import bootstrap from 'bootstrap'

class Util {
  static isReducedMotion () {
    return window.matchMedia('(prefers-reduced-motion)').matches
  }

  static isRTL () {
    return document.documentElement.classList.contains('rtl') || document.documentElement.dir === 'rtl'
  }

  static hasClosest () {
    return 'closest' in document.documentElement
  }

  /**
  static hasTransitionStart () {
    if (Util._supportsTransitionStart !== null) return Util._supportsTransitionStart

    Util._supportsTransitionStart = 'ontransitionstart' in window// doesn't work in Chrome
    if (!Util._supportsTransitionStart) {
      var tmp = $('<div style="opacity: 0; transition: opacity 1ms" />').appendTo(document.body)
      tmp.on('transitionstart', function () {
        Util._supportsTransitionStart = true
      }).on('transitionend', function () {
        tmp.remove()
      })

      tmp.get(0).offsetTop
      tmp.css('opacity', '1')
    }

    return Util._supportsTransitionStart
  }
  */

  static getScrollbarInfo (recalc = false) {
    if (recalc === false && Util._scrollbarInfo !== null) return Util._scrollbarInfo

    const scrollDiv = document.createElement('div')
    scrollDiv.style.overflow = 'scroll'
    scrollDiv.style.position = 'absolute'
    scrollDiv.style.width = '50px'
    scrollDiv.style.height = '50px'

    const scrollbar = {}

    document.body.appendChild(scrollDiv)
    scrollbar.width = scrollDiv.getBoundingClientRect().width - scrollDiv.clientWidth
    document.documentElement.style.setProperty('--scrollbar-width', scrollbar.width + 'px')

    let thinWidth = scrollbar.width
    if (window.CSS) {
      scrollbar.thin = window.CSS.supports('scrollbar-width', 'thin')// currently only firefox 64+ supports it
      if (scrollbar.thin) {
        scrollDiv.style['scrollbar-width'] = 'thin'
        thinWidth = scrollDiv.getBoundingClientRect().width - scrollDiv.clientWidth
      }

      scrollbar.overlay = window.CSS.supports('overflow', 'overlay')
    } else {
      scrollbar.thin = false

      scrollDiv.style.overflow = 'overlay'// Webkit/Chromium based browsers support it
      scrollbar.overlay = scrollbar.width > 0 && scrollDiv.getBoundingClientRect().width - scrollDiv.clientWidth === 0
    }
    document.documentElement.style.setProperty('--moz-scrollbar-thin', thinWidth + 'px')

    scrollDiv.style['-ms-overflow-style'] = '-ms-autohiding-scrollbar'// IE
    scrollbar.autohide = scrollbar.width > 0 && scrollDiv.getBoundingClientRect().width - scrollDiv.clientWidth === 0

    /// //////////////////////////////////
    document.body.removeChild(scrollDiv)
    Util._scrollbarInfo = scrollbar

    return Util._scrollbarInfo
  }
}
Util._supportsTransitionStart = null// static property
Util._scrollbarInfo = null// static property

/**
* ------------------------------------------------------------------------
* jQuery
* ------------------------------------------------------------------------
*/

export default Util

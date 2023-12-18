/**
 * --------------------------------------------------------------------------
 * Ace (v3.1.1): tab-scroll.js
   Extra functionality for auto-scrolling tab buttons (in small devices)
*/

import $ from 'jquery'
import Util from './util'

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const NAME1 = 'aceTabScroll'
const NAME2 = 'aceTabLinkScroll'

const VERSION = '3.1.1'
const DATA_KEY = 'ace.tabscroll'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const Event = {
  LOAD_DATA_API: `load${EVENT_KEY}${DATA_API_KEY}`
}

const Selector = {
  TAB_SCROLL: '.nav-tabs-scroll',
  ACTIVE: '.active'
}

/**
 * ------------------------------------------------------------------------
 * Class Definitions
 * ------------------------------------------------------------------------
 */

class NavTabScroller {
  constructor (element) {
    this._element = element

    this._firefox = 'MozAppearance' in document.documentElement.style

    this._init()
  }

  static get VERSION () {
    return VERSION
  }

  _init () {
    // scroll to active element on page load
    const active = this._element.querySelector(Selector.ACTIVE)
    if (active) {
      const navLinkScroll = new NavLinkScroller(active)
      if (!this._firefox) {
        navLinkScroll._scrollIntoView(false)
      } else { // still firefox doesn't scroll back to `zero` on page load!
        setTimeout(() => {
          this._element.scrollLeft = 1
          navLinkScroll._scrollIntoView(false)
        }, 500)
      }
    }

    this.enable()
  }

  enable () {
    if (!('closest' in document.documentElement)) return

    this._element.addEventListener('click', (ev) => {
      const navLink = ev.target.closest('a')
      if (!navLink) return

      const navLinkScroll = new NavLinkScroller(navLink)
      navLinkScroll._scrollIntoView()
    })
  }

  // Static methods
  static _jQueryInterface (config) {
    return this.each(function () {
      const $this = $(this)
      let data = $this.data(DATA_KEY)

      if (!data) {
        data = new NavTabScroller(this)
        $this.data(DATA_KEY, data)
      }

      if (typeof config === 'string') {
        if (typeof data[config] === 'undefined') {
          throw new TypeError(`No method named "${config}"`)
        }
        data[config]()
      }
    })
  }
}

class NavLinkScroller {
  constructor (element) {
    this._element = element

    this._firefox = 'MozAppearance' in document.documentElement.style
  }

  static get VERSION () {
    return VERSION
  }

  // scroll tab button elements into view when clicked
  _scrollIntoView (smooth = true) {
    const li = this._element.parentNode
    const nav = li.parentNode

    const navClientWidth = nav.clientWidth
    const navScrollWidth = nav.scrollWidth
    if (navScrollWidth <= navClientWidth) return // don't scroll if not needed

    const isRTL = Util.isRTL()

    // scroll to this element (center it)
    let _scrollLeft
    if (!isRTL) {
      _scrollLeft = li.offsetLeft - (navClientWidth - li.clientWidth) / 2
    } else {
      // firefox and webkit have different ways of dealing with scrolling right/left and offsets in RTL mode
      if (!this._firefox) {
        _scrollLeft = (navScrollWidth - navClientWidth) + (li.offsetLeft) - ((navClientWidth - li.clientWidth) / 2)
      } else {
        _scrollLeft = li.offsetLeft - ((navClientWidth - li.clientWidth) / 2)
      }
    }
    _scrollLeft = _scrollLeft | 0 // convert FLOAT to INT

    smooth = !Util.isReducedMotion() && smooth === true
    try {
      nav.scrollTo({
        top: 0,
        left: _scrollLeft,
        behavior: smooth ? 'smooth' : 'auto'
      })

      // firefox needs extra push when scrolling back
      if (this._firefox && _scrollLeft < nav.scrollLeft) {
        setTimeout(function () {
          nav.scrollTo({
            top: 0,
            left: _scrollLeft,
            behavior: smooth ? 'smooth' : 'auto'
          })
        }, 0)
      }
    } catch (e) {
      nav.scrollLeft = _scrollLeft
    }
  }

  // Static methods
  static _jQueryInterface (config) {
    return this.each(function () {
      const $this = $(this)
      let data = $this.data(DATA_KEY)

      if (!data) {
        data = new NavLinkScroller(this)
        $this.data(DATA_KEY, data)
        data._scrollIntoView()
      }

      if (typeof config === 'string') {
        if (typeof data[config] === 'undefined') {
          throw new TypeError(`No method named "${config}"`)
        }
        data[config]()
      }
    })
  }
}

/**
 * ------------------------------------------------------------------------
 * Data Api implementation
 * ------------------------------------------------------------------------
*/

$(window).on(Event.LOAD_DATA_API, () => {
  const scrollableNavTabs = document.querySelectorAll(Selector.TAB_SCROLL)

  for (let i = 0; i < scrollableNavTabs.length; i++) {
    const $tabscroll = $(scrollableNavTabs[i])
    NavTabScroller._jQueryInterface.call($tabscroll)
  }
})

/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
*/

if (typeof $ !== 'undefined') {
  const JQUERY_NO_CONFLICT1 = $.fn[NAME1]
  $.fn[NAME1] = NavTabScroller._jQueryInterface
  $.fn[NAME1].Constructor = NavTabScroller
  $.fn[NAME1].noConflict = () => {
    $.fn[NAME1] = JQUERY_NO_CONFLICT1
    return NavTabScroller._jQueryInterface
  }

  const JQUERY_NO_CONFLICT2 = $.fn[NAME2]
  $.fn[NAME2] = NavLinkScroller._jQueryInterface
  $.fn[NAME2].Constructor = NavLinkScroller
  $.fn[NAME2].noConflict = () => {
    $.fn[NAME2] = JQUERY_NO_CONFLICT2
    return NavLinkScroller._jQueryInterface
  }
}

export {
  NavTabScroller,
  NavLinkScroller
}

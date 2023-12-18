/**
 * --------------------------------------------------------------------------
 * Ace (v3.1.1): sidebar.js
   Handling Sidebar
*/

import $ from 'jquery'
import bootstrap from 'bootstrap'
import Util from './util'

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const NAME = 'aceSidebar'
const VERSION = '3.1.1'
const DATA_KEY = 'ace.sidebar'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const Event = {
  SHOW: `show${EVENT_KEY}`,
  HIDE: `hide${EVENT_KEY}`,
  COLLAPSE: `collapse${EVENT_KEY}`,
  EXPAND: `expand${EVENT_KEY}`,
  SHOWN: `shown${EVENT_KEY}`,
  HIDDEN: `hidden${EVENT_KEY}`,
  COLLAPSED: `collapsed${EVENT_KEY}`,
  EXPANDED: `expanded${EVENT_KEY}`,
  LOAD_DATA_API: `load${EVENT_KEY}${DATA_API_KEY}`,
  CLICK_DATA_API: `click${EVENT_KEY}${DATA_API_KEY}`
}

const Selector = {
  SIDEBAR: '.sidebar',
  DATA_TOGGLE: '[data-toggle="sidebar"]',
  DATA_TOGGLE_MOBILE: '[data-toggle-mobile="sidebar"]'
}

const DefaultType = {
  swipe: 'boolean',
  dismiss: 'boolean',
  backdrop: 'boolean',

  gotoactive: 'boolean',
  subscroll: 'boolean',

  pullup: 'boolean'
}

const Default = {
  swipe: false,
  dismiss: false,
  backdrop: false,

  gotoactive: false,
  subscroll: true,

  pullup: false
}

const ClassName = {
  DESKTOP_HIDE: 'collapsed',
  MOBILE_SHOW: 'sidebar-visible',
  COLLAPSED:	'collapsed',

  TOGGLING: 'toggling',

  INNER_HOVER: 'is-hover',

  BACKDROP: 'sidebar-backdrop',

  HORIZONTAL: 'sidebar-h'
}

/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

class Sidebar {
  constructor (element, config) {
    this._hasTransitionEvent = false
    this._hasTransitionEvent2 = false
    this._isTransitioning = false

    this._sidebar = element
    this._sidebar.offsetHeight // force reflow, so that if we instantly call 'collapse' or 'expand', transition effect takes place
    this._sidebar.classList.add('sidebar')
    this._inner = this._sidebar.querySelector('.sidebar-inner')
    this._config = this._getConfig(config)
    this._scroller = 	this._sidebar.querySelector('[class*="ace-scroll"]')

    if (this._sidebar.querySelector('.submenu.show') !== null) this._sidebar.classList.add('has-open')

    this._pullupEnabled = false

    this._triggerArray = [].slice.call(document.querySelectorAll(
      `[data-toggle="sidebar"][href="#${element.id}"],` +
      `[data-toggle="sidebar"][data-target="#${element.id}"]`
    ))
    this._triggerArrayMobile = [].slice.call(document.querySelectorAll(
      `[data-toggle-mobile="sidebar"][href="#${element.id}"],` +
      `[data-toggle-mobile="sidebar"][data-target="#${element.id}"]`
    ))

    this._horizontal = this._sidebar.classList.contains(ClassName.HORIZONTAL)
    this._desktopCollapsedClass = this._triggerArray.length > 0 ? (this._triggerArray[0].getAttribute('data-toggle-class') || ClassName.DESKTOP_HIDE) : ClassName.DESKTOP_HIDE

    //
    this._collapsed = this._sidebar.classList.contains(this._desktopCollapsedClass)

    $(this._inner).on('focus', 'input', (e) => {
      if (!this._collapsed) return
      this._inner.classList.add('has-focus')
      $(e.target).one('blur', () => {
        this._inner.classList.remove('has-focus')
      })
    })
    //

    this._handleTriggerEvents()
    this.enableSubmenuToggle()

    if (this._config.pullup) this.enableSubmenuPullup()
    if (this._config.gotoactive) this.scrollToActive()
    if (this._config.backdrop) {
      this._sidebar.classList.add(ClassName.BACKDROP)
    } else if (this._sidebar.classList.contains(ClassName.BACKDROP)) {
      this._config.backdrop = true
    }

    if (!this._horizontal && this._collapsed) {
      this._addTransitionEvent()
    }
  }

  // Getters
  static get VERSION () {
    return VERSION
  }

  static get Default () {
    return Default
  }

  static get DefaultType () {
    return DefaultType
  }

  _handleTriggerEvents () {
    const This = this
    $(this._triggerArray).on('click', function () {
      This.toggle(this)
    })

    $(this._triggerArrayMobile).on('click', function () {
      This.toggleMobile(this)
    })
  }

  toggle (btn = null) {
    if (this._sidebar.classList.contains(this._desktopCollapsedClass)) {
      this.expand(btn)
    } else {
      this.collapse(btn)
    }
  }

  toggleMobile (btn = null) {
    if (!this._sidebar.classList.contains(ClassName.MOBILE_SHOW)) {
      this.show(btn)
    } else {
      this.hide(btn)
    }
  }

  /// ////

  expand (btn = null) {
    if (!this._hasTransitionEvent) this._addTransitionEvent()
    if (this._isTransitioning) return

    const ev = new $.Event(Event.EXPAND)
    $(this._sidebar).trigger(ev)
    if (ev.isDefaultPrevented()) return

    this._isTransitioning = true

    this._sidebar.classList.add(ClassName.TOGGLING)
    this._sidebar.classList.remove(this._desktopCollapsedClass)

    this._updateTriggerBtns(this._triggerArray, true)

    this._collapsed = false

    if (Util.isReducedMotion() || this._horizontal) this._toggleCompleted()// call completion now

    //
    if (this._pullupEnabled) this._resetPullUp()

    // this._inner.classList.remove(ClassName.INNER_HOVER)//we'll remove it in _toggleCompleted
  }

  collapse (btn = null) {
    if (!this._hasTransitionEvent) this._addTransitionEvent()
    if (this._isTransitioning) return

    const ev = new $.Event(Event.COLLAPSE)
    $(this._sidebar).trigger(ev)
    if (ev.isDefaultPrevented()) return

    this._isTransitioning = true

    this._sidebar.classList.add(ClassName.TOGGLING)
    this._sidebar.classList.add(this._desktopCollapsedClass)

    this._updateTriggerBtns(this._triggerArray, false)

    this._collapsed = true

    if (Util.isReducedMotion() || this._horizontal) this._toggleCompleted()// call completion now

    //
    if (this._pullupEnabled) this._resetPullUp()

    // if the triggering button is inside sidebar and we want it to remain expaned (.let-expanded), add .is-hover class as well
    if (btn !== null && this._sidebar.classList.contains('expandable') && this._sidebar.classList.contains('let-expanded') && this._inner.contains(btn)) {
      this._inner.classList.add(ClassName.INNER_HOVER)
    }
  }

  show (btn = null) {
    if (!this._hasTransitionEvent2) this._addTransitionEvent2()

    const ev = new $.Event(Event.SHOW)
    $(this._sidebar).trigger(ev)
    if (ev.isDefaultPrevented()) return

    this._sidebar.classList.add(ClassName.MOBILE_SHOW)
    this._updateTriggerBtns(this._triggerArrayMobile, true)

    // hide sidebar if clicked outside of it
    if (this._config.dismiss) {
      $(this._triggerArrayMobile).css('pointer-events', 'none') // disable this button, because if we click on it, it will hide and then instantly show the sidebar again
      $(document).on('mouseup.sidebar-dismiss', (e) => {
        if (!$.contains(this._sidebar, e.target)) { // if clicked outside sidebar
          this.hide()
        }
      })
    }

    if (this._config.swipe) this.enableSwipeHide()

    if (Util.isReducedMotion()) this._toggleMobileCompleted()// call completion now

    // in some webkit mobile browsers, sidebar scrolling works but scrollbars are not visible, unless something like this forces it to become visible
    if (this._scroller && !this._scroller.classList.contains('overflow-hidden')) {
      this._scroller.classList.add('overflow-hidden')
      this._scroller.offsetHeight// force redraw
      this._scroller.classList.remove('overflow-hidden')
    }

    // hide body scrollbars
    // if sidebar is fixed and has backdrop or is .sidebar-push
    const scrollbarInfo = Util.getScrollbarInfo()
    if (scrollbarInfo.width === 0 && this._sidebar.classList.contains('sidebar-fixed') && (this._config.backdrop || this._sidebar.classList.contains('sidebar-push'))) {
      document.body.classList.add('mob-sidebar-body')
    }
  }

  hide (btn = null) {
    if (!this._hasTransitionEvent2) this._addTransitionEvent2()

    const ev = new $.Event(Event.HIDE)
    $(this._sidebar).trigger(ev)
    if (ev.isDefaultPrevented()) return

    this._sidebar.classList.remove(ClassName.MOBILE_SHOW)
    this._updateTriggerBtns(this._triggerArrayMobile, false)

    // document.body.classList.remove('mob-sidebar-body') // moved to `_toggleMobileCompleted`

    if (this._config.dismiss) {
      $(this._triggerArrayMobile).css('pointer-events', '')
      $(document).off('.sidebar-dismiss')
    }
    if (this._config.swipe) {
      $(document).off('.sidebar-swipe')
    }

    if (Util.isReducedMotion()) this._toggleMobileCompleted()// call completion now
  }

  _updateTriggerBtns (btns, expanded = false) {
    for (let i = 0, len = btns.length; i < len; i++) {
      if (expanded) btns[i].classList.remove(ClassName.COLLAPSED)
      else btns[i].classList.add(ClassName.COLLAPSED)

      btns[i].setAttribute('aria-expanded', expanded)
    }
  }

  _toggleCompleted () {
    this._isTransitioning = false
    this._sidebar.classList.remove(ClassName.TOGGLING)

    const expanded = !this._sidebar.classList.contains(this._desktopCollapsedClass)
    if (expanded) $(this._sidebar).trigger(Event.EXPANDED)
    else $(this._sidebar).trigger(Event.COLLAPSED)

    if (expanded) this._inner.classList.remove(ClassName.INNER_HOVER)
  }

  _toggleMobileCompleted () {
    const shown = this._sidebar.classList.contains(ClassName.MOBILE_SHOW)
    if (shown) $(this._sidebar).trigger(Event.SHOWN)
    else {
      document.body.classList.remove('mob-sidebar-body')
      if (this._config.swipe) {
        document.body.classList.remove('mob-sidebarswipe-body')
      }

      $(this._sidebar).trigger(Event.HIDDEN)
    }
  }

  _addTransitionEvent () {
    if (this._hasTransitionEvent) return
    this._hasTransitionEvent = true
    let counter = 0

    $(this._sidebar)
      .on('transitionend', (e) => {
        if (e.target !== this._sidebar) return// make sure its not the children triggerring the event!

        this._toggleCompleted()

        counter = 0
      })

    // add 'is-hover' class to '.sidebar-inner' when it becomes expanded (i.e. when mouse hovers it)
    $(this._inner)
      .on('transitionstart', (e) => {
        // skip on mobile (in which propertyName is `transform`)
        if (e.target !== this._inner || this._isTransitioning || (e.originalEvent && e.originalEvent.propertyName !== 'width')) return

        counter++
        if (counter === 1) this._inner.classList.add(ClassName.INNER_HOVER)
        // else if (counter >= 2) {
        //  this.classList.remove(ClassName.INNER_HOVER)
        //  counter = 0
        // }
      })
      .on('transitionend', (e) => {
        // skip `transitionend` on mobile (in which propertyName is `transform`)
        if (e.target !== this._inner || (e.originalEvent && e.originalEvent.propertyName !== 'width')) return
        if (this._inner.clientWidth < 120) {
          // just to make sure we remove the extra class name when not needed
          this._inner.classList.remove(ClassName.INNER_HOVER)
          counter = 0
          // blur input element
          if (document.activeElement.tagName === 'INPUT' && this._inner.contains(document.activeElement)) document.activeElement.blur()
        }
      })
  }

  _addTransitionEvent2 () {
    if (this._hasTransitionEvent2) return
    this._hasTransitionEvent2 = true

    $(this._inner).on('transitionend', (e) => {
      if (e.target !== this._inner || (e.originalEvent && e.originalEvent.propertyName !== 'transform')) return

      this._toggleMobileCompleted()
    })
  }

  enableSwipeHide () {
    // swipe to hide sidebar
    let x1 = 0
    let y1 = 0
    let swipeDir = 0

    let isRTL = false
    let lastX = 0

    let pushContent = false
    let sidebarWidth = 0

    const touchMoveCallback = function (ev) {
      const touches = ev.changedTouches[0] || null
      if (!touches) return

      const newX = touches.pageX
      const newY = touches.pageY
      lastX = newX

      if (swipeDir === 0) {
        const diffY = Math.abs(y1 - newY)
        const diffX = Math.abs(x1 - newX)

        if (diffY > diffX) {
          swipeDir = 2// vertical i.e. scroll
          if (this._scroller) this._scroller.classList.remove('overflow-hidden')
          document.body.classList.remove('mob-sidebarswipe-body')

          $(document).off('touchmove.sidebar-swipe')
        } else if (diffX > 10) {
          swipeDir = 1// horizontal swipe
          this._inner.setAttribute('style', 'transition: none !important; touch-action: none;')
          if (this._scroller) this._scroller.classList.add('overflow-hidden')
          document.body.classList.add('mob-sidebarswipe-body')
        }
      }
      if (swipeDir !== 1) return

      const moveX = parseInt(x1 - newX)
      if ((!isRTL && moveX > 0) || (isRTL && moveX < 0)) { // move it outside of view
        this._inner.style.transform = 'translateX(' + (-1 * moveX) + 'px)'
        if (pushContent) this._sidebar.style.width = (sidebarWidth - (moveX > 0 ? moveX : -1 * moveX)) + 'px'
      } else {
        this._inner.style.transform = ''
        if (pushContent) this._sidebar.style.width = ''
      }
    }

    let t1 = 0
    $(document)
      .on('touchstart.sidebar-swipe', (e) => {
        const touches = e.originalEvent.changedTouches[0] || null
        if (!touches) return

        x1 = touches.pageX
        y1 = touches.pageY

        t1 = Date.now()
        isRTL = Util.isRTL()

        pushContent = this._sidebar.classList.contains('sidebar-push')
        if (pushContent) {
          sidebarWidth = this._sidebar.offsetWidth
          this._sidebar.style.minWidth = 'auto'
          this._sidebar.style.transition = 'none'
        }

        $(document)
          .on('touchmove.sidebar-swipe', (e) => {
            touchMoveCallback.call(this, e.originalEvent)
          })
      })
      .on('touchend.sidebar-swipe touchcancel.sidebar-swipe', (e) => {
        const touches = e.originalEvent.changedTouches[0] || null
        // if (!touches) return // in case we're coming from a `dismiss` mouseup event

        this._inner.setAttribute('style', '')
        if (pushContent) {
          this._sidebar.style.width = ''
          this._sidebar.style.minWidth = ''
          this._sidebar.style.transition = ''
        }

        const x2 = touches !== null ? touches.pageX : lastX
        const t2 = Date.now()

        if (swipeDir === 1 &&
            ( // dismiss if moved by more than 100px or moved more than 40px in a short time (less than 300ms)
              (!isRTL && (x1 - x2 > 100 || (x1 - x2 > 40 && t2 - t1 < 300))) || (isRTL && (x1 - x2 < -100 || (x1 - x2 < -40 && t2 - t1 < 300)))
            )
        ) { // if moved more than 100px or 40px in less than 300ms
          this.hide()
        } else {
          // remove '.mob-sidebarswipe-body' to bring back body scrollbars if sidebar isn't swiped to hide
          // but we probably won't have body scrollbars because of `.mob-sidebar-body`
          document.body.classList.remove('mob-sidebarswipe-body')
        }

        // bring back sidebar scrollbars
        if (this._scroller) this._scroller.classList.remove('overflow-hidden')

        swipeDir = 0
      })
  }

  enableSubmenuToggle () {
    const _firefox = 'MozAppearance' in document.documentElement.style
    const _scrollIntoViewOptions = 'scrollBehavior' in document.documentElement.style
    let isOpening = false

    const This = this
    $(this._sidebar).on('click', '.dropdown-toggle', function (ev) {
      ev.preventDefault()
      if (isOpening) return

      const navItem = $(this).closest('.nav-item')// get the parent LI.nav-item
      const subMenu = navItem.find('> .submenu').eq(0)// get the direct submenu (not the children)
      const navLink = navItem.find('> .nav-link').eq(0)// get the parent LI.nav-item

      let subPos = null
      if ((This._collapsed && This._sidebar.classList.contains('hoverable')) || This._sidebar.classList.contains('sidebar-hover')) {
        // don't toggle submenu if submenu is supposed to be displayed as popup (this includes horizontal sidebar when it's `.sidebar-hover`)
        subPos = window.getComputedStyle(subMenu.get(0)).position
        if (subPos === 'absolute') return
      }

      if (subMenu.hasClass('collapsing')) return// don't toggle in the middle of toggling

      // hide sibling submenus
      navItem.addClass('is-toggling')
      navItem.parent().find('> .nav-item.open').addClass('is-toggling').not(navItem).removeClass('open').find('> .submenu.show').collapse('hide')

      // toggle submenu
      if (navItem.hasClass('open')) {
        navItem.removeClass('open')
        navLink.addClass('collapsed')

        This._sidebar.classList.remove('has-open')
        subMenu.collapse('hide')
      } else {
        isOpening = true

        navItem.addClass('open')
        navLink.removeClass('collapsed')

        This._sidebar.classList.add('has-open')
        subMenu.collapse('show')
      }

      if (!subMenu.data('has-event')) {
        subMenu
          .data('has-event', true)
          .on('shown.bs.collapse.is-toggling hidden.bs.collapse.is-toggling', function () {
            isOpening = false
            $(This._sidebar).find('.is-toggling').removeClass('is-toggling')

            // firefox continues to disable scroll chaining when sidebar is not scrollable anymore, so a little fix around here
            if (_firefox) {
              if (This._scroller === null) return
              if (This._scroller.scrollHeight <= This._scroller.clientHeight) {
                This._scroller.style.overscrollBehavior = 'auto'
              } else This._scroller.style.overscrollBehavior = ''
            }
          })
      }

      // scroll submenu into view (only on modern browsers)
      if (!Util.isReducedMotion() && _scrollIntoViewOptions && This._config.subscroll && This._sidebar.classList.contains('sidebar-fixed') && navItem.hasClass('open')) {
        if (This._sidebar.classList.contains(ClassName.HORIZONTAL)) {
          subPos = window.getComputedStyle(subMenu.get(0)).position
          if (subPos === 'absolute') return // no scroll for desktop horizontal menu (when it's not `.sidebar-hover`)
        }

        const smooth = !Util.isReducedMotion()
        setTimeout(function () {
          try {
            if (_scrollIntoViewOptions) {
              subMenu.get(0).scrollIntoView({
                behavior: smooth ? 'smooth' : 'auto',
                block: 'nearest'
              })
            } else {
              // subMenu.get(0).scrollIntoView(false)
            }
          } catch (err) {}
        }, smooth ? 150 : 0)
      }
    })
  }

  enableSubmenuPullup () {
    if (this._pullupEnabled) return
    this._pullupEnabled = true

    const marginProp = 'margin-' + (!Util.isRTL() ? 'left' : 'right')

    const This = this
    $(this._sidebar).on('transitionstart', '.submenu', function (ev) {
      if (ev.target !== this || ev.originalEvent.propertyName !== marginProp || !(This._collapsed || This._sidebar.classList.contains('sidebar-hover'))) return

      const navItem = $(this).parent()
      const submenu = $(this)

      const navtxt = navItem.find('> .nav-link > .nav-text.fadeable')// only first level nav-text items

      navItem.removeClass('submenu-pullup')
      submenu.css('transform', '')
      navtxt.css('transform', '')

      /// ///////////////////////

      const rect = submenu.get(0).getBoundingClientRect()
      const wh = $(window).height()

      let diff = parseInt(rect.bottom - wh)

      if (diff > 0) { // if submenu bottom is below window area
        // check to see if submenu top will go out of window if we move it up by "diff" pixels
        // also consider that the first level item's .nav-text shouldn't go out of window's top
        const navtxtHeight = navtxt.height() || 0

        const diff2 = rect.top - navtxtHeight - diff - $('.navbar').height()// don't go above navbar
        if (diff2 < 0) diff = diff + diff2

        diff = parseInt(diff) + 1// so that submenu's border is visible
        if (This._collapsed) {
          if (navtxtHeight && diff > navtxtHeight / 2) navItem.addClass('submenu-pullup')// this class makes the .sub-arrow's color white, to match submenu color
        } else {
          navItem.addClass('submenu-pullup')
        }

        submenu.css('transform', 'translateY(-' + diff + 'px)')
        if (This._collapsed) {
          navtxt.css('transform', 'translateY(-' + diff + 'px)')
        }
      }
    })
  }

  disableSubmenuPullup () {
    this._pullupEnabled = false
    $(this._sidebar).off('transitionstart.pullup')
    this._resetPullUp()
  }

  _resetPullUp () {
    $(this._sidebar).find('.submenu-pullup').removeClass('submenu-pullup').find('.nav-text, .submenu').css('transform', '')
  }

  // scroll active item into view
  scrollToActive () {
    if (!this._sidebar.classList.contains('sidebar-fixed') || this._scroller === null) return

    const active = this._sidebar.querySelector('.nav-item.active:not(.open) > .nav-link')
    try {
      active.scrollIntoView({ behavior: 'auto', block: 'end' })// or block: "center"?
      this._scroller.scrollTop = this._scroller.scrollTop + 30
    } catch (e) {}
  }

  _getConfig (config) {
    config = {
      ...Default,
      ...typeof config === 'object' && config ? config : {}
    }

    if (typeof bootstrap !== 'undefined') {
      bootstrap.Util.typeCheckConfig(
        NAME,
        config,
        this.constructor.DefaultType
      )
    }

    return config
  }

  // Static methods
  static _jQueryInterface (config) {
    return this.each(function () {
      const $this = $(this)
      let data = $this.data(DATA_KEY)

      const _config = {
        ...Default,
        ...$this.data(),
        ...typeof config === 'object' && config ? config : {}
      }

      if (!data) {
        data = new Sidebar(this, _config)
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

/**
 * ------------------------------------------------------------------------
 * Data Api implementation
 * ------------------------------------------------------------------------
*/

$(window).on(Event.LOAD_DATA_API, () => {
  const sidebars = [].slice.call(document.querySelectorAll(Selector.SIDEBAR))

  for (let i = 0; i < sidebars.length; i++) {
    const $sidebar = $(sidebars[i])
    Sidebar._jQueryInterface.call($sidebar, $sidebar.data())
  }
})

/**
$(document).on(Event.CLICK_DATA_API, `${Selector.DATA_TOGGLE} , ${Selector.DATA_TOGGLE_MOBILE}`, function (event) {
	if (event.currentTarget.tagName === 'A') {
	  event.preventDefault()
	}

	const $trigger = $(this)
	const selector = bootstrap.Util.getSelectorFromElement(this)
	const selectors = [].slice.call(document.querySelectorAll(selector))

	$(selectors).each(function () {
	  const $target = $(this)
	  const data    = $target.data(DATA_KEY)
	  const config  = data ? 'toggle' : $trigger.data()
	  Sidebar._jQueryInterface.call($target, config)
	})
})
*/

/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
*/

if (typeof $ !== 'undefined') {
  const JQUERY_NO_CONFLICT = $.fn[NAME]
  $.fn[NAME] = Sidebar._jQueryInterface
  $.fn[NAME].Constructor = Sidebar
  $.fn[NAME].noConflict = () => {
    $.fn[NAME] = JQUERY_NO_CONFLICT
    return Sidebar._jQueryInterface
  }
}

export default Sidebar

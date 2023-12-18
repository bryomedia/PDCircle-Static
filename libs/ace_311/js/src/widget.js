/**
 * --------------------------------------------------------------------------
 * Ace (v3.1.1): widget.js
   Widgets based on Bootstrap's cards
*/

import $ from 'jquery'
import bootstrap from 'bootstrap'
import Util from './util'

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const NAME = 'aceWidget'
const VERSION = '3.1.1'
const DATA_KEY = 'ace.widget'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const Event = {
  SHOW: `show${EVENT_KEY}`,
  HIDE: `hide${EVENT_KEY}`,
  SHOWN: `shown${EVENT_KEY}`,
  HIDDEN: `hidden${EVENT_KEY}`,
  CLOSE: `close${EVENT_KEY}`,
  CLOSED: `closed${EVENT_KEY}`,
  EXPAND: `expand${EVENT_KEY}`,
  EXPANDED: `expanded${EVENT_KEY}`,
  RESTORE: `restore${EVENT_KEY}`,
  RESTORED: `restored${EVENT_KEY}`,
  // RELOADED: `reloaded${EVENT_KEY}`,
  RELOAD: `reload${EVENT_KEY}`,
  CLICK_DATA_API: `click${EVENT_KEY}${DATA_API_KEY}`
}
const Selector = {
  DATA_ACTION: '.card a[data-action]'
}

/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

class Widget {
  constructor (element, config) {
    this._config = this._getConfig(config)
    this._element = element
    this._element.offsetHeight // force reflow, so that if we instantly call 'close' etc, transition effect takes place
    this.$box = $(element)
  }

  static get VERSION () {
    return VERSION
  }

  /**
  static get DefaultType () {
    return DefaultType
  }

  static get Default () {
    return Default
  }
  */

  reload () {
    const ev = new $.Event(Event.RELOAD)
    this.$box.trigger(ev)
    if (ev.isDefaultPrevented()) return

    this.startLoading()
  }

  startLoading (loadingHtml = '<i class="bs-card-loading-icon fa fa-spinner fa-spin fa-2x text-white"></i>') {
    this.$box.append('<div class="bs-card-loading-overlay">' + loadingHtml + '</div>')
  }

  stopLoading () {
    this.$box.find('.bs-card-loading-overlay').remove()
  }

  closeFast () {
    const ev = new $.Event(Event.CLOSE)
    this.$box.trigger(ev)
    if (ev.isDefaultPrevented()) return

    this.$box.trigger(Event.CLOSED).remove()
  }

  close () {
    const ev = new $.Event(Event.CLOSE)
    this.$box.trigger(ev)
    if (ev.isDefaultPrevented()) return

    const $box = this.$box

    const _closeComplete = function () {
      if (this.hasClass('card-expand')) this.next('.card-expanded-placeholder').remove()// remove the placeholder
      this.trigger(Event.CLOSED).remove()
    }

    if (Util.isReducedMotion()) _closeComplete.call($box)
    else {
      $box.addClass('fade').on('transitionend.close', function (e) {
        if (e.target !== this) return// because transitionend might fire for children elements (like animated toolbar buttons)
        _closeComplete.call($box)
        $box.off('transitionend.close')
      })
    }
  }

  toggle (type) {
    const $box = this.$box
    const $body = $box.find('.card-body').eq(0)

    const action = (type && typeof type === 'string' && type.match(/show|hide/)[0]) || ($body.is(':visible') ? 'hide' : 'show')

    const eventName = action === 'hide' ? 'hide' : 'show'
    const ev = new $.Event(eventName + EVENT_KEY)
    this.$box.trigger(ev)
    if (ev.isDefaultPrevented()) return

    this._toggleIcon(type && typeof type === 'object' && type instanceof window.HTMLElement ? type : null, action)

    ///

    if (action === 'hide') $body.addClass('show')// .show class required for bs collapse plugin

    const eventCompleteName = action === 'hide' ? 'hidden' : 'shown'
    $body.collapse(action).one(eventCompleteName + '.bs.collapse', function () {
      $box.trigger(eventCompleteName + EVENT_KEY)
    })
  }

  hide () {
    this.toggle('hide')
  }

  show () {
    this.toggle('show')
  }

  toggleFast (type) {
    const $body = this.$box.find('.card-body').eq(0)
    const action = (type && typeof type === 'string' && type.match(/show|hide/)[0]) || ($body.is(':visible') ? 'hide' : 'show')

    const eventName = action === 'hide' ? 'hide' : 'show'
    const ev = new $.Event(eventName + EVENT_KEY)
    this.$box.trigger(ev)
    if (ev.isDefaultPrevented()) return

    $body.addClass('collapse')
    if (action === 'hide') $body.removeClass('show')
    else $body.addClass('show')

    this._toggleIcon(type && typeof type === 'object' && type instanceof window.HTMLElement ? type : null, action)

    const eventCompleteName = action === 'hide' ? 'hidden' : 'shown'
    this.$box.trigger(eventCompleteName + EVENT_KEY)
  }

  hideFast () {
    this.toggleFast('hide')
  }

  showFast () {
    this.toggleFast('show')
  }

  _toggleIcon (button, action) {
    if (!button) {
      button = this.$box.find('a[data-action=toggle]').get(0)
    }

    //
    if (button) {
      if (action === 'show') {
        button.classList.remove('collapsed')
      } else {
        button.classList.add('collapsed')
      }
    }
  }

  // fullscreen
  expand (expand, animate) {
    const button = this.$box.find('> .card-header a[data-action=expand]')

    const $expand = expand === true || !this.$box.hasClass('card-expand')
    animate = !((animate === false || Util.isReducedMotion()))// default is true

    const $box = this.$box
    const box = $box[0]

    if ($expand) {
      const ev = new $.Event(Event.EXPAND)
      this.$box.trigger(ev)
      if (ev.isDefaultPrevented()) return

      button.addClass('active')

      if (animate) {
        const rect = box.getBoundingClientRect()
        box.setAttribute('style', `left: ${rect.left}px; top: ${rect.top}px; width: ${rect.width}px; height: ${rect.height}px;`)
        box.classList.add('card-expanding')

        $box.on('transitionend.expanding', function (e) {
          if (e.target !== this) return// because transitionend might fire for children elements (like animated icons of toolbar)

          $box.off('transitionend.expanding')
            .removeClass('card-expanding')
            .trigger(Event.EXPANDED)
        })

        const placeholder = document.createElement('DIV')
        placeholder.classList.add('card-expanded-placeholder')
        placeholder.setAttribute('style', `width: ${rect.width}px; height: ${rect.height}px;`)
        box.parentNode.insertBefore(placeholder, box.nextSibling)// insert after

        box.offsetHeight// reflow...to force browser apply css/dom changes
        box.removeAttribute('style')
      }

      box.classList.add('card-expand')
      if (!animate) $box.trigger(Event.EXPANDED)
    } else { // restore
      const ev = new $.Event(Event.RESTORE)
      this.$box.trigger(ev)
      if (ev.isDefaultPrevented()) return

      button.removeClass('active')

      animate = animate && box.nextElementSibling !== null && box.nextElementSibling.classList.contains('card-expanded-placeholder')
      if (animate) {
        const rect1 = box.nextElementSibling.getBoundingClientRect()

        box.classList.add('card-expanding')
        box.setAttribute('style', `left: ${rect1.left}px; top: ${rect1.top}px; width: ${rect1.width}px; height: ${rect1.height}px;`)

        $box.on('transitionend.restoring', function (e) {
          if (e.target !== this) return// because transitionend might fire for children elements (like animated icons of toolbar)
          $box.next().remove()
          $box.off('transitionend.restoring')
            .removeClass('card-expanding')
            .attr('style', '')
            .trigger(Event.RESTORED)
        })
      }

      box.classList.remove('card-expand')
      if (!animate) $box.trigger(Event.RESTORED)
    }
  }// function expand

  expandFast () {
    return this.expand(true, false)
  }

  restore () {
    return this.expand(false)
  }

  restoreFast () {
    return this.expand(false, false)
  }

  _getConfig (config) {
    config = {
      // ...Default,
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
  static _jQueryInterface (config, value) {
    return this.each(function () {
      const $this = $(this)
      let data = $this.data(DATA_KEY)

      const _config = {
        // ...Default,
        ...$this.data(),
        ...typeof config === 'object' && config ? config : {}
      }

      if (!data) {
        data = new Widget(this, _config)
        $this.data(DATA_KEY, data)
      }

      if (typeof config === 'string') {
        if (typeof data[config] === 'undefined') {
          throw new TypeError(`No method named "${config}"`)
        }
        data[config](value)
      }
    })
  }
}

/**
 * ------------------------------------------------------------------------
 * Data Api implementation
 * ------------------------------------------------------------------------
*/

$(document).on(Event.CLICK_DATA_API, `${Selector.DATA_ACTION}`, function (event) {
  if (event.currentTarget.tagName === 'A') {
    event.preventDefault()
  }

  const $actionBtn = $(this)
  const $box = $actionBtn.closest('.card')
  if ($box.length === 0) return

  const $action = $actionBtn.data('action')
  $box.trigger(event = $.Event($action + EVENT_KEY))
  if (event.isDefaultPrevented()) return

  $box.aceWidget($action, this)
})

/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
*/

if (typeof $ !== 'undefined') {
  const JQUERY_NO_CONFLICT = $.fn[NAME]
  $.fn[NAME] = Widget._jQueryInterface
  $.fn[NAME].Constructor = Widget
  $.fn[NAME].noConflict = () => {
    $.fn[NAME] = JQUERY_NO_CONFLICT
    return Widget._jQueryInterface
  }
}

export default Widget

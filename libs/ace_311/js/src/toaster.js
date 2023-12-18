/**
 * --------------------------------------------------------------------------
 * Ace (v3.1.1): toaster.js
   Wrapper for Bootstrap's toast elements
*/

import $ from 'jquery'
import bootstrap from 'bootstrap'

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const NAME = 'aceToaster'
const VERSION = '3.1.1'
const DATA_KEY = 'ace.toaster'
const EVENT_KEY = `.${DATA_KEY}`

const Event = {
  CLEAR: `clear${EVENT_KEY}`,
  ADD: `add${EVENT_KEY}`,
  ADDED: `added${EVENT_KEY}`
}

const DefaultType = {
  placement: 'string',
  close: 'boolean',
  autoremove: 'boolean',
  delay: 'number',
  template: 'string',
  alert: 'boolean'
}

const Default = {
  placement: 'tr',
  close: true,
  autoremove: true,
  delay: 2500,
  template: '<div class="toast"><div class="d-flex"><div class="toast-image"></div><div class="toast-main"><div class="toast-header"></div><div class="toast-body"></div></div></div></div>',
  alert: true
}

/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

class Toaster {
  constructor () {
    this._lastToastId = 0
    this._toast = null
  }

  static get VERSION () {
    return VERSION
  }

  static get DefaultType () {
    return DefaultType
  }

  static get Default () {
    return Default
  }

  // Public methods
  add (config) {
    const _config = this._getConfig(config)

    const $newToast = $(_config.template)
    this._toast = $newToast[0]

    this._lastToastId++
    $newToast.addClass('ace-toaster-item').attr({ id: `ace-toaster-item-${this._lastToastId}`, 'aria-atomic': 'true' })
    if (_config.alert) {
      $newToast.attr({ role: 'alert', 'aria-live': 'assertive' })
    } else {
      $newToast.attr({ role: 'status', 'aria-live': 'polite' })
    }

    const $toastHeader = $newToast.find('.toast-header')
    if (_config.title) {
      let title = typeof _config.title === 'function' ? _config.title.call(this._toast, _config) : _config.title
      title = $(`<div class="toast-title">${title}</div>`)

      if (_config.titleClass) {
        title.addClass(_config.titleClass)
      }
      $toastHeader.append(title)
    }

    if (_config.close) {
      let close = $newToast.find('[data-dismiss="toast"]')
      if (close.length === 0) {
        close = $('<button type="button" data-dismiss="toast" aria-label="Close"><span aria-hidden="true">&times;</span></button>')
        $toastHeader.append(close)
      }
      close.addClass(_config.closeClass ? _config.closeClass : 'close')
    }

    if (_config.body) {
      $newToast.find('.toast-body').append(typeof _config.body === 'function' ? _config.body.call(this._toast, _config) : _config.body)
      if (_config.bodyClass) {
        $newToast.find('.toast-body').addClass(_config.bodyClass)
      }
    }

    if (_config.image) {
      $newToast.find('.toast-image').append(`<img src="${_config.image}" />`)
      if (_config.imageClass) {
        $newToast.find('.toast-image').find('img').addClass(_config.imageClass)
      }
    }
    if (_config.icon) {
      const icon = $(_config.icon).appendTo($newToast.find('.toast-image'))
      if (!_config.image && _config.imageClass) {
        icon.addClass(_config.imageClass)
      }
    }
    if (!(_config.image || _config.icon)) $newToast.find('.toast-image').remove()

    if (_config.className) {
      $newToast.addClass(_config.className)
    }
    if (_config.headerClass) {
      $toastHeader.addClass(_config.headerClass)
    }

    // if delay is below 30, we consider it as seconds, not milliseconds
    _config.delay = _config.delay > 30 ? _config.delay : _config.delay * 1000

    if (_config.progress && !_config.sticky && _config.autohide !== false) {
      const progress = $(`<div class="toast-progress ${_config.progress}"></div>`).appendTo($newToast)
      progress.get(0).style.transition = `width ${parseInt(_config.delay * 1.015)}ms linear`
      progress.get(0).style.width = _config.progressReverse ? 'calc(100% - 1px)' : 0
      // progress.get(0).offsetWidth
      setTimeout(function () {
        progress.get(0).style.width = _config.progressReverse ? 0 : 'calc(100% - 2px)'
      }, 0)
    }

    return this._addToContainer($newToast, _config)
  }

  // add an existing toast element to our container
  addEl (element, config) {
    const _config = this._getConfig(config)

    this._toast = element
    const $existingToast = $(this._toast).addClass('ace-toaster-item')
    if (!$existingToast.attr('id')) $existingToast.attr('id', `ace-toaster-item-${++this._lastToastId}`)

    this._addToContainer($existingToast, _config, false)
  }

  // add toast element to container
  _addToContainer ($toast, _config, isNewElement = true) {
    // trigger ADD event before adding it to our container
    const addEvent = new $.Event(Event.ADD)
    const _toast = $toast.get(0)
    addEvent.target = _toast

    $(document).trigger(addEvent)
    if (addEvent.isDefaultPrevented()) {
      if (isNewElement) $toast.remove()
      return null
    }
    // end of trigger

    // add the toaster container to body
    let container = $(`.ace-toaster-container.position-${_config.placement}`).eq(0)
    if (container.length === 0) {
      container = $(`<div class="ace-toaster-container position-${_config.placement}"/>`).appendTo(document.body)
    }
    if (_config.belowNav) {
      container.addClass('toaster-below-nav')
    }

    // add to container
    if (_config.placement.indexOf('b') === 0) { // bottom placement
      container.prepend($toast)
    } else {
      container.append($toast)
    }

    // without having an initial .toast element, fade-in animation isn't taking place??!!
    let dummy = $('#ace-toaster-dummy-toast-1')
    if (dummy.length === 0) dummy = $('<div id="ace-toaster-dummy-toast-1" class="toast d-none invisible"></div>').appendTo('body')
    dummy.toast('show')
    /// ///////////////////////////////////////////////

    const _toastOptions = {}
    if (_config.sticky === true || _config.autohide === false) _toastOptions.autohide = false
    if (_config.animation === false) _toastOptions.animation = false
    _toastOptions.delay = _config.delay

    if (_config.width) $toast.css('width', isNaN(_config.width) ? _config.width : _config.width + 'px')

    $toast
      .toast(_toastOptions)
      .toast('show')
      .one('hidden.bs.toast.1', function () {
        // show it again (invisibly with opacity = 0) and use bootstrap Collapse plugin to hide it, so that other toasts stacked below it move up smoothly
        $toast.removeClass('hide').addClass('show').collapse('hide').one('hidden.bs.collapse', function () {
          $toast.toast('dispose')
          if (_config.autoremove) {
            $toast.remove()
          }
        })
      })

    // trigger ADDED event before adding it to DOM
    const addedEvent = new $.Event(Event.ADDED)
    addedEvent.target = _toast

    $(document).trigger(addedEvent)

    return _toast
  }

  // hide toasts
  remove (id, instant = false) {
    this.hide(id, true, instant)
  }

  removeAll (placement = null, instant = false) {
    this.hideAll(placement, true, instant)
  }

  // remove toast by ID or element reference
  hide (id, remove = false, instant = false) {
    const selector = isNaN(id) ? id : '#ace-toaster-item-' + parseInt(id)
    this._hideBySelector(selector, remove, instant)
  }

  // remove ALL toasts
  hideAll (placement = null, remove = false, instant = false) {
    // trigger CLEAR event before removing ALL
    const clearEvent = new $.Event(Event.CLEAR) // ,  { placement: placement || 'all', remove: remove })
    $(document).trigger(clearEvent, { placement: placement || 'all', remove: remove })
    if (clearEvent.isDefaultPrevented()) {
      return
    }
    // end of trigger

    let selector = '.toast.ace-toaster-item'
    if (placement) selector = `.ace-toaster-container.position-${placement} ${selector}`
    this._hideBySelector(selector, remove, instant)
  }

  _hideBySelector (selector, remove = false, instant = false) {
    $(selector).each(function () {
      const $toast = $(this)
      if (!instant && $toast.is(':visible')) {
        // fade out and then remove
        $toast.toast('hide')
          .off('hidden.bs.toast.1')// remove the previous handler above (because it has autoremove)
          .one('hidden.bs.toast.2', function () {
            $toast.toast('dispose')
            if (remove) $toast.remove()
          })
      } else {
        $toast.toast('dispose')
        // instantly remove if not visible
        if (remove) $toast.remove()
      }
    })
  }

  // Private methods
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
      config = {
        ...{ autoremove: false }, // don't autoremove it
        ...$(this).data(),
        ...typeof config === 'object' && config ? config : {}
      }

      $.aceToaster.addEl(this, config)
    })
  }
}

/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
*/

if (typeof $ !== 'undefined') {
  $[NAME] = new Toaster()
  const JQUERY_NO_CONFLICT = $.fn[NAME]
  $.fn[NAME] = Toaster._jQueryInterface
  $.fn[NAME].Constructor = Toaster
  $.fn[NAME].noConflict = () => {
    $.fn[NAME] = JQUERY_NO_CONFLICT
    return Toaster._jQueryInterface
  }
}

export default Toaster

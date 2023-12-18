/**
 * --------------------------------------------------------------------------
 * Ace (v3.1.1): aside.js
   Aside element based on Bootstrap's modal
*/

import $ from 'jquery'
import bootstrap from 'bootstrap'
import Util from './util'

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const NAME = 'aceAside'
const VERSION = '3.1.1'
const DATA_KEY = 'ace.aside'
const EVENT_KEY = `.${DATA_KEY}`

const Event = {
  SHOW: `show${EVENT_KEY}`,
  HIDE: `hide${EVENT_KEY}`
}

const DefaultType = {
  placement: 'string',
  // margin: 'number',

  fade: 'boolean',

  autohide: '(boolean|number)',
  dismiss: 'boolean',

  blocking: 'boolean',
  backdrop: '(boolean|string)',

  container: 'boolean',
  belowNav: 'boolean',
  aboveNav: 'boolean',

  width: '(boolean|number)',
  height: '(boolean|number)',

  scroll: '(boolean|string)'
}

const Default = {
  placement: 'center',
  // margin: 0,

  fade: false,

  autohide: false,
  dismiss: false,

  blocking: false,
  backdrop: false,

  container: false,
  belowNav: false,
  aboveNav: false,

  width: false,
  height: false,

  scroll: 'body'
}

/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

class Aside {
  constructor (element, config) {
    this._config = this._getConfig(config)
    this._element = element
    this.$element = $(element)

    this._init(this._config)
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

  _init (config) {
    this._setPlacement(config.placement)

    this._element.classList.add('ace-aside')

    if (!config.blocking) {
      this._element.classList.add('modal-nb')
      this.$element.attr('data-backdrop', 'false').data('backdrop', false)
    } else {
      if (config.backdrop) {
        this.$element.attr('data-backdrop-bg', config.backdrop)
      }
      this.$element.attr('data-backdrop', 'true').data('backdrop', true)
    }

    if (config.dismiss) this._element.classList.add('modal-dismiss')

    if (config.fade) {
      this._element.classList.add('aside-fade', 'fade')
    }

    if (config.belowNav) this._element.classList.add('aside-below-nav')
    if (config.aboveNav) this._element.classList.add('aside-above-nav')

    if (config.extraClass) this._element.classList.add(...config.extraClass.split(' '))

    if (config.container) {
      this._element.classList.add('container')
      const bdc = document.querySelector('.body-container')
      if (bdc !== null && bdc.classList.contains('container-plus')) {
        this._element.classList.add('container-plus')
      }
    }

    if (config.width) {
      this.$element.find('.modal-dialog').css('width', isNaN(config.width) ? config.width : this._config.width + 'px')
    }
    if (config.height) {
      this.$element.find('.modal-dialog').css('height', isNaN(config.height) ? config.height : this._config.height + 'px')
    }

    // if (/^(content|body)$/.test(config.scroll)) {
    //  this.$element.find('.modal-content').addClass('scroll-' + config.scroll)
    // }

    this.$element.off('shown.bs.modal.autohide')
    if (config.autohide) {
      const This = this
      this.$element.on('shown.bs.modal.autohide', function () {
        setTimeout(function () {
          This.hide()
        }, config.autohide)
      })
    }
  }

  _setPlacement (placement = 'center') {
    const placementMap = {
      t: 'aside-top',
      top: 'aside-top',
      tc: 'aside-top aside-c',
      tr: 'aside-top aside-r',
      tl: 'aside-top aside-l',

      b: 'aside-bottom',
      bottom: 'aside-bottom',
      bc: 'aside-bottom aside-c',
      br: 'aside-bottom aside-r',
      bl: 'aside-bottom aside-l',

      r: 'aside-right',
      right: 'aside-right',
      rc: 'aside-right aside-m',

      l: 'aside-left',
      left: 'aside-left',
      lc: 'aside-left aside-m',

      c: 'aside-center',
      center: 'aside-center'
    }

    placement = placement || 'c'
    const className = placementMap[placement] || 'aside-center'
    if (placement === 'c' || placement === 'center') {
      this._config.fade = true
      this._element.classList.remove('container')
    }

    this._element.className = this._element.className + ' ' + className
  }

  // Public methods
  show () {
    const showEvent = new $.Event(Event.SHOW)
    this.$element.trigger(showEvent)
    if (showEvent.isDefaultPrevented()) {
      return
    }

    this.$element.modal('show')
  }

  hide () {
    const hideEvent = new $.Event(Event.HIDE)
    this.$element.trigger(hideEvent)
    if (hideEvent.isDefaultPrevented()) {
      return
    }

    this.$element.modal('hide')
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
      const $this = $(this)
      let data = $this.data(DATA_KEY)

      const _config = {
        ...Default,
        ...$(this).data(),
        ...typeof config === 'object' && config ? config : {}
      }

      if (!data) {
        data = new Aside(this, _config)
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

  //
  static _HandleAside () {
    const visibleModalSelector = '.modal.show:not(.modal-nb)'
    let dismissEventId = 0

    $('.ace-aside.modal-nb').attr('data-backdrop', 'false').data('backdrop', false)

    $(document)
      .on('show.bs.modal', '.modal', function (e) {
        if (e.isDefaultPrevented()) return

        const modal = this
        if (modal.classList.contains('modal-nb')) {
          if ($(visibleModalSelector).length === 0) {
            document.body.classList.add('modal-nb')// disable .modal-open effects for .modal-nb
          }
        } else {
          if (!modal.classList.contains('ace-aside')) {
            // check to see if we will have modal scrollbars
            modal.style.display = 'block'
            if (modal.scrollHeight > modal.clientHeight) document.body.classList.add('modal-scroll')
            const scrollbars = Util.getScrollbarInfo()
            if (scrollbars.width === 0) document.body.classList.add('scrollbar-w0')
            modal.style.display = ''
          }

          // set modal padding value (equal to scrollbar width)
          document.body.style.setProperty('--modal-padding', (window.innerWidth - document.body.scrollWidth) + 'px')

          const isModalOff = modal.className.match(/modal-off(-[a-z0-9]*)?/i)

          const backdropBg = $(modal).attr('data-backdrop-bg')
          if (backdropBg || isModalOff) {
            setTimeout(function () {
              const backdrop = document.querySelector('.modal-backdrop:last-child')
              if (backdrop !== null) {
                if (backdropBg) backdrop.classList.add(backdropBg)

                // for example if our modal is a `.modal-off-lg` then we add `.d-lg-none` to `.modal-backdrop` to hide it in `lg+` view
                if (isModalOff) backdrop.classList.add(`d${isModalOff[1] || ''}-none`)
              }
            }, 0)
          }

          const blur = modal.getAttribute('data-blur')
          if (blur !== null && window.CSS) {
            /**
             // using `backdrop-filter` is less intrusive but doesn't have the same blur effect
             if (window.CSS.supports("backdrop-filter", "none")) {
              setTimeout(function () {
                $('.modal-backdrop:last-child').addClass('modal-blur')
              }, 0)
            }
            else */
            if (window.CSS.supports('filter', 'none')) {
              const bodyContainer = document.querySelector('.body-container')
              if (bodyContainer !== null) {
                document.body.classList.add('modal-blur')
                bodyContainer.style.filter = 'blur(' + blur + ')'

                const modalParent = modal.parentNode
                const modalSibling = modal.nextSibling

                $(modal).appendTo('body').one('hidden.bs.modal.blur', function () {
                  modalParent.insertBefore(modal, modalSibling)
                  document.body.classList.remove('modal-blur')
                  bodyContainer.style.filter = ''
                })
              }
            }
          }
        }
      })
      .on('shown.bs.modal', '.modal', function (e) {
        const modal = this

        if (modal.classList.contains('modal-nb')) {
          document.body.classList.remove('modal-nb')

          if ($(visibleModalSelector).length === 0) { // if no blocking modals
            document.body.classList.remove('modal-open')// disable .modal-open effects
            document.body.style.paddingRight = ''// and remove paddingRight
          }

          if (modal.classList.contains('modal-dismiss') || modal.getAttribute('data-dismiss') === 'true') {
            // we add an extra ID to our event namespace
            // because sometimes before a dismissible modal is hidden inside the below setTimeout, another dismissible gets shown and registers the following event which gets
            // cleared in the on.hidden event below ... so we use different IDs for each one ...
            modal.setAttribute('data-dismiss-event-id', ++dismissEventId)
            $(document).on('mouseup.aside-dismiss.' + dismissEventId, function (e) {
              // why mouseup? because 'click' may get 'stopPropagated' in some plugins such as Bootstrap's dropdown
              if (!$.contains(modal, e.target)) { // clicked outside modal
                // why timeout?
                // because if we click on the same button that triggers this modal, its 'hide' function will be called and instantly followed by 'show' function
                // so we first let 'show' be called and then we call 'hide'
                setTimeout(function () {
                  $(modal).modal('hide')
                }, 0)
              }
            })
          }
        }
      })
      .on('hidden.bs.modal', '.modal', function () {
        if ($(visibleModalSelector).length === 0) document.body.style.paddingRight = ''// required for rare cases that body padding is still not cleared
        else document.body.classList.add('modal-open') // sometimes an aside is closed (so .modal-open is removed) but a .modal is still open (so we add .modal-open again)

        if (!this.classList.contains('modal-nb')) {
          document.body.classList.remove('modal-scroll')
          document.body.classList.remove('scrollbar-w0')
        }

        // we might have dismissed modal dialog using the close button inside it, so we turn off the events looking for clicks outside modal
        if (this.classList.contains('modal-dismiss') || this.getAttribute('data-dismiss') === 'true') {
          const eid = this.getAttribute('data-dismiss-event-id')
          $(document).off('.aside-dismiss.' + eid)
        }
      })

    // enable modal functionality for modal boxes and asides that are shown (.show) by default
    $('.modal.show').modal('show')
  }
}

/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
*/

if (typeof $ !== 'undefined') {
  Aside._HandleAside()

  const JQUERY_NO_CONFLICT = $.fn[NAME]
  $.fn[NAME] = Aside._jQueryInterface
  $.fn[NAME].Constructor = Aside
  $.fn[NAME].noConflict = () => {
    $.fn[NAME] = JQUERY_NO_CONFLICT
    return Aside._jQueryInterface
  }
}

export default Aside

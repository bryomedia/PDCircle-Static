/**
 * --------------------------------------------------------------------------
 * Ace (v3.1.1): general.js
   General Ace Functions
*/

import $ from 'jquery'
import Util from './util'

class Basic {
  static _HandleBasics () {
    // for IE
    if (window.NodeList && !window.NodeList.prototype.forEach) {
      window.NodeList.prototype.forEach = Array.prototype.forEach
    }

    Basic._handleAlerts()

    Basic._handleDropdowns()

    Basic._handleNavbar()

    Basic._handleOther()

    $(document.body).addClass('is-document-loaded')
  }

  /**
   * collapse .alert instead of fading it out
  */
  static _handleAlerts () {
    $(document)
      .on('close.bs.alert.alert-collapse', '.alert.alert-collapse', function (e) {
        e.preventDefault()
        $(this).wrap('<div class="collapse show alert-collapse"></div>').parent().collapse('hide').one('hidden.bs.collapse.alert-collapse', function () {
          $(this).remove()
        })
      })
  }

  /// ////////

  static _handleDropdowns () {
    // dismiss (hide) a dropdown menu
    const _dismissDropdown = function () {
      const menu = $(this).closest('.dropdown-menu')
      const dropdown = menu.parent()
      const toggle = dropdown.find('[data-toggle=dropdown]')

      toggle.dropdown('hide')
      menu.removeClass('show')
      dropdown.removeClass('show')
    }

    // hide dropdown when clicked on an element inside it with `data-dismiss=dropdown` attribute
    $(document)
      .on('click', '[data-dismiss=dropdown]', function (e) {
        e.preventDefault()
        _dismissDropdown.call(e.target)
      })

    // hide dropdown when a `form` inside it is submitted
    $(document)
      .on('submit', '.dropdown-menu form[data-submit=dismiss]', function (e) {
        e.preventDefault()
        _dismissDropdown.call(e.target)
      })

    // don't hide dropdown when clicked inside a `.dropdown-clickable` element
    $(document)
      .on('click.dropdown-clickable', '.dropdown-clickable', function (e) {
        e.stopImmediatePropagation()
      })

    // hide `body` scrollbars when dropdowns are opened in mobile view
    $(document)
      .on('shown.bs.dropdown', '.dropdown.dd-backdrop', function () {
      // check `display` of .dropdown::before, if not visible it means `backdrop` is not visible (applied)
        if (window.getComputedStyle(this, ':before').display === 'none') return

        // the device width is such that backdrop is visible (.dropdown-inner is visible)
        const scrollbarInfo = Util.getScrollbarInfo()
        if (scrollbarInfo.width === 0) {
          document.body.classList.add('mob-dropdown-body')
        }
        this.classList.add('backdrop-shown')// used later to add `.navbar-modal` class to .navbar

        $(this).one('hidden.bs.dropdown', function () {
          document.body.classList.remove('mob-dropdown-body')
          this.classList.remove('backdrop-shown')
        })
      })
  }

  /// ////////

  static _handleNavbar () {
    // hide `.navbar-collapse` when clicked on it (specifically on the backdrop in mobile view)
    $(document)
      .on('click', '.navbar-backdrop.collapse.show', function (e) {
        if (e.target === this) $(this).collapse('hide')
      })

    // hide dropdown when a `form` inside it is submitted
    $(document)
      .on('submit', '.navbar-collapse.show form[data-submit=dismiss]', function (e) {
        e.preventDefault()
        $(this).closest('.navbar-collapse').collapse('hide')
      })

    // when navbar or a dropdown-menu inside it is displayed, move focus to the ".autofocus" element.
    // For example a search box can be .autofocus
    $(document)
      .on('shown.bs.dropdown', '.navbar .dropdown', function () {
        $(this).find('.autofocus').focus()
      })
      .on('shown.bs.collapse', '.navbar-collapse', function () {
        $(this).find('.autofocus').focus()

        // also hide body scrollbars in mobile devices
        if (this.classList.contains('navbar-backdrop')) {
          const scrollbarInfo = Util.getScrollbarInfo()
          if (scrollbarInfo.width === 0) {
            document.body.classList.add('mob-navbar-body')
          }
        }
      })
      .on('hidden.bs.collapse', function () {
        document.body.classList.remove('mob-navbar-body')
      })
      .on('show.bs.collapse', function () {
        // hide other 'shown/open' ones
        $('.navbar-collapse.show').css('transition-duration', '1ms').collapse('hide').css('transition-duration', '')
      })

    // if navbar dropdowns are not entirely inside window area, move them accordingly
    const _adjustDropdown = function () {
      const isRTL = Util.isRTL()
      const isRightAligned = this.classList.contains('dropdown-menu-right')

      const _dir = !isRightAligned ? (!isRTL ? 'left' : 'right') : (!isRTL ? 'right' : 'left')
      const prop = 'margin-' + _dir

      this.style.removeProperty(prop)

      let moveBy = 0
      const rect = this.getBoundingClientRect()
      if (rect.left < 0) {
        moveBy = parseInt(-1 * rect.left) + 5
      } else {
        const sw = document.body.scrollWidth
        if (rect.right > sw) {
          moveBy = parseInt(sw - rect.right - 5)
        }
      }

      if (moveBy < 5) return

      if (isRightAligned) moveBy *= -1
      this.style.setProperty(prop, moveBy + 'px', 'important')
    }

    const _closest = 'closest' in document.documentElement
    $(document)
      .on('transitionstart.adjust', '.navbar .dropdown-mega .dropdown-menu', function (ev) {
        if (ev.target !== this || ev.originalEvent.propertyName !== 'transform') return
        _adjustDropdown.call(this)
      })
      .on('shown.bs.dropdown', '.navbar .dropdown', function () {
        if (this.classList.contains('dropdown-mega')) {
          const dropdown = this.querySelector('.dropdown-menu[data-display="static"]')
          if (dropdown !== null) _adjustDropdown.call(dropdown)
        }

        // when a .dropdown is opened, add .navbar-open to increase z-index, so that dropdowns go above 'asides', etc
        if (_closest) {
          const navbar = this.closest('.navbar')
          if (this.classList.contains('backdrop-shown')) navbar.classList.add('navbar-modal')
          else navbar.classList.add('navbar-open')
        }
      })
      .on('hidden.bs.dropdown', '.navbar .dropdown', function () {
        if (_closest) {
          const navbar = this.closest('.navbar')
          navbar.classList.remove('navbar-open')
          navbar.classList.remove('navbar-modal')
        }
      })
  }

  /// ////////

  static _handleOther () {
    document.querySelectorAll('.input-floating-label input').forEach((inp) => {
      if (inp.value !== '') inp.classList.add('has-content')
      else inp.classList.remove('has-content')
    })

    document.addEventListener('focusout', (ev) => {
      const inp = ev.target
      if ('matches' in inp) {
        if (!inp.matches('.input-floating-label input')) return
      } else if ('msMatchesSelector' in inp && !inp.msMatchesSelector('.input-floating-label input')) return

      if (inp.value !== '') inp.classList.add('has-content')
      else inp.classList.remove('has-content')
    })
  }
}

/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
*/

if (typeof $ !== 'undefined') {
  Basic._HandleBasics()
}

export default Basic

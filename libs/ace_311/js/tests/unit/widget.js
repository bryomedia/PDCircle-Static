$(function () {
  'use strict'
  /* global QUnit */
  /* global $ */
  /* global AceApp */

  QUnit.module('widget plugin')

  QUnit.test('should be defined on jquery object', function (assert) {
    assert.expect(1)
    assert.ok($(document.body).aceWidget, 'widget method is defined')
  })

  QUnit.module('aceWidget', {
    beforeEach: function () {
      // Run all tests in noConflict mode -- it's the only way to ensure that the plugin works in noConflict mode
      $.fn.aceWidgetNC = $.fn.aceWidget.noConflict()
    },
    afterEach: function () {
      $.fn.aceWidget = $.fn.aceWidgetNC
      delete $.fn.aceWidgetNC
      $('#qunit-fixture').html('')
    }
  })

  QUnit.test('should provide no conflict', function (assert) {
    assert.expect(1)
    assert.strictEqual(typeof $.fn.aceWidget, 'undefined', 'aside was set back to undefined (org value)')
  })

  QUnit.test('should return jquery collection containing the element', function (assert) {
    assert.expect(2)
    var $el = $('<div/>')
    var $widget = $el.aceWidgetNC()
    assert.ok($widget instanceof $, 'returns jquery collection')
    assert.strictEqual($widget[0], $el[0], 'collection contains element')
  })

  QUnit.test('shoud hide/collapse widget', function (assert) {
    assert.expect(2)
    var done = assert.async()

    var widget = $('<div class="card"><div class="card-header"></div><div class="card-body"></div></div>').appendTo('#qunit-fixture')
    widget.one('hidden.ace.widget', function () {
      assert.ok(widget.find('.card-body').is('.collapse:not(.show)'))
      done()
    })

    widget.aceWidgetNC('hide')
    assert.ok(widget.find('.card-body').is('.collapsing'))
  })

  QUnit.test('shoud hide/collapse widget fast', function (assert) {
    assert.expect(1)
    var done = assert.async()

    var d1 = new Date()
    var t1 = d1.getTime()

    var widget = $('<div class="card"><div class="card-header"></div><div class="card-body"></div></div>').appendTo('#qunit-fixture')
    widget.one('hidden.ace.widget', function () {
      var d2 = new Date()
      var t2 = d2.getTime()

      assert.ok(t2 - t1 < 20)
      done()
    })

    widget.aceWidgetNC('toggleFast')
  })

  QUnit.test('shoud show widget', function (assert) {
    assert.expect(2)
    var done = assert.async()

    var widget = $('<div class="card"><div class="card-header"></div><div class="card-body collapse"></div></div>').appendTo('#qunit-fixture')
    widget.one('shown.ace.widget', function () {
      assert.ok(widget.find('.card-body').is('.show'))
      done()
    })

    widget.aceWidgetNC('show')
    assert.ok(widget.find('.card-body').is('.collapsing'))
  })

  QUnit.test('shoud show widget fast', function (assert) {
    assert.expect(1)
    var done = assert.async()

    var d1 = new Date()
    var t1 = d1.getTime()

    var widget = $('<div class="card"><div class="card-header"></div><div class="card-body collapse"></div></div>').appendTo('#qunit-fixture')
    widget.one('shown.ace.widget', function () {
      var d2 = new Date()
      var t2 = d2.getTime()

      assert.ok(t2 - t1 < 20)
      done()
    })

    widget.aceWidgetNC('toggleFast')
  })

  QUnit.test('shoud close/remove widget', function (assert) {
    assert.expect(2)
    var done = assert.async()

    var widget = $('<div class="card"></div>').appendTo('#qunit-fixture')
    widget.one('closed.ace.widget', function () {
      setTimeout(function () {
        assert.equal(widget.get(0).parentElement, null)
        done()
      }, 0)
    })

    widget.aceWidgetNC('close')
    assert.ok(widget.is('.fade'))
  })

  QUnit.test('shoud close/remove widget fast', function (assert) {
    assert.expect(2)
    var done = assert.async()

    var d1 = new Date()
    var t1 = d1.getTime()

    var widget = $('<div class="card"></div>').appendTo('#qunit-fixture')
    widget.one('closed.ace.widget', function () {
      setTimeout(function () {
        var d2 = new Date()
        var t2 = d2.getTime()

        assert.ok(t2 - t1 < 20)
        assert.equal(widget.get(0).parentElement, null)

        done()
      }, 0)
    })

    widget.aceWidgetNC('closeFast')
  })

  QUnit.test('shoud expand/restore widget', function (assert) {
    assert.expect(7)
    var done = assert.async()

    var widget = $('<div class="card"></div>').appendTo('#qunit-fixture')
    widget
      .one('expanded.ace.widget', function () {
        assert.ok(widget.hasClass('card-expand'))
        assert.equal(widget.outerWidth(), $(window).width())
        assert.equal(widget.outerHeight(), $(window).height())

        widget.aceWidgetNC('restore')
      })
      .one('restored.ace.widget', function () {
        assert.notOk(widget.hasClass('card-expand'))
        assert.notEqual(widget.outerWidth(), $(window).width())
        assert.notEqual(widget.outerHeight(), $(window).height())

        done()
      })

    widget.aceWidgetNC('expand')
    assert.ok(widget.is('.card-expanding'))
  })

  QUnit.test('shoud expand widget fast', function (assert) {
    assert.expect(1)
    var done = assert.async()

    var d1 = new Date()
    var t1 = d1.getTime()

    var widget = $('<div class="card"></div>').appendTo('#qunit-fixture')
    widget.one('expanded.ace.widget', function () {
      var d2 = new Date()
      var t2 = d2.getTime()

      assert.ok(t2 - t1 < 20)
      done()
    })

    widget.aceWidgetNC('expandFast')
  })

  QUnit.test('shoud remove placeholder of an expanded widget', function (assert) {
    assert.expect(3)
    var done = assert.async()

    var widget = $('<div class="card"></div>').appendTo('#qunit-fixture')
    widget
      .one('expanded.ace.widget', function () {
        widget.aceWidgetNC('close')
      })
      .one('closed.ace.widget', function () {
        assert.equal($('.card-expanded-placeholder').length, 0)
        setTimeout(function () {
          assert.equal(widget.get(0).parentElement, null)
          done()
        }, 0)
      })

    widget.aceWidgetNC('expand')
    assert.equal($('.card-expanded-placeholder').length, 1)
  })

  QUnit.test('shoud add/remove loading overlay', function (assert) {
    assert.expect(2)

    var widget = $('<div class="card"></div>').appendTo('#qunit-fixture')

    widget.aceWidgetNC('startLoading', '<i class="bs-card-loading-icon fa fa-spinner fa-spin fa-2x text-white">LOADING</i>')
    assert.ok(widget.text().indexOf('LOADING') >= 0)

    widget.aceWidgetNC('stopLoading')
    assert.ok(widget.text().indexOf('LOADING') === -1)
  })

  QUnit.test('shoud prevent collapsing/showing/closing/expanding/restoring card', function (assert) {
    assert.expect(3)

    var widget = $('<div class="card"><div class="card-header"></div><div class="card-body"></div></div>').appendTo('#qunit-fixture')
    widget
      .on('hide.ace.widget', function (ev) {
        ev.preventDefault()
      })
      .on('expand.ace.widget', function (ev) {
        ev.preventDefault()
      })
      .on('close.ace.widget', function (ev) {
        ev.preventDefault()
      })

    widget.aceWidgetNC('hide')
    assert.notOk(widget.find('.card-body').is('.collapsing'))

    widget.aceWidgetNC('expand')
    assert.notOk(widget.is('.card-expanding'))

    widget.aceWidgetNC('close')
    assert.notOk(widget.is('.fade'))
  })

  QUnit.test('should return widget version', function (assert) {
    assert.expect(1)

    if (typeof AceApp.Widget !== 'undefined') {
      assert.ok(typeof AceApp.Widget.VERSION === 'string')
    } else {
      assert.notOk()
    }
  })
})

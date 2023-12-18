/* common functions */

/* NEW functions */
function centerVertically(obj, top_safe) {
  /*obj.position({ my: "center", at: "center", of: window });
  if (top_safe == true && obj.position().top < 0)
    obj.css('top', 0);*/
}

function initCollapseArrowToggle()
{
  $(".panel-heading[data-toggle=collapse]+.panel-body").each(function(){
      $(this).on('shown.bs.collapse', function () {
          $(this).closest('.panel').find('.panel-heading .collapse-button').switchClass('fa-chevron-down','fa-chevron-up');
      });
  });
  $(".panel-heading[data-toggle=collapse]+.panel-body").each(function(){
      $(this).on('hidden.bs.collapse', function () {
          $(this).closest('.panel').find('.panel-heading .collapse-button').switchClass('fa-chevron-up','fa-chevron-down');
      });
  });
}
function reInit() {

    //things under develop, prevent action
    $(".dev").bind('click', function (e) {
        e.preventDefault();
        alert("This function is currently in development. Thank you!");
    });

    //prevent default on href="#"
    $("[href=\\#]").bind('click', function (e) {
        e.preventDefault();
    });

    //toggle active for checkbox-like buttons
    $('.toggle-active').bind('click', function (e) {
        $(this).toggleClass('active');
    });

    //button-group toggle active like radios
    $('.btn-group.toggle-radios .btn').click(function () {
        $('.btn-group.toggle-radios .btn').removeClass('active');
        $(this).addClass('active');
    });

    //init tooltips, if not mobile
    if (!is_mobile()) {
        $(".ttip,[data-rel=tooltip],[class^=tooltip-]").each(function (i, o) {
            //$(this).tooltip({ placement: 'auto '+($(this).data('ttip-dir')!==undefined)?$(this).data('ttip-dir'):'', container: ($(this).data('ttip-container')!==undefined)?$(this).data('ttip-container'):null, html: true });
            _t1 = 'brc-secondary-d3';
            _t2 = 'bgc-secondary-d3';
            if ($(this).hasClass('btn-success'))
            {
              _t1 = 'brc-success-d3';
              _t2 = 'bgc-success-d3';
            }
            else if ($(this).hasClass('btn-danger'))
            {
              _t1 = 'brc-danger-d3';
              _t2 = 'bgc-danger-d3';
            }
            else if ($(this).hasClass('btn-warning'))
            {
              _t1 = 'brc-yellow-d3';
              _t2 = 'bgc-yellow-d3';
            }
            $(this).tooltip({
                template: '<div class="tooltip" role="tooltip"><div class="'+_t1+' arrow"></div><div class="'+_t2+' tooltip-inner text-105 text-600"></div></div>',
                html: true
            });
        });
        /*var tooltipTriggerList = [].slice.call(document.querySelectorAll('.ttip,[data-rel=tooltip],[class^=tooltip-]'))
        var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
          return new bootstrap.Tooltip(tooltipTriggerEl)
        });*/
        
        //init popovers
        $('[data-rel=popover]').each(function (i, o) {
            $(this).popover({
                container: ($(this).data("container") !== undefined) ? $(this).data("container") : "body"
            });
        });

        //init chosen-select
        $(".chosen-select").each(function () {
            $(this).chosen({
                width: ($(this).data("width") !== undefined) ? $(this).data("width") : "100%",
                max_selected_options: ($(this).data("max-selected-options") !== undefined) ? $(this).data("max-selected-options") : 'Infinity',
                disable_search_threshold: 5,
                search_contains: true
            });
        });
    }
    else
    {
      $(".chosen-select").removeClass('chosen-select');
    }

    //init selectpicker
    $('.selectpicker').each(function () {
        $(this).selectpicker((is_mobile()) ? 'mobile' : null);
    });

    //auto-capitalize input   
    $('.capitalize').capitalize();
    
    //not needed: auto-grow textarea, input
    // try {
    //   if (typeof "autogrow" == "function")
    //     $("textarea.autogrow").autogrow();
    // }
    // catch(err) { if (console.log) console.log(err.message) }
    // try {
    //   $("input.autogrow").autoGrowInput({
    //       comfortZone: 20,
    //       minWidth: 50,
    //       maxWidth: 400
    //   });
    // }
    // catch(err) { if (console.log) console.log(err.message) }

    //maskedinput, old
    $('[data-mask]').each(function () {
        $(this).mask($(this).data('mask'));
    });
    //new inputmask
    $('[data-inputmask]').each(function () {
        $(this).inputmask();
    });

    //form-group onclick: .focus
    $(".form-group .input-group input,.form-group .input-group textarea")
        .focus(function () {
        $(this).parents('.form-group').addClass("focus");
    })
        .blur(function () {
        $(this).parents('.form-group').removeClass("focus");
    });
    $(".input-group-addon,.input-group-btn").click(function () {
        $(this).parent().find("input,select,textarea").select();
    });

    //jQuery allow only numeric keys
    $("input.numeric").keyup(function (e) {
        var s = jQuery(this).val();
        if (isNaN(s) && (s !== null)) {
            $(this).val(s.substring(0, s.length - 1));
        }
    });

    //max-words
    $("[data-rule-maxwords]").each(function (i, _obj) {
        var _name = $(_obj).attr("name");
        var _limit = $(_obj).data("rule-maxwords");
        if (isNaN(_limit)) {
            alert("Incorrect numeric value for data-rule-maxwords attribute on input name=" + _name + " !");
            $(_obj).focus();
        }
        $("[name=" + _name + "]").bind("keyup focus blur paste", function () {
            var t = setTimeout(function () {
                word_count("[name=" + _name + "]", _limit, false);
            }, 10);
        });
        //init first load, but don't cut
        word_count("[name=" + _name + "]", _limit, false);
    });

    // scrollables
    $('.slim-scroll').each(function () {
        var $this = $(this);
        $this.slimScroll({
            height: $this.data('height') || 100,
            railVisible: true,
            alwaysVisible: false
        });
    });

    //make BS dialogs resizable (on finish resize, they auto-center horizontally), and draggable (ng)
    //TODO: add maximize, minimize buttons
    $('.modal-content').resizable({
        stop: function (event, ui) {
            $(this).position({
                my: 'center top',
                at: 'center top+30',
                of: 'body'
            });
        }
    });

    //init floating scrollbar
    $(".table-responsive").floatingScroll();

    //admin column edit buttons: show/hide
    $('th.headercolumn').on('mouseenter', function(){
      $(this).find('.admin-button').removeClass('collapse');
    });
    $('th.headercolumn').on('mouseleave', function(){
      $(this).find('.admin-button').addClass('collapse');
    });
}
/* END NEW functions */

function autoHideSexyLoader()
{
  var t = setTimeout(function(){ $(".sexy-loader").fadeOut(); }, 3000);
}

function showMessages(_type, _message, _permanent)
{
  var notif = new Array();

  //animation not working yet
  // var animation_modules =  new Map([
  //     ...PNotify.defaultModules,
  //     [PNotifyAnimate, {
  //       inClass: 'zoomInLeft',
  //       outClass: 'zoomOutRight'
  //     }]
  //   ]);
  for (e=0; e<_message.length; e++)
  {
    if (_type == 'error' || _type == 'danger')
    {
      var notif = PNotify.error({
        title: "Error!",
        text: _message[e]+" <br><br><small>[click to dismiss]</small>",
        textTrusted: true,
        type: 'error',
        icon: "fa fa-warning fa-lg",
        hide: false,
        sticker: false,
        closerHover: true,
        stickerHover: false,
        addModelessClass: 'nonblock'
        });
    }
    else if (_type == 'warning')
    {
      var notif = PNotify.notice({
        title: "Attention!",
        text: _message[e]+" <br><br><small>[click to dismiss]</small>",
        textTrusted: true,
        icon: "fa fa-warning fa-lg",
        hide: false,
        sticker: false,
        closerHover: true,
        stickerHover: false,
        addModelessClass: 'nonblock'
        });
    }
    else if (_type == 'success')
    {
      if (_permanent !== undefined && _permanent == 'permanent')
      {
        var notif = PNotify.success({
          title: "Success!",
          text: _message[e]+" <br><br><small>[click to dismiss]</small>",
          textTrusted: true,
          icon: "fa fa-check fa-lg",
          addModelessClass: 'nonblock',
          hide: false, //make sticky
          sticker: false,
          closerHover: true,
          stickerHover: false,
          });
      }
      else
      {
        var notif = PNotify.success({
          title: "Success!",
          text: _message[e],
          textTrusted: true,
          icon: "fa fa-check fa-lg",
          addModelessClass: 'nonblock',
          // modules: animation_modules,
          });
      }
    }
    else if (_type == 'info')
    {
      if (_permanent !== undefined && _permanent == 'permanent')
      {
        var notif = PNotify.info({
          title: "Information:",
          text: _message[e],
          textTrusted: true,
          icon: "fa fa-info-circle fa-lg",
          addModelessClass: 'nonblock',
          hide: false, //sticky
          sticker: false,
          closerHover: true,
          stickerHover: false,
        });
      }
      else
      {
        var notif = PNotify.info({
          title: "Information:",
          text: _message[e],
          textTrusted: true,
          icon: "fa fa-info-circle fa-lg",
          addModelessClass: 'nonblock',
          closerHover: true
        });
      }
    }
  }
  // $(".ui-pnotify").click(function(){ $(this).fadeOut(); });
  notif.on('click', () => {
    notif.close();
  });
}

function show_messages()
{
  $("#messages_holder_inner").slideDown("fast", function(){
  });
  $("#messages_holder_toggle_button span:first").switchClass("ui-icon-arrowthickstop-1-s","ui-icon-arrowthickstop-1-n");
}
function hide_messages()
{
  $("#messages_holder_inner").slideUp("fast", function(){
  });
  $(".message_error_holder").hide();
  $("#messages_holder_toggle_button span:first").switchClass("ui-icon-arrowthickstop-1-n","ui-icon-arrowthickstop-1-s");
}

//delete multiple selected rows
function delete_selected_rows(_table, _page_name)
{
  var answer = confirm("Do you want to DELETE selected rows?");
  if (answer)
  {
    $("body").append('<div id="dialog-modal" title="Loading..."><p>Please wait...</p></div>');
    $( "#dialog-modal" ).dialog({ height: 80, modal: true });
    var rows = $(":checkbox.listcheckbox").serializeArray();
    $.ajax({	type: "POST",
          url: SITE_URL+"/admin_index.php?Page=ajax_return&ajax_return=delete_rows",
          data: { rows: rows, table: _table, page_name: _page_name },
          success: function(result) {
          $.cookie("xresult_message", result);
          document.location.href = REQUEST_URI;
        }
    });
  }
}

function ajax_file_upload_popup()
{
  $("body").append('<div id="file-upload-dialog-modal" title="Upload"><p>Please wait...</p></div>');
  $("#file-upload-dialog-modal").dialog({ height: 300, modal: true, buttons: {
                    "Upload": function() { ajaxFileUploadSimple(); },
                    "Close": function() { $( this ).dialog( "close" ); } 
                }
  });
  $.ajax({	type: "POST",
        url: SITE_URL+"/admin_index.php?Page=ajax_file_upload&ajax_return=yes",
        data: { id: '' },
        success: function(result) {
        $("#file-upload-dialog-modal").html(result);
      }
  });
}

function word_count(_selector, _max, _limit)
{
  var obj = /*$("textarea[name="+_selector+"]") || */$(_selector);
  var val = $.trim(obj.val());
  var count = 0;
  if (val !== "")
  {
    count = val.match(/\b\w+\b/g).length;
    if (_max !== false)
      _t += "/"+_max;
    _t += " words";
    obj.siblings().find('.word-count').text(_t);
    if (count > (_max))
    {
      if (_max !== false)
        obj.addClass("error");
      if (_limit === true)
      {
        obj.val(val.substring(0, val.match(/\b\w+\b/g).slice(0, _max).join(" ").length));
      }
    }
    else
    {
      obj.removeClass("error");
    }
  }
  //recount after trim
  if (_limit === true && obj.val() !== "")
    count = obj.val().match(/\b\w+\b/g).length;
  var _t = count;
  if (_max !== false)
    _t += "/"+_max;
  _t += " words";
  obj.siblings().find('.word-count').text(_t);
}

//make select-multiple items click-toggle
/*not working with new jQuery
$("select.multifilter option").mousedown(function(){
  var $self = $(this);
  //stickyheader duplicate issue
  var n = $self.parent().attr("name").replace('[]','');
  if ($("select[name^="+n+"]").length > 1)
  {
    $("select[name^="+n+"]").prop("disabled", true);
    $self.parent().prop("disabled", false);
  }
  //end stickyheader duplicate issue
  if ($self.prop("selected"))
  {
    $self.prop("selected", false);
    $self.removeAttr("selected");
  }
  else
  {
    $self.prop("selected", true);
    $self.attr("selected", true);
  }
  if ($self.val() == "nofilter")
  {
    $self.parent().find("option").prop("selected", false);
    $self.prop("selected", true);
  }
  else
  {
    $self.parent().find("option[value=nofilter]").prop("selected", false);
  }
  console.log($self.parent().find("option:selected"));
  return false;
});
*/




//deprecated jquery functions needed:
// Limit scope pollution from any deprecated API
(function() {

    var matched, browser;

// Use of jQuery.browser is frowned upon.
// More details: http://api.jquery.com/jQuery.browser
// jQuery.uaMatch maintained for back-compat
    jQuery.uaMatch = function( ua ) {
        ua = ua.toLowerCase();

        var match = /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
            /(webkit)[ \/]([\w.]+)/.exec( ua ) ||
            /(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
            /(msie) ([\w.]+)/.exec( ua ) ||
            ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
            [];

        return {
            browser: match[ 1 ] || "",
            version: match[ 2 ] || "0"
        };
    };

    matched = jQuery.uaMatch( navigator.userAgent );
    browser = {};

    if ( matched.browser ) {
        browser[ matched.browser ] = true;
        browser.version = matched.version;
    }

// Chrome is Webkit, but Webkit is also Safari.
    if ( browser.chrome ) {
        browser.webkit = true;
    } else if ( browser.webkit ) {
        browser.safari = true;
    }

    jQuery.browser = browser;

    jQuery.sub = function() {
        function jQuerySub( selector, context ) {
            return new jQuerySub.fn.init( selector, context );
        }
        jQuery.extend( true, jQuerySub, this );
        jQuerySub.superclass = this;
        jQuerySub.fn = jQuerySub.prototype = this();
        jQuerySub.fn.constructor = jQuerySub;
        jQuerySub.sub = this.sub;
        jQuerySub.fn.init = function init( selector, context ) {
            if ( context && context instanceof jQuery && !(context instanceof jQuerySub) ) {
                context = jQuerySub( context );
            }

            return jQuery.fn.init.call( this, selector, context, rootjQuerySub );
        };
        jQuerySub.fn.init.prototype = jQuerySub.fn;
        var rootjQuerySub = jQuerySub(document);
        return jQuerySub;
    };

})();

function loadWidget(_id)
{
    $.ajax({	type: "GET",
          url: SITE_URL+"/admin_index.php?ajax_return=load_widget&widget_id="+_id,
          success: function(result) {
          if ($.trim(result) !== '')
            $("#widget_"+_id).html(result);
            reInit();
        }
    });
}

/**
 * jQuery.browser.mobile (http://detectmobilebrowser.com/)
 * jQuery.browser.mobile will be true if the browser is a mobile device
 **/
/*(function(a){jQuery.browser.mobile=/android.+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|e\-|e\/|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(di|rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|xda(\-|2|g)|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))})(navigator.userAgent||navigator.vendor||window.opera);*/

function is_mobile() { return /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent); }


/*! Copyright (c) 2011 by Jonas Mosbech - https://github.com/jmosbech/StickyTableHeaders MODIFIED
    MIT license info: https://github.com/jmosbech/StickyTableHeaders/blob/master/license.txt */
;(function ($, window, undefined) {
	'use strict';

	var name = 'stickyTableHeaders2';
	var defaults = {
			fixedOffset: 1//w sticky: 48
		};

	function Plugin (el, options) {
		// To avoid scope issues, use 'base' instead of 'this'
		// to reference this class from internal events and functions.
		var base = this;

		// Access to jQuery and DOM versions of element
		base.$el = $(el);
		base.el = el;

    //custom
    //var defaultTableTopOffset = base.$el.offset().top;
    if ($("#navbar").length)
      var defaultTableTopOffset = $("#navbar").height();
    else
      var defaultTableTopOffset = 0;

		// Listen for destroyed, call teardown
		base.$el.bind('destroyed',
			$.proxy(base.teardown, base));

		// Cache DOM refs for performance reasons
		//if (is_mobile())
      base.$window = $(window);
    //else
      //base.$window = $('.listview');
		base.$clonedHeader = null;
		base.$originalHeader = null;

		// Keep track of state
		base.isCloneVisible = false;
		base.leftOffset = null;
		base.topOffset = null;

		base.init = function () {
			base.options = $.extend({ }, defaults, options);

			base.$el.each(function () {
				var $this = $(this);

				// remove padding on <table> to fix issue #7
				//$this.css('padding', 0);

				base.$originalHeader = $('thead:first', this);
				base.$clonedHeader = base.$originalHeader.clone();

				base.$clonedHeader.addClass('tableFloatingHeader');
				base.$clonedHeader.css({
					'position': 'fixed',
					'top': 0,
					'z-index': 1019, //sibar z-index is: 1020
					'display': 'none'
				});

				base.$originalHeader.addClass('tableFloatingHeaderOriginal');

				base.$originalHeader.after(base.$clonedHeader);

				/*orig
        // enabling support for jquery.tablesorter plugin
				// forward clicks on clone to original
				$('th', base.$clonedHeader).on('click.' + name, function (e) {
					var index = $('th', base.$clonedHeader).index(this);
					$('th', base.$originalHeader).eq(index).click();
				});
				$this.on('sortEnd.' + name, base.updateWidth);
        */

				/*orig base.$printStyle = $('<style type="text/css" media="print">' +
					'.tableFloatingHeader{ display:none !important; }' +
					'.tableFloatingHeaderOriginal{ visibility:visible !important; }' +
					'</style>');
				$('head').append(base.$printStyle);*/
			});

			base.updateWidth();
			base.toggleHeaders();

			base.bind();
		};

		base.destroy = function (){
			base.$el.unbind('destroyed', base.teardown);
			base.teardown();
		};

		base.teardown = function(){
			$.removeData(base.el, 'plugin_' + name);
			base.unbind();

			base.$clonedHeader.remove();
			base.$originalHeader.removeClass('tableFloatingHeaderOriginal');
			base.$originalHeader.css('visibility', 'visible');
			base.$printStyle.remove();

			base.el = null;
			base.$el = null;
		};

		base.bind = function(){
			base.$window.on('scroll.' + name, base.toggleHeaders);
			base.$window.on('resize.' + name, base.toggleHeaders);
			base.$window.on('resize.' + name, base.updateWidth);

      //new by Laszlo: bind sticky table header update to table-responsive scroll and sidebar hide/collapse
      $(".listview .table-responsive").on('scroll.' + name, base.toggleHeaders);
      $('#sidebar').on('collapsed.ace.sidebar', function(){ $(window).trigger('scroll') });
      $('#sidebar').on('expanded.ace.sidebar', function(){ $(window).trigger('scroll') });
			
		};

		base.unbind = function(){
			// unbind window events by specifying handle so we don't remove too much
			base.$window.off('.' + name, base.toggleHeaders);
			base.$window.off('.' + name, base.updateWidth);
			base.$el.off('.' + name);
			base.$el.find('*').off('.' + name);
		};

		base.toggleHeaders = function () {
			base.$el.each(function () {
				var $this = $(this);

				var newTopOffset = isNaN(base.options.fixedOffset) ?
					base.options.fixedOffset.height() : base.options.fixedOffset;

				var offset = $this.offset();
				var scrollTop = base.$window.scrollTop() + newTopOffset;
				var scrollLeft = base.$window.scrollLeft();

				if ((scrollTop > offset.top) && (scrollTop < offset.top + $this.height() + base.$el.height() )) {
					var newLeft = offset.left - scrollLeft;
					if (base.isCloneVisible && (newLeft === base.leftOffset) && (newTopOffset === base.topOffset)) {
						return;
					}
					base.$clonedHeader.css({
						'top': newTopOffset + defaultTableTopOffset,
            //'top': $this.offset().top,
						'margin-top': 0,
						'left': newLeft,
            //'left': $this.offset().left,
						'display': 'block'
					});
					base.$originalHeader.css('visibility', 'hidden');
					base.isCloneVisible = true;
					base.leftOffset = newLeft;
					base.topOffset = newTopOffset;
				}
				else if (base.isCloneVisible) {
					base.$clonedHeader.css('display', 'none');
					base.$originalHeader.css('visibility', 'visible');
					base.isCloneVisible = false;
				}
			});
		};

		base.updateWidth = function () {
			// Copy cell widths and classes from original header
			$('th', base.$clonedHeader).each(function (index) {
				var $this = $(this);
				var $origCell = $('th', base.$originalHeader).eq(index);
				this.className = $origCell.attr('class') || '';
				// use min/max-width to fix overflow issue (#30)
				$this.css({
					'min-width': $origCell.outerWidth(),
					'max-width': $origCell.outerWidth()
				});
			});

			// Copy row width from whole table
			base.$clonedHeader.css('width', base.$originalHeader.width());
		};

		// Run initializer
		base.init();
	}

	// A plugin wrapper around the constructor,
	// preventing against multiple instantiations
	$.fn[name] = function ( options ) {
		return this.each(function () {
			var instance = $.data(this, 'plugin_' + name);
			if (instance) {
				if (typeof options === "string") {
					instance[options].apply(instance);
				}
			} else if(options !== 'destroy') {
				$.data(this, 'plugin_' + name, new Plugin( this, options ));
			}
		});
	};

})(jQuery, window);

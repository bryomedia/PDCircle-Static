// JavaScript Document

// input dummy text, onclick it clears
function clickclear(thisfield, defaulttext) {
  if (thisfield.value == defaulttext) {
    thisfield.value = "";
  }
}
function clickrecall(thisfield, defaulttext) {
  if (thisfield.value == "") {
    thisfield.value = defaulttext;
  }
}

function showMenu(obj) {
	var el = document.getElementById(obj);
	el.style.display = '';
}
function hideMenu(obj) {
	var el = document.getElementById(obj);
	el.style.display = 'none';
}
function switchMenu(obj) {
	var el = document.getElementById(obj);
	if ( el.style.display != "none" )
	{
		el.style.display = 'none';
	}
	else
	{
		el.style.display = '';
	}
}

function collapseAll(objs) {
	var i;
	for (i=0;i<objs.length;i++ )
	{
		objs[i].style.display = 'none';
	}
}

function onclick_filter(ret_page,filterby,filter,like,sortby)
{
	self.location.href = ret_page + "/FilterBy=" + filterby + "|" + filter + like + sortby;
}

/**
*
*  Javascript trim, ltrim, rtrim
*  http://www.webtoolkit.info/
*
**/
function trim(str, chars) {
	return ltrim(rtrim(str, chars), chars);
}
function ltrim(str, chars) {
	chars = chars || "\\s";
	return str.replace(new RegExp("^[" + chars + "]+", "g"), "");
}
function rtrim(str, chars) {
	chars = chars || "\\s";
	return str.replace(new RegExp("[" + chars + "]+$", "g"), "");
}
// end trim function

//in_array function
function in_array (needle, haystack, argStrict) {
    // Checks if the given value exists in the array  
    // 
    // version: 1004.2314
    // discuss at: http://phpjs.org/functions/in_array    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: vlado houba
    // +   input by: Billy
    // +   bugfixed by: Brett Zamir (http://brett-zamir.me)
    // *     example 1: in_array('van', ['Kevin', 'van', 'Zonneveld']);    // *     returns 1: true
    // *     example 2: in_array('vlado', {0: 'Kevin', vlado: 'van', 1: 'Zonneveld'});
    // *     returns 2: false
    // *     example 3: in_array(1, ['1', '2', '3']);
    // *     returns 3: true    // *     example 3: in_array(1, ['1', '2', '3'], false);
    // *     returns 3: true
    // *     example 4: in_array(1, ['1', '2', '3'], true);
    // *     returns 4: false
    var key = '', strict = !!argStrict; 
    if (strict) {
        for (key in haystack) {
            if (haystack[key] === needle) {
                return true;            }
        }
    } else {
        for (key in haystack) {
            if (haystack[key] == needle) {                return true;
            }
        }
    }
     return false;
}
// end in_array function

// blinking text function
function blinkIt() {
 if (!document.all) return;
 else {
   for(i=0;i<document.all.tags('blink').length;i++){
      s=document.all.tags('blink')[i];
      s.style.visibility=(s.style.visibility=='visible')?'hidden':'visible';
   }
 }
}
//end blinking text function

//div open close "+/-" status changer
function open_close_status(div_to_handle)
{
    if (document.getElementById(div_to_handle).style.display == 'block')
      $('#'+div_to_handle+'_status').html('-');
    else
      $('#'+div_to_handle+'_status').html('+');
}
//end
//toggle open/close with status
function open_close(div_to_handle, status)
{
  $("#"+div_to_handle).slideToggle('fast', function() 
    {
        if (status != null)
        {
          if (document.getElementById(div_to_handle).style.display == 'block')
            $('#'+div_to_handle+'_status').html('-');
          else
            $('#'+div_to_handle+'_status').html('+');
        }
    } );
  
}

////////////////////////////////////////////////////////////////////////////////
function unserialize(data){
    // Takes a string representation of variable and recreates it  
    // 
    // version: 810.114
    // discuss at: http://phpjs.org/functions/unserialize
    // +     original by: Arpad Ray (mailto:arpad@php.net)
    // +     improved by: Pedro Tainha (http://www.pedrotainha.com)
    // +     bugfixed by: dptr1988
    // +      revised by: d3x
    // +     improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // %            note: We feel the main purpose of this function should be to ease the transport of data between php & js
    // %            note: Aiming for PHP-compatibility, we have to translate objects to arrays 
    // *       example 1: unserialize('a:3:{i:0;s:5:"Kevin";i:1;s:3:"van";i:2;s:9:"Zonneveld";}');
    // *       returns 1: ['Kevin', 'van', 'Zonneveld']
    // *       example 2: unserialize('a:3:{s:9:"firstName";s:5:"Kevin";s:7:"midName";s:3:"van";s:7:"surName";s:9:"Zonneveld";}');
    // *       returns 2: {firstName: 'Kevin', midName: 'van', surName: 'Zonneveld'}
    
    var error = function (type, msg, filename, line){throw new window[type](msg, filename, line);};
    var read_until = function (data, offset, stopchr){
        var buf = [];
        var chr = data.slice(offset, offset + 1);
        var i = 2;
        while(chr != stopchr){
            if((i+offset) > data.length){
                error('Error', 'Invalid');
            }
            buf.push(chr);
            chr = data.slice(offset + (i - 1),offset + i);
            i += 1;
        }
        return [buf.length, buf.join('')];
    };
    var read_chrs = function (data, offset, length){
        buf = [];
        for(var i = 0;i < length;i++){
            var chr = data.slice(offset + (i - 1),offset + i);
            buf.push(chr);
        }
        return [buf.length, buf.join('')];
    };
    var _unserialize = function (data, offset){
        if(!offset) offset = 0;
        var buf = [];
        var dtype = (data.slice(offset, offset + 1)).toLowerCase();
        
        var dataoffset = offset + 2;
        var typeconvert = new Function('x', 'return x');
        var chrs = 0;
        var datalength = 0;
        
        switch(dtype){
            case "i":
                typeconvert = new Function('x', 'return parseInt(x)');
                var readData = read_until(data, dataoffset, ';');
                var chrs = readData[0];
                var readdata = readData[1];
                dataoffset += chrs + 1;
            break;
            case "b":
                typeconvert = new Function('x', 'return (parseInt(x) == 1)');
                var readData = read_until(data, dataoffset, ';');
                var chrs = readData[0];
                var readdata = readData[1];
                dataoffset += chrs + 1;
            break;
            case "d":
                typeconvert = new Function('x', 'return parseFloat(x)');
                var readData = read_until(data, dataoffset, ';');
                var chrs = readData[0];
                var readdata = readData[1];
                dataoffset += chrs + 1;
            break;
            case "n":
                readdata = null;
            break;
            case "s":
                var ccount = read_until(data, dataoffset, ':');
                var chrs = ccount[0];
                var stringlength = ccount[1];
                dataoffset += chrs + 2;
                
                var readData = read_chrs(data, dataoffset+1, parseInt(stringlength));
                var chrs = readData[0];
                var readdata = readData[1];
                dataoffset += chrs + 2;
                if(chrs != parseInt(stringlength) && chrs != readdata.length){
                    error('SyntaxError', 'String length mismatch');
                }
            break;
            case "a":
                var readdata = {};
                
                var keyandchrs = read_until(data, dataoffset, ':');
                var chrs = keyandchrs[0];
                var keys = keyandchrs[1];
                dataoffset += chrs + 2;
                
                for(var i = 0;i < parseInt(keys);i++){
                    var kprops = _unserialize(data, dataoffset);
                    var kchrs = kprops[1];
                    var key = kprops[2];
                    dataoffset += kchrs;
                    
                    var vprops = _unserialize(data, dataoffset);
                    var vchrs = vprops[1];
                    var value = vprops[2];
                    dataoffset += vchrs;
                    
                    readdata[key] = value;
                }
                
                dataoffset += 1;
            break;
            default:
                error('SyntaxError', 'Unknown / Unhandled data type(s): ' + dtype);
            break;
        }
        return [dtype, dataoffset - offset, typeconvert(readdata)];
    };
    return _unserialize(data, 0)[2];
}

////////////////////////////////////////////////////////////////////////////////
  function is_array(input){
    return typeof(input)=='object'&&(input instanceof Array);
  }

  Object.size = function(obj) {
      var size = 0, key;
      for (key in obj) {
          if (obj.hasOwnProperty(key)) size++;
      }
      return size;
  };

////////////////////////////////////////////////////////////////////////////////

function difference(a, b) { return Math.abs(a - b) }

function htmlEncode(value){
    if (value) {
        return jQuery('<div />').text(value).html();
    } else {
        return '';
    }
}
function htmlDecode(value) {
    if (value) {
        return $('<div />').html(value).text();
    } else {
        return '';
    }
}
function stripslashes( str ) {
	return (str + '').replace(/\\(.?)/g, function (s, n1){
		switch (n1) {
			case '\\':
				return '\\';
			case '0':
				return '\u0000';
			case '':
				return '';
			default:
				return n1;
		}
	});
}

//sleep
function sleep(ms)
{
	var dt = new Date();
	dt.setTime(dt.getTime() + ms);
	while (new Date().getTime() < dt.getTime());
}
//formats a number with 2 decimals
function numberFormat(n)
{
	n = n.toFixed(2);
  nStr = n;
  nStr += '';
	x = nStr.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	n =  x1 + x2;
  return n;
}

// jQuery extensions ///////////////////////////////////////////////////////////

// input char limiter jQuery plugin
//ex: var elem = $("#chars");
//  $("#text").limiter(100, elem);
//input value capitalizer
//ex: <input type="text" class="capitalize" />
(function($) {
    $.fn.extend( {
        limiter: function(limit, elem) {
            $(this).on("keyup focus", function() {
                setCount(this, elem);
            });
            function setCount(src, elem) {
                var chars = src.value.length;
                if (chars > limit) {
                    src.value = src.value.substr(0, limit);
                    chars = limit;
                }
                elem.html( limit - chars );
            }
            setCount($(this)[0], elem);
        },
        capitalize: function () {
          //iterate through each of the elements passed in, `$.each()` is faster than `.each()
          $(this).on("keyup focus", function () {
              //split the value of this input by the spaces
              var split = this.value.split(' ');
              //iterate through each of the "words" and capitalize them
              for (var i = 0, len = split.length; i < len; i++) {
                  split[i] = split[i].charAt(0).toUpperCase() + split[i].slice(1);
              }
              //re-join the string and set the value of the element
              this.value = split.join(' ');
          });
          return this;
      }
    });
})(jQuery);


/*! Copyright (c) 2011 by Jonas Mosbech - https://github.com/jmosbech/StickyTableHeaders MODIFIED
    MIT license info: https://github.com/jmosbech/StickyTableHeaders/blob/master/license.txt */
;(function ($, window, undefined) {
	'use strict';

	var name = 'stickyTableHeaders';
	var defaults = {
			fixedOffset: 0
		};

	function Plugin (el, options) {
		// To avoid scope issues, use 'base' instead of 'this'
		// to reference this class from internal events and functions.
		var base = this;

		// Access to jQuery and DOM versions of element
		base.$el = $(el);
		base.el = el;

    //custom
    var defaultTableTopOffset = base.$el.offset().top;
    
		// Listen for destroyed, call teardown
		base.$el.bind('destroyed',
			$.proxy(base.teardown, base));

		// Cache DOM refs for performance reasons
		base.$window = $('.listview');//orig $(window);
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

				//orig base.$originalHeader = $('thead:first', this);
        base.$originalHeader = $('div.listheader:first', this);
				base.$clonedHeader = base.$originalHeader.clone();

				base.$clonedHeader.addClass('tableFloatingHeader');
				base.$clonedHeader.css({
					'position': 'fixed',
					'top': 0,
					'z-index': 1, // #18: opacity bug
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
			// TODO: move tablesorter bindings here
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

				var offset = $this.position();
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
						//'left': newLeft,
            'left': $this.offset().left,
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
			//orig $('th', base.$clonedHeader).each(function (index) {
      $('.headercolumn', base.$clonedHeader).each(function (index) {
				var $this = $(this);
				//orig var $origCell = $('th', base.$originalHeader).eq(index);
        var $origCell = $('.headercolumn', base.$originalHeader).eq(index);
				this.className = $origCell.attr('class') || '';
				// use min/max-width to fix overflow issue (#30)
				$this.css({
					'min-width': $origCell.width(),
					'max-width': $origCell.width()
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

function nl2br (str, is_xhtml) {
  var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';    
  return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1'+ breakTag +'$2');
}

//base64_encode
http://phpjs.org/functions/base64_encode/
function base64_encode (data) {
  // http://kevin.vanzonneveld.net
  // +   original by: Tyler Akins (http://rumkin.com)
  // +   improved by: Bayron Guevara
  // +   improved by: Thunder.m
  // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +   bugfixed by: Pellentesque Malesuada
  // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +   improved by: Rafał Kukawski (http://kukawski.pl)
  // *     example 1: base64_encode('Kevin van Zonneveld');
  // *     returns 1: 'S2V2aW4gdmFuIFpvbm5ldmVsZA=='
  // mozilla has this native
  // - but breaks in 2.0.0.12!
  //if (typeof this.window['btoa'] === 'function') {
  //    return btoa(data);
  //}
  var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
    ac = 0,
    enc = "",
    tmp_arr = [];

  if (!data) {
    return data;
  }

  do { // pack three octets into four hexets
    o1 = data.charCodeAt(i++);
    o2 = data.charCodeAt(i++);
    o3 = data.charCodeAt(i++);

    bits = o1 << 16 | o2 << 8 | o3;

    h1 = bits >> 18 & 0x3f;
    h2 = bits >> 12 & 0x3f;
    h3 = bits >> 6 & 0x3f;
    h4 = bits & 0x3f;

    // use hexets to index into b64, and append result to encoded string
    tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
  } while (i < data.length);

  enc = tmp_arr.join('');

  var r = data.length % 3;

  return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);
}

//base64_decode
function base64_decode (data) {
  // http://kevin.vanzonneveld.net
  // +   original by: Tyler Akins (http://rumkin.com)
  // +   improved by: Thunder.m
  // +      input by: Aman Gupta
  // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +   bugfixed by: Onno Marsman
  // +   bugfixed by: Pellentesque Malesuada
  // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +      input by: Brett Zamir (http://brett-zamir.me)
  // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // *     example 1: base64_decode('S2V2aW4gdmFuIFpvbm5ldmVsZA==');
  // *     returns 1: 'Kevin van Zonneveld'
  // mozilla has this native
  // - but breaks in 2.0.0.12!
  //if (typeof this.window['atob'] === 'function') {
  //    return atob(data);
  //}
  var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
    ac = 0,
    dec = "",
    tmp_arr = [];

  if (!data) {
    return data;
  }

  data += '';

  do { // unpack four hexets into three octets using index points in b64
    h1 = b64.indexOf(data.charAt(i++));
    h2 = b64.indexOf(data.charAt(i++));
    h3 = b64.indexOf(data.charAt(i++));
    h4 = b64.indexOf(data.charAt(i++));

    bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;

    o1 = bits >> 16 & 0xff;
    o2 = bits >> 8 & 0xff;
    o3 = bits & 0xff;

    if (h3 == 64) {
      tmp_arr[ac++] = String.fromCharCode(o1);
    } else if (h4 == 64) {
      tmp_arr[ac++] = String.fromCharCode(o1, o2);
    } else {
      tmp_arr[ac++] = String.fromCharCode(o1, o2, o3);
    }
  } while (i < data.length);

  dec = tmp_arr.join('');

  return dec;
}

//selects a text inside an element with id "element", to copy for example
function selectText(element) {
    var doc = document;
    var text = doc.getElementById(element);    

    if (doc.body.createTextRange) { // ms
        var range = doc.body.createTextRange();
        range.moveToElementText(text);
        range.select();
    } else if (window.getSelection) { // moz, opera, webkit
        var selection = window.getSelection();
        var range = doc.createRange();
        range.selectNodeContents(text);
        selection.removeAllRanges();
        selection.addRange(range);
    }
    return $.trim(range);
}

function stripJsonString(_id)
{
  t = $('#'+_id).text();
  t = t.replace(/(\r\n|\n|\r|\s+)/gm," ");
  return t;
}
function randomPassword(length) {
    if (length === undefined) var length = 12;
    var chars = "abcdefghijklmnopqrstuvwxyz!@#$%^&*()-+<>ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    var pass = "";
    for (var x = 0; x < length; x++) {
        var i = Math.floor(Math.random() * chars.length);
        pass += chars.charAt(i);
    }
    return pass;
}
function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
String.prototype.ucwords = function() {
  str = this.toLowerCase();
  return str.replace(/(^([a-zA-Z\p{M}]))|([ -][a-zA-Z\p{M}])/g,
    function(s){
      return s.toUpperCase();
    });
};
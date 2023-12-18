/* page init stuff */

$(document).ready(function(){
    
    reInit();

    //make loader overlay disappearing by clicking on it
    $(".sexy-loader").click(function(){ $(this).fadeOut() });

		//override dialog's title function to allow for HTML titles
		$.widget("ui.dialog", $.extend({}, $.ui.dialog.prototype, {
			_title: function(title) {
				var $title = this.options.title || '&nbsp;'
				if( ("title_html" in this.options) && this.options.title_html == true )
					title.html($title);
				else title.text($title);
			}
		}));
    
    //vertically center objects
    $(".vertical-center").each(function(){ centerVertically($(this), false); });
    $(".vertical-center-top-safe").each(function(){ centerVertically($(this), true); });
    
    //bind vertical align to window resize
    $(window).resize(function(){
      $(".vertical-center").each(function(){ centerVertically($(this), false); });
      $(".vertical-center-top-safe").each(function(){ centerVertically($(this), true); });
    });

    $("#btn-scroll-up-2").bind('click', function(e){
      $("html, body").animate({ scrollTop: 0 }, 100);//.scrollTop(0);
      e.preventDefault();
    });
    $("#btn-scroll-down-2").bind('click', function(e){
      $("html, body").animate({ scrollTop: $(document).height() }, 100);//$(window).scrollTop($(document).height());
      e.preventDefault();
    });
    
});//end ready()
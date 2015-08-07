/*!
 * jQuery.AutoSize
 * Copyright (c) 2015 Informationdesire
 * Version: 0.1 (06-Aug-2015)
 * Requires: jQuery v1.7.1 or later
 */
(function($) {
    "use strict";

    $.fn.autosize = function() {
        return this.each(function(t, r) {
            var offset = this.offsetHeight - this.clientHeight,
                padding = ($(this).outerHeight() - $(this).height()) / 2;
 
            var resizeTextarea = function(el, start) {
                if(start && $(el).val().length == 0 && typeof($(el).attr('data-height')) != 'undefined'){
                    $(el).css('height', $(el).attr('data-height'));
                }else{
                    if($(el).is(':visible')) $(el).css('height', 'auto').css('height', el.scrollHeight + offset + padding);
                }
            };
            
            $(this).on('focus keyup input autosize.resize', function(){ resizeTextarea(this); });  
            resizeTextarea(this, true);
        });
    }
})(jQuery);
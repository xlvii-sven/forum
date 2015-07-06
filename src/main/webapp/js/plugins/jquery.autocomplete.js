/*!
 * jQuery autocomplete
 * Copyright (c) 2014 Infodesire
 * Version: 0.1 (14-01-2015)
 * Requires: jQuery v1.7.1 or later
 */
(function(e) {
    e.fn.autocomplete = function(t){
       var n = e.extend({
           url: null,
           itemsLimit: 10,
           limitScroll: true,
           textLength: 45,
           dropdown: true,
           dropdownBtn: '',
       }, t),
            keys = {
                ESC: 27,
                UP: 38,
                DOWN: 40,
                ENTER: 13
            };
        return this.each(function(t, r) {
            var s = e(r),
                b = '.autocompleteBox',
                o = e('<div class="autocompleteBox"><ul></ul></div>'),
                f = {
                    init: function(){
                        f._loadData();
                        f._dropdown();
                        s.on('keyup', f._sKeyUp);
                        s.on('drop input propertychange', f._drop);
                    },
                    _loadData: function(){
                        if(f._data&&f._items){return true;}
                        $.get(n.url, {}, function(r){
                            var data = [];
                            
                            if(r && r.Entries){
                                for(var key in r.Entries){
                                    var value = r.Entries[key],
                                        opts = {};
                                    
                                    opts.name = value.title;
                                    opts.value = value.title;
                                    
                                    data.push(opts);
                                }
                            }
                            
                            f._data = f._items = data;
                        });    
                    },
                    _sortItems: function(){
                        return $.map(f._data, function (item) {
                            return item.keyword.toLowerCase().indexOf(f._lookup.toLowerCase()) === 0 ? item : null;
                        });
                    },
                    _show: function(){
                        f._hide();
                        f._createBox();
                        f._position();
                        f._bindOptions();
                        s.focus();
                        f._crSAk = true;
                    },
                    _hide: function(){
                        $('body').find(b).remove();
                        f._unbindOptions();
                    },
                    _bindOptions: function(){
                        var _blEl,
                            _blFn = function(e){
                            if(o.is(":focus")){return true;}
                            var related = _blEl,
                                inside = false;
                            if (related !== o || related !== s) {
                                if (related) {
                                    inside = (related.parents(b).length > 0 ? true : false);
                                }
                                if (inside) {
                                    return true;
                                }
                            }
                            f._hide()
                        };
                        
                        e(document).bind("contextmenu", function() {
                            f._hide()
                        }).bind('keydown', f._documentKeyDown).mousedown(function(e) {
                            _blEl = $(e.target);
                            _blFn();
                        }).mouseup(function(e) {
                            _blEl = null;
                        });
                        e(window).blur(function() {
                            f._hide()
                        }).on("resize", function() {
                            f._hide()
                        }).bind('keyup', function(e){
                            if(e.which == keys.ESC){
                                f._hide();
                                return true;
                            }
                        });
                        s.bind("blur", _blFn);
                        s.bind("keypress", f._sKeyPress);
                    },
                    _unbindOptions: function(){
                        $(document).unbind('keydown', f._documentKeyDown);     
                        s.unbind('focus keypress', f._sKeyPress);
                        f._crSAk = false;
                        f._drSaR = true;
                    },
                    _documentKeyDown: function(e){
                        var ar = new Array(38,40),
                            key = e.which;
                        if($.inArray(key,ar) > -1) {
                            e.preventDefault();
                            return false;
                        }
                        return true;
                    },
                    _sKeyUp: function(e, opts){
                        var val = s.val(),
                            key = e.which;
                        
                        if(f._crSAk){
                            switch(key){
                                case keys.ESC:
                                    f._hide();
                                    return true;
                                break;
                                case keys.ENTER:
                                    e.preventDefault();
                                    f._select(o.find('ul li.active a'));
                                    return false;
                                break;
                                case keys.UP:
                                    f._goPrev();
                                    return false;
                                break;
                                case keys.DOWN:
                                    f._goNext();
                                    return false;
                                break;
                            }
                        }
                        
                        if((e.originalEvent && e.originalEvent.type && e.originalEvent.type=="keyup" && val.length > 0) || e.type && e.type == "autocomplete" && e.namespace && e.namespace == "show"){
                            f._items = $.grep(f._data, function(item){
                                if(opts && opts.dropdown){
                                    return true;   
                                }
                                if(item.name == val){return false}
                                return item.name.search(RegExp("(" + f.preg_quote(val) + ")", "i")) != -1;
                            });
                            f._lookup = val;
                            f._show();
                        }else{
                            f._hide();   
                        }
                        
                        return true;
                    },
                    _sKeyPress: function(e){
                        switch(e.which){
                            case keys.ENTER:
                            case keys.UP:
                            case keys.DOWN:
                                e.preventDefault();
                                return false;
                            break;
                        }
                    },
                    _drop: function(e){
                        var callback = function(){
                            var val = s.val(),
                                search = val.search(/\#\/list\/(.*)/);
                            if(search.length <= -1){ return; }
                            var match = val.substring(search + 7);
                            
                            $.grep(f._data, function(item){
                                if(item.name == match){
                                    s.val(item.value);
                                    s.trigger('input');
                                    return true;
                                }
                            });
                        };
                        
                        setTimeout(callback, 1);
                    },
                    _select: function(el){
                        if(el.length == 0){return false;}
                        var id = el.parent().attr('data-idx'),
                            val = f._items[id].value;
                        s.val(val);
                        s.trigger('input');
                        s.focus();
                        f._hide();
                    },
                    _goPrev: function(){
                        var id = o.find('ul li').index(o.find('ul li.active'));
                        o.find('ul li.active').removeClass('active');
                        if(id-1 < 0){
                            o.find('ul li').last().addClass('active');
                        }else{
                            o.find('ul li').eq(id-1).addClass('active');  
                        }
                        o.find('ul').scrollTop(o.find('ul li.active').offset().top - o.find('ul').offset().top + o.find('ul').scrollTop());
                    },
                    _goNext: function(){
                        var id = o.find('ul li').index(o.find('ul li.active'));
                        o.find('ul li.active').removeClass('active');
                        if(id+1 >= o.find('ul li').size()){
                            o.find('ul li').first().addClass('active');
                        }else{
                            o.find('ul li').eq(id+1).addClass('active');  
                        }
                        o.find('ul').scrollTop(o.find('ul li.active').offset().top - o.find('ul').offset().top + o.find('ul').scrollTop());
                    },
                    _position: function(){
                        o.css({
                            width: s.outerWidth(),
                            top: s.offset().top + s.height() + 3,
                            left: s.offset().left
                        });
                    },
                    _dropdown: function(){
                        if(n.dropdown && n.dropdownBtn){
                            n.dropdownBtn = $(n.dropdownBtn);
                            n.dropdownBtn.on('click', function(){
                                if(f._drSaC && f._drSaR){
                                    f._hide();
                                    f._drSaC = false;
                                }else{
                                    s.trigger("autocomplete.show", {dropdown: true});
                                    f._drSaC = true;
                                    f._drSaR = true;
                                }
                            });
                            s.after(n.dropdownBtn);
                        }
                    },
                    preg_quote: function(str){
                        return (str+'').replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g, "\\$1");  
                    },
                    _createBox: function(){
                        if(!f._items || f._items.length == 0){f._hide(); return}
                        var l = f._items.slice( 0, (!n.limitScroll ? n.itemsLimit : f._items.length) ),
                            html = "";
                        if(!l || l.length == 0){f._hide(); return}
                        for(key in l){
                            var value = l[key];
                            value = value.name.substring(0,n.textLength)+(value.name.length > n.textLength ? '...': '');
                            if(f._lookup){
                                var ma = f.preg_quote(f._lookup),
                                    re = new RegExp( "(" + ma + ")" , 'i')
                                value = value.replace(re, "<b>$1</b>");
                            }
                            html += '<li data-idx="'+key+'"'+(key==0?' class="active"':'')+'><a>'+value+'</a></li>';
                        }
                        o.find('ul').html(html);
                        $(document.body).append(o);
                        if(n.limitScroll){
                            var mH = 0;
                            for(var i = 0; i <= n.itemsLimit; i++){
                                mH += o.find('ul li').eq(i).outerHeight(); 
                            }
                            o.find('ul').css('height', mH);
                        }
                        o.find('ul li a').on('click', function(e){
                            e.preventDefault();
                            f._select($(this));
                        });
                        f._position();
                    },
                    _crSAk: false,
                    _lookup: "",
                    _oldVal: "",
                    _crAtI: 0,
                    _drSaC: false,
                    _drSaR: false
                };
            f.init();
            s.on("autocomplete.show", f._sKeyUp);
            
            return this;
        });
    }
})(jQuery);
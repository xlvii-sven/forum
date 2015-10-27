/*!
 * jQuery autocomplete
 * Copyright (c) 2014 Infodesire
 * Version: 0.1.1 (06-Oct-2015)
 * Requires: jQuery v1.7.1 or later
 */
! function(e) {
	e.fn.autocomplete = function(t) {
		var n = e.extend({
				url: null,
				itemsLimit: 10,
				limitScroll: !0,
				textLength: 45,
				dropdown: !0,
				dropdownBtn: ""
			}, t),
			i = {
				ESC: 27,
				UP: 38,
				DOWN: 40,
				ENTER: 13
			};
		return this.each(function(t, o) {
			var r = e(o),
				u = ".autocompleteBox",
				d = e('<div class="autocompleteBox"><ul></ul></div>'),
				a = {
					init: function() {
						a._loadData(), a._dropdown(), r.on("keyup", a._sKeyUp), r.on("drop input propertychange", a._drop)
					},
					_loadData: function() {
						return a._data && a._items ? !0 : void $.get(n.baseUrl+n.url, {}, function(e) {
							var t = [];
							if (e && e.Entries) {
								for (var p in e.Entries) {
									var i = e.Entries[p],
									o = {};
									o.name = i.title, o.value = i.title, o.id = i.id, o.link = i.link, t.push(o);
									
									if(o.link){
										$.get(n.baseUrl+'/captions/$link|' + encodeURIComponent(o.link), {}, function(c) {
											var caption = c.Entries[0].translation;
											o.name += " ("+ (caption || o.link) + ")";
											o.value = o.name;
										});
									}
									
//									if(o.link){
//										o.name += " ("+ o.link + ")";
//										o.value = o.name;
//									}
								}
							}
							a._data = a._items = t
						})
					},
					_sortItems: function() {
						return $.map(a._data, function(e) {
							return 0 === e.keyword.toLowerCase()
								.indexOf(a._lookup.toLowerCase()) ? e : null
						})
					},
					_show: function() {
						a._hide(), a._createBox(), a._position(), a._bindOptions(), r.focus(), a._crSAk = !0
					},
					_hide: function() {
						$("body")
							.find(u)
							.remove(), a._unbindOptions();
                        if(typeof(r.attr("data-value")) != 'undefined' && r.attr("data-value").length > 0){
                            var json_data = JSON.parse(r.attr("data-value"));
                            if(!json_data || json_data.value != r.val()){
                                r.attr("data-value", "");   
                            }
                        }else{
                            for(var k in a._data){
                                if(r.val() == a._data[k].value){
                                    r.attr("data-value", JSON.stringify(a._data[k]))
                                }
                            }
                        }
					},
					_bindOptions: function() {
						var t, n = function() {
							if (d.is(":focus")) return !0;
							var e = t,
								n = !1;
							return e === d && e === r || (e && (n = e.parents(u)
								.length > 0 ? !0 : !1), !n) ? void a._hide() : !0
						};
						e(document)
							.bind("contextmenu", function() {
								a._hide()
							})
							.bind("keydown", a._documentKeyDown)
							.mousedown(function(e) {
								t = $(e.target), n()
							})
							.mouseup(function() {
								t = null
							}), e(window)
							.blur(function() {
								a._hide()
							})
							.on("resize", function() {
								a._hide()
							})
							.bind("keyup", function(e) {
								return e.which == i.ESC && a._hide(), !0
							}), r.bind("blur", n), r.bind("keypress", a._sKeyPress)
					},
					_unbindOptions: function() {
						$(document)
							.unbind("keydown", a._documentKeyDown), r.unbind("focus keypress", a._sKeyPress), a._crSAk = !1, a._drSaR = !0
					},
					_documentKeyDown: function(e) {
						var t = new Array(38, 40),
							n = e.which;
						return $.inArray(n, t) > -1 ? (e.preventDefault(), !1) : !0
					},
					_sKeyUp: function(e, t) {
						var n = r.val(),
							o = e.which;
						if (a._crSAk) switch (o) {
							case i.ESC:
								return a._hide(), !0;
							case i.ENTER:
								return e.preventDefault(), a._select(d.find("ul li.active a")), !1;
							case i.UP:
								return a._goPrev(), !1;
							case i.DOWN:
								return a._goNext(), !1
						}
						return e.originalEvent && e.originalEvent.type && "keyup" == e.originalEvent.type && n.length > 0 || e.type && "autocomplete" == e.type && e.namespace && "show" == e.namespace ? (a._items = $.grep(a._data, function(e) {
							return t && t.dropdown ? !0 : e.name == n ? !1 : -1 != e.name.search(RegExp("(" + a.preg_quote(n) + ")", "i"))
						}), a._lookup = n, a._show()) : a._hide(), !0
					},
					_sKeyPress: function(e) {
						switch (e.keyCode) {
							case i.ENTER:
								return e.preventDefault(), !1
						}
						return !0
					},
					_drop: function() {
						var e = function() {
							var e = r.val(),
								t = e.search(/\#\/list\/(.*)/);
							if (!(t.length <= -1)) {
								var n = e.substring(t + 7);
								$.grep(a._data, function(e) {
									return e.name == n ? (r.val(e.value), r.attr("data-value", JSON.stringify(e)), r.trigger("input"), !0) : void 0
								})
							}
						};
						setTimeout(e, 1)
					},
					_select: function(e) {
						if (0 == e.length) return !1;
						var t = e.parent()
							.attr("data-idx"),
							n = a._items[t].value;
						r.val(n), r.attr("data-value", JSON.stringify(a._items[t])), r.trigger("input"), r.focus(), a._hide()
					},
					_goPrev: function() {
						var e = d.find("ul li")
							.index(d.find("ul li.active"));
						d.find("ul li.active")
							.removeClass("active"), 0 > e - 1 ? d.find("ul li")
							.last()
							.addClass("active") : d.find("ul li")
							.eq(e - 1)
							.addClass("active"), d.find("ul")
							.scrollTop(d.find("ul li.active")
								.offset()
								.top - d.find("ul")
								.offset()
								.top + d.find("ul")
								.scrollTop())
					},
					_goNext: function() {
						var e = d.find("ul li")
							.index(d.find("ul li.active"));
						d.find("ul li.active")
							.removeClass("active"), e + 1 >= d.find("ul li")
							.size() ? d.find("ul li")
							.first()
							.addClass("active") : d.find("ul li")
							.eq(e + 1)
							.addClass("active"), d.find("ul")
							.scrollTop(d.find("ul li.active")
								.offset()
								.top - d.find("ul")
								.offset()
								.top + d.find("ul")
								.scrollTop())
					},
					_position: function() {
						d.css({
							width: r.outerWidth(),
							top: r.offset()
								.top + r.height() + 3,
							left: r.offset()
								.left
						})
					},
					_dropdown: function() {
						n.dropdown && n.dropdownBtn && (n.dropdownBtn = $(n.dropdownBtn), n.dropdownBtn.on("click", function() {
							return "undefined" != typeof r.attr("disabled") || "undefined" != typeof r.attr("readonly") ? !0 : void(a._drSaC && a._drSaR ? (a._hide(), a._drSaC = !1) : (r.trigger("autocomplete.show", {
								dropdown: !0
							}), a._drSaC = !0, a._drSaR = !0))
						}), r.after(n.dropdownBtn))
					},
					preg_quote: function(e) {
						return (e + "")
							.replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g, "\\$1")
					},
					_createBox: function() {
						if (!a._items || 0 == a._items.length) return void a._hide();
						var e = a._items.slice(0, n.limitScroll ? a._items.length : n.itemsLimit),
							t = "";
						if (!e || 0 == e.length) return void a._hide();
						for (key in e) {
							var i = e[key];
							if (i = i.name.substring(0, n.textLength) + (i.name.length > n.textLength ? "..." : ""), a._lookup) {
								var o = a.preg_quote(a._lookup),
									r = new RegExp("(" + o + ")", "i");
								i = i.replace(r, "<b>$1</b>")
							}
							t += '<li data-idx="' + key + '"' + (0 == key ? ' class="active"' : "") + "><a>" + i + "</a></li>"
						}
						if (d.find("ul")
							.html(t), $(document.body)
							.append(d), n.limitScroll) {
							for (var u = 0, l = 0; l <= n.itemsLimit; l++) u += d.find("ul li")
								.eq(l)
								.outerHeight();
							d.find("ul")
								.css("height", u)
						}
						d.find("ul li a")
							.on("click", function(e) {
								e.preventDefault(), a._select($(this))
							}), a._position()
					},
					_crSAk: !1,
					_lookup: "",
					_oldVal: "",
					_crAtI: 0,
					_drSaC: !1,
					_drSaR: !1
				};
			return a.init(), r.on("autocomplete.show", a._sKeyUp), this
		})
	}
}(jQuery);
/*!
 * AngularJS | Forum
 * Copyright (c) 2015 Infodesire
 * Website: http://infodesire.com/
 * Version: 0.1.2 (19-Jan-2015)
 * Requires: AngularJS 1.3 or later, jQuery v1.7.1 or later 
 */
(function(){
    /**
     * Application initialization in AnugularJS and declare some important properties
     *
     * @Root {String} URL in browser
     * @restBase {String} URL to restAPI
     * @_captions {Object} Object of all captions 
     * @static
     */
    var app = angular.module('forum', ['ngRoute', 'ngSanitize']);
    var Root = '/forum/',
        restBase = '/flyer/',
        _captions = {};

    /**
     * AnugularJS | Application Routing
     *
     * @/ {String} Home
     * @/list/:topicTitle {String} Entries List
     * @/add {String} Add an Entry
     * @/add/:topicTitle {String} Add an Entry with selected Topic
     * @/edit/:entryId {String} Edit Entry with selected id
     * @static
     */
    app.config(function($routeProvider) {
   	
        $routeProvider.when('/', {
            templateUrl: Root + 'templates/index.html', 
            controller: 'FirstPageController',
            resolve: {_zhType: function(){return false;}}
    	})
        .when('/list/:topicTitle', {
            templateUrl: Root + 'templates/index.html', 
            controller:  'FirstPageController',
            resolve: {_zhType: function(){return "list";}}
        })
        .when('/list/:topicTitle/entryId/:entryId', {
            templateUrl: Root + 'templates/index.html', 
            controller:  'FirstPageController',
            resolve: {_zhType: function(){return "list";}}
        })
        .when('/add/', {
            templateUrl: Root + 'templates/add_page.html', 
            controller:  'AddFormController',
            resolve: {_zhType: function(){return "new";}}
        })
        .when('/add/:topicTitle', {
            templateUrl: Root + 'templates/add_page.html', 
            controller:  'AddFormController',
            resolve: {_zhType: function(){return "new";}}
        })
        .when('/edit/:entryId', {
            templateUrl: Root + 'templates/add_page.html', 
            controller:  'AddFormController',
            resolve: {_zhType: function(){return "edit";}}
        })
        .otherwise({ redirectTo: '/' });
    
    });
    
    /*
        ================ Controller ================
        
                 @MainController Controller
            (it is the parent of all controllers)
                
        ================ Controller ================
    */
    app.controller('MainController', function ($scope, $http, $routeParams, CaptionsService) {
        //Application captions
        var captions = {
            Forum: "Default|Forum",
            last: "Tooltip|Last",
            search: "Tooltip|search",
            addText: "${Phrases:Add%20$0}:::${Document:Entry}",
            in: "Default|in",
            name: "Document|Name",
            user: "Document|User",
            date: "Document|Date",
            size: "Document|Size",
            conversationUp: "Forum|History",
            conversationDown: "Forum|Replies",
            topic: "Document|Topic",
            topics: "Document|Topics",
            entry: "Document|Entry",
            entries: "Document|Entries",
            sortBy: "Tooltip|Sort",
            text: "Document|Content",
            cancel: "Document|Cancel",
            submit: "Tooltip|Save",
            ok: "Document|OK",
            yes: "Document|Yes",
            no: "Tooltip|No",
            message: "System|Hint",
            entryCreated: "${Phrases:$0 was created}:::${Document:Entry}",
            entryEdited: "${Phrases:$0 was saved}:::${Document:Entry}",
            entryDeleted: "${Phrases:$0 was deleted}:::${Document:Entry}",
            addTopicInput: "Forum|Select or create topic",
            errorTitle: "System|Error",
            errorText: "Access|Access denied",
            reply: "Tooltip|reply",
            replies: "Forum|Replies",
            removeConfirmation: "${Phrases:Really delete $0 ?}:::${Document:Entry}",
            backToTop: "Tooltip|scroll to start",
            edit: "Tooltip|Edit",
            editText: "Default|${Phrases:change $0}:::${Document:Entry}",
            remove: "Document|Remove"
        };
        
        $scope.captions = {};
        
        /**
         * Get the translation of captions
         *
         * @param captions {Object}
         * @param callback {Function}
         * @service CaptionsService
         * @method get
         */
        CaptionsService.get(captions, function(data){
            if(!data||!data.Entries){ return false }
            
            var i = 0;
            for(key in captions){
                captions[key] = data.Entries[i].translation.replace(/:\s*$/, ""); //removes last :
                i++;
            }
            
            $scope.captions = captions;
            _captions = captions;
        });
        
        /**
         * Load jQuery Plugins.
         *
         * @param type {String}
         * @method loadJqueryFn
         */
        loadJqueryFn('all');
    });
    
    /*
        ================ Controller ================
        
                @FirstPageController Controller
                (is declared on the first Page)
                
        ================ Controller ================
    */
    app.controller('FirstPageController', function($scope, $http, $routeParams, TopicsService, EntriesService, OthersService, _zhType){
        
        /**
         * Get the list of topics
         *
         * @param callback {Function}
         * @service TopicsService
         * @method list
         */
        TopicsService.list(function(data){
            if(!data || !data.Entries){ return false }
            
            $scope.topics = data.Entries;
        });
        
        var Entries_Assets = function(entries, callback){
            var Entries = (!entries ? $scope.entries : entries),
                n = 0,
                arg = arguments,
                exec = function(){
                    if(n==2 && callback){
                        callback(arg[2], arg[3], arg[4], arg[5]);
                    }
                }
            for(var key in Entries){
                var val = Entries[key];
                
                /**
                 * Get Entry Replies
                 *
                 * @propery val.inReplyTo.
                 */
                EntriesService.replies(val.id, function(data, opts){
                    if(data && data.Entries){  
                        Entries[opts.key].replies = data.Entries;
                    }
                    
                    n++;
                    exec();
                }, {key: key});
                
                /**
                 * Get inReplyToName
                 *
                 * @propery val.inReplyTo.
                 */
                if(val.inReplyTo){
                    EntriesService.get(val.inReplyTo, function(data, opts){
                        if(data && data.Entries){ 
                            Entries[opts.key].inReplyToName = data.Entries[0].lastModifiedByName;
                        }

                        n++;
                        exec();
                    }, {key: key});
                }
            }
        }
        
        /**
         * Get the list of forum entries
         *
         * @param topic {String}
         * @param callback {Function}
         * @service EntriesService
         * @method list
         */
        EntriesService.list( (_zhType == "list" ? $routeParams.topicTitle : null), function(data){
            if(!data || !data.Entries){ return false }
            
            $scope.entries = data.Entries;
            
            Entries_Assets($scope.entries);
            
            /**
             * If page is a list with forum entries
             *
             * @propery isList.
            */
            if(_zhType == "list"){
                
                $scope.isList = true;
                
                /**
                 * Get the list of topics
                 *
                 * @param topic {String}
                 * @param callback {Function}
                 * @service TopicsService
                 * @method find
                 */
                TopicsService.find($routeParams.topicTitle, function(data){
                    if(!data || !data.Entries){ return false }
                    
                    $scope.topic = data.Entries[0];
                });
            }

        });
        
        /**
         * Item remove action
         */
        $scope.removeItem = function(event, id){
            event.stopPropagation();
            var parent = $(event.currentTarget).parents("._5cParent"),
                parentId = parent.closest("._5prEntriesList-item").find("._5cParent:first-child").attr("data-item-id"),
                currentId = id;
            
            if(parent.closest("._5prEntriesList-item").find("._5cParent").size()<=1){
                parent = parent.closest("._5prEntriesList-item");
            }
            
            OthersService.modal("confirm", $scope.captions.message, $scope.captions.removeConfirmation, function(r){
                if(!r){ return false }
                
                /**
                 * Delete an Entry
                 *
                 * @param post_id {Number} id of an Entry
                 * @param callback {Function}
                 * @service EntriesService
                 * @method delete
                 */
                EntriesService.delete(id, function(data){
                    if(!data){
                        // Notify of error request
                        OthersService.modal("error", $scope.captions.errorTitle, $scope.captions.errorText);

                        parent.stop(true).slideDown("fast", function(){$(this).removeAttr("style")});
                        return false
                    }

                    // Notify of success request
                    OthersService.notify($scope.captions.message, $scope.captions.entryDeleted, "<i class=\"icon-fi-check-circle\"></i>");
                    
                    // Remove from Memory
                    for(var key in $scope.topics){
                        var value = $scope.topics[key];
                        if(value.lastEntry == currentId){
                            TopicsService.get(value.id, function(data, opts){
                                if(!data || !data.Entries){ return false }
                                
                                if($scope.topics[opts.key].id == data.Entries[0].id){ 
                                    $scope.topics[opts.key] = data.Entries[0];
                                }
                                
                            }, {key: key});
                            break;   
                        }
                    }
                    
                    $scope.entries.filter(function(value, index){
                        if(value.id == currentId){
                            $scope.entries.splice(index, 1);
                        }
                        if(value.replies){
                            value.replies.filter(function(val, key){
                                if(val.id == currentId){
                                    value.replies.splice(key, 1);
                                }
                                if(value.replies.length <= 0){
                                    delete value.replies;   
                                }
                            });
                        }
                        if(value.conversation){
                            value.conversation.filter(function(val, key){
                                if(val.id == currentId){
                                    value.conversation.splice(key, 1);
                                }
                                if(value.conversation.length <= 0){
                                    delete value.conversation;   
                                }
                            });
                        }
                    });

                    parent.queue(function(){
                        $(this).dequeue().remove();
                    });
               });

               parent.stop().slideUp("fast");
            });
            
            return true;
        }
        
        /**
         * This function will create a reply form.
         *
         * @param event {Event} Event from angular $event.
         * @param id {Number} isReplyTo Entry id.
         * @param topic {String} Topic title from Entry.
         * @param username {String} Entry username
         */
        $scope.replyBtn = function(event, id, topic, username){
            event.stopPropagation();
            var timestamp = new Date().getTime(),
                topic = escape(topic.replace(/\\/g, "\\\\")),
                template = '<div class="_5prEntriesList-item-reply padding015 gr9Ch" data-inReplyTo-id="'+id+'">\
                                <form ng-submit="submitReply($event, \''+id+'\', '+timestamp+', \''+topic+'\', \''+username+'\')">\
                                    <div class="form-group">\
                                        <label for="inputText-'+id+'">{{captions.text}}:</label>\
                                        <textarea class="form-control _4aS" id="inputText-'+id+'" ng-model="post_reply_text_'+timestamp+'" rows="5" required></textarea>\
                                    </div>\
                                    <div class="row">\
                                        <a class="replyMaskCancel" class="pull-left" style="font-size:12px; color:#888; margin-top:5px;cursor:pointer;"><i class="icon-fi-times-circle"></i> {{captions.cancel}}</a>\
                                        <button type="submit" class="btn btn-success btn-sm pull-right"><i class="icon-fi-paper-plane"></i> {{captions.submit | ucfirst}}</button>\
                                    </div>\
                                </form>\
                            </div>',
                el = $(event.currentTarget),
                parent = el.closest("._5cParent"),
                html = OthersService.compile(template, $scope);
            
            template = $(html);
            
            if(parent.find("._5prEntriesList-item-reply").size() > 0){
                parent.find("._5prEntriesList-item-reply").stop(true).toggle();
            }else{
                template.find(".replyMaskCancel").on("click", function(e){
                    e.preventDefault();
                    template.stop(true).hide(0, function(){
                        $(this).remove();   
                    });
                });

                template.appendTo(parent);
            }
            parent.find("._5prEntriesList-item-reply").find("textarea").focus();
            loadJqueryFn('repeat');
        }
        
        /**
         * This function will submit the reply form.
         *
         * @param event {Event} Event from angular $event.
         * @param id {Number} isReplyTo Entry id.
         * @param customId {Number} Generated number for name of Input fields.
         * @param topic {String} Topic title from Entry.
         * @param username {String} Entry username
         */
        $scope.submitReply = function(event, id, customId, topic, username){
            $('button:submit').attr('disabled','disabled');
            
            var data = {
                inReplyTo: id,
                topic: topic,
                text: $scope["post_reply_text_"+customId],
            },
                parentId = id,
                parent = $(event.currentTarget).parents("._5prEntriesList-item-reply");
            
            /**
             * Create an Entry
             *
             * @param data {Object} create request data
             * @param callback {Function}
             * @service EntriesService
             * @method create
             */
            EntriesService.create(data, function(data){
                if(!data){
                    // Notify of error request
                    OthersService.modal("error", $scope.captions.errorTitle, $scope.captions.errorText);
                    
                    return false
                }
                
                // Notify of success request
                OthersService.notify($scope.captions.message, $scope.captions.entryCreated, "<i class=\"icon-fi-check-circle\"></i>");
                
                // Add to Memory
                if(data.Entries && data.Entries[0]){
                    data.Entries[0].inReplyToName = username;
                    
                    $scope.entries.push(data.Entries[0]);
                    
                    // Add to Memory replies
                    $scope.entries.filter(function(value, index){
                        if(value.id == parentId){
                            if(!value.replies){
                                value.replies = [];   
                            }
                            value.replies.push(data.Entries[0]);
                        }
                    });
                    $scope.topics.filter(function(value, index){
                        if(value.title == topic){
                            value.lastEntryText = data.Entries[0].text;
                            value.lastEntry = data.Entries[0].id;
                        }
                    });
                }
                
                parent.remove();
                $('button:submit').removeAttr('disabled');
            });
        }
        
        /**
         * This function will load the up conversation of an Entry
         *
         * @param event {Event} Event from angular $event.
         * @param id {Number} isReplyTo Entry id.
         */
        $scope.loadConversationUp = function(event, id, entry){
            event.stopPropagation();
            
            if(typeof(entry.conversationShow) != "undefined"){
                entry.conversationShow = !entry.conversationShow;
                $(event.currentTarget).closest("._5cParent").toggleClass("gr9Ch").prev("._5prEntriesList-item-conversation").toggle();
                return true;
            }
            
            var opts = {
                id: id, 
                el: $(event.currentTarget), 
                conversation: [], 
                parent: $(event.currentTarget).closest("._5cParent"), 
                entry: entry
            }
            
            EntriesService.conversation(id, function(data){
                if(!data || !data.Entries || !data.Entries[0] || !data.Entries[0].entries){ return false } 
                
                var n = 0,
                    exec = function(){
                        if(n < data.Entries[0].entries.length){return false}
                        var timestamp = new Date().getTime();
                        $scope["item_conversation_" + timestamp] = opts.conversation;
                        var template = '<div class="_5prEntriesList-item-conversation">\
                                            <div class="row _5cParent gr9Ch" data-item-id="{{rEntry.id}}" ng-repeat="rEntry in item_conversation_'+timestamp+' | orderBy:\'lastModified\'" m-repeat-directive>\
                                                <div class="_5cChild">\
                                                    <div class="_5prEntriesList-item-options">\
                                                        <ul class="list-inline">\
                                                            <li><a href="#/edit/{{rEntry.id}}" class="_5cChild-item-edit" data-title="{{captions.edit}}"><i class="icon-fi-pencil-square-o"></i></a></li>\
                                                            <li><a class="_5cChild-item-remove" data-title="{{captions.remove}}" ng-click="removeItem($event, rEntry.id)"><i class="icon-fi-times"></i></a></li>\
                                                        </ul>\
                                                    </div>\
                                                    <div class="_5prEntriesList-item-topic"></div>\
                                                    <div class="_5prEntriesList-item-text"><p style="white-space: pre-wrap;">{{rEntry.text}}</p></div>\
                                                    <div class="row _5prEntriesList-item-bottom">\
                                                        <div class="_5prEntriesList-item-info col-xs-6"><ul class="list-inline"><li><i class="icon-fi-user" data-title="{{captions.user}}"></i> {{rEntry.lastModifiedByName}}</li> <li><i class="icon-fi-calendar" data-title="{{captions.date}}"></i> {{rEntry.lastModified | date:\'HH:mm dd-MM-yyyy\'}}</li> <li ng-show="rEntry.replies"><i class="icon-fi-comment-o" data-title="{{captions.replies}}"></i> {{rEntry.replies.length}}</li></ul></div>\
                                                        <div class="_5prEntriesList-item-actions col-xs-6 pull-right text-right"><ul class="list-inline"><li ng-show="rEntry.replies"><a class="item-actions-conversationDown" data-title="{{captions.conversationDown}}" ng-click="loadConversationDown($event, rEntry.id, rEntry)"><i class="icon-fi-comment-down"></i></a></li><li style="padding-right:0"><a ng-click="replyBtn($event, rEntry.id, rEntry.topic, rEntry.lastModifiedByName)" class="btn btn-warning btn-sm _5prEntriesList-item-replyBtn">{{captions.reply | ucfirst}}</a></li></ul></div>\
                                                    </div>\
                                                </div>\
                                            </div>\
                                        </div>\
                                    </div>',
                                html = OthersService.compile(template, $scope);

                        template = $(html);
                        opts.parent.addClass("gr9Ch").before(template);
                        opts.entry.conversationShow = true;
                        opts.entry.conversation = opts.conversation;
                    }
                
                for(var key in data.Entries[0].entries){
                    var val = data.Entries[0].entries[key];
                    
                    EntriesService.get(val, function(data){
                        
                        if(data && data.Entries && data.Entries[0]){
                            opts.conversation.push(data.Entries[0]);   
                        }
                        
                        n++;
                        exec();
                    });
                    
                }
                
            });
        }
        
        /**
         * This function will load the down conversation of an Entry
         *
         * @param event {Event} Event from angular $event.
         * @param id {Number} isReplyTo Entry id.
         * @param entry {Object} Entry
         */
        $scope.loadConversationDown = function(event, id, entry){
            event.stopPropagation();
            
            if(typeof(entry.repliesShow) != "undefined"){
                entry.repliesShow = !entry.repliesShow;
                $(event.currentTarget).closest("._5cParent").next("._5prEntriesList-item-replies").toggle();
                return true;
            }
            
            var el = $(event.currentTarget),
                parent = el.closest("._5cParent"),
                replies = entry.replies;
            
            Entries_Assets(replies, function(el, parent, replies, entry){
                var timestamp = new Date().getTime();
                $scope["item_replies_" + timestamp] = replies;
                var template = '<div class="_5prEntriesList-item-replies">\
                                    <div class="row _5cParent gr9Ch" data-item-id="{{rEntry.id}}" ng-repeat="rEntry in item_replies_'+timestamp+' | orderBy:\'-lastModified\'" m-repeat-directive>\
                                        <div class="_5cChild">\
                                            <div class="_5prEntriesList-item-options">\
                                                <ul class="list-inline">\
                                                    <li><a href="#/edit/{{rEntry.id}}" class="_5cChild-item-edit" data-title="{{captions.edit}}"><i class="icon-fi-pencil-square-o"></i></a></li>\
                                                    <li><a class="_5cChild-item-remove" data-title="{{captions.remove}}" ng-click="removeItem($event, rEntry.id)"><i class="icon-fi-times"></i></a></li>\
                                                </ul>\
                                            </div>\
                                            <div class="_5prEntriesList-item-topic"></div>\
                                            <div class="_5prEntriesList-item-text"><p style="white-space: pre-wrap;">{{rEntry.text}}</p></div>\
                                            <div class="row _5prEntriesList-item-bottom">\
                                                <div class="_5prEntriesList-item-info col-xs-6"><ul class="list-inline"><li><i class="icon-fi-user" data-title="{{captions.user}}"></i> {{rEntry.lastModifiedByName}}</li> <li><i class="icon-fi-calendar" data-title="{{captions.date}}"></i> {{rEntry.lastModified | date:\'HH:mm dd-MM-yyyy\'}}</li> <li ng-show="rEntry.replies"><i class="icon-fi-comment-o" data-title="{{captions.replies}}"></i> {{rEntry.replies.length}}</li></ul></div>\
                                                <div class="_5prEntriesList-item-actions col-xs-6 pull-right text-right"><ul class="list-inline"><li ng-show="rEntry.replies"><a class="item-actions-conversationDown" data-title="{{captions.conversationDown}}" ng-click="loadConversationDown($event, rEntry.id, rEntry)"><i class="icon-fi-comment-down"></i></a></li><li style="padding-right:0"><a ng-click="replyBtn($event, rEntry.id, rEntry.topic, rEntry.lastModifiedByName)" class="btn btn-warning btn-sm _5prEntriesList-item-replyBtn">{{captions.reply | ucfirst}}</a></li></ul></div>\
                                            </div>\
                                        </div>\
                                    </div>\
                                </div>\
                            </div>',
                        html = OthersService.compile(template, $scope);
            
                template = $(html);
                parent.after(template);
                entry.repliesShow = true;
                
            }, el, parent, replies, entry);
        }
        
        /**
         * Trigger loadConversationUp btn
         *
         * @method on.click
         */
        $('._5prEntriesList').on("click", ".inReplyTo", function(e){
            e.preventDefault();
            var parent = $(this).parents("._5prEntriesList-item"),
                btn = parent.find(".item-actions-conversationUp");
            if(btn.size() > 0){
                btn.trigger('click');
                return true;
            }
        });
        
        /**
         * Load jQuery Plugins.
         *
         * @method loadJqueryFn
         */
        loadJqueryFn();
    });
    
    /*
        ================ Controller ================
        
                @AddFormController Controller
          (is declared on Add and Edit Entry Page)
         
        ================ Controller ================
    */
    app.controller('AddFormController', function($scope, $http, $routeParams, TopicsService, EntriesService, OthersService, _zhType){
        
        /**
         * Get the list of topics
         *
         * @param callback {Function}
         * @service TopicsService
         * @method list
         */
        TopicsService.list(function(data){
            if(!data || !data.Entries){ return false }
            
            $scope.topics = data.Entries;
        });
        
        /**
         * If is isseted the topic title in url
         *
         * @propery topicTitle
         */
        if($routeParams.topicTitle){
            $scope.post_topic = $routeParams.topicTitle;
        }
        
        /**
         * If is isseted the entry id in url
         *
         * @propery entryId
         */
        if($routeParams.entryId){
            EntriesService.get($routeParams.entryId, function(data){
                if(!data || !data.Entries || !data.Entries[0]){ _zhType = "new"; return false }
                $scope.post_topic = data.Entries[0].topic;
                $scope.post_text = data.Entries[0].text;
                $scope.isEditMode = true;
                setTimeout(function(){
                    $('textarea._4aS').trigger('autosize.resize')
                }, 10);
            });
        }
        
        /**
         * This function will submit the entry form.
         */
        $scope.submitData = function(){
            $('button:submit').attr('disabled','disabled');
            
            var data = {
                topic: $scope.post_topic,
                text: $scope.post_text,
            }
            
            /**
             * Check what kind of request is it
             *
             * @propery _zhType {'new','edit'}
             */
            switch(_zhType){
                case 'new':
                    
                    /**
                     * Create an Entry
                     *
                     * @param data {Object} create request data
                     * @param callback {Function}
                     * @service EntriesService
                     * @method create
                     */
                    EntriesService.create(data, function(data){
                        if(!data){
                            // Notify of error request
                            OthersService.modal("error", $scope.captions.errorTitle, $scope.captions.errorText);
                            
                            return false
                        }
                        
                        // Notify of success request
                        OthersService.notify($scope.captions.message, $scope.captions.entryCreated, "<i class=\"icon-fi-check-circle\"></i>");
                        
                        location.href = '#/list/' + $scope.post_topic + '/entryId/' + data.Entries[0].id;
                        $('button:submit').removeAttr('disabled');
                    }); 
                    
                break;
                case 'edit':
                    /**
                     * Update an Entry
                     *
                     * @param id {Number} id of an Entry
                     * @param data {Object} update request data
                     * @param callback {Function}
                     * @service EntriesService
                     * @method create
                     */
                    EntriesService.update($routeParams.entryId, data, function(data){
                        if(!data){
                            // Notify of error request
                            OthersService.modal("error", $scope.captions.errorTitle, $scope.captions.errorText);
                            
                            return false
                        }
                        
                        // Notify of success request
                        OthersService.notify($scope.captions.message, $scope.captions.entryEdited, "<i class=\"icon-fi-check-circle\"></i>");
                        
                        location.href = '#/list/' + $scope.post_topic + '/entryId/' + data.Entries[0].id;
                        $('button:submit').removeAttr('disabled');
                    });
                    
                break;
            }
        }
        
        //CTRL+S to save
        $(window).bind('keydown', function(event) {
            if (event.ctrlKey || event.metaKey) {
                switch (String.fromCharCode(event.which).toLowerCase()) {
                    case 's':
                    event.preventDefault();
                    $('button:submit').trigger("click")
                break;
                }
            }
        });
        
        /**
         * Load jQuery Plugins.
         *
         * @method loadJqueryFn
         */
        loadJqueryFn();
    });
    
    /*
        ================ Services ================
        
                   Application Services
                   (custom ng Services)
                
        ================ Services ================
    */
    
    /**
     * The service of topics
     *
     * @service TopicsService
     * @method list {function}
     * @method get {function}
     * @method find {function}
     * @method update {function}
     */
    app.service('TopicsService', function($http, AjaxService){
        this.list = function(callback){
            AjaxService.send('get', 'rest/api/json/0/topics').success(function(r){
                if(r.StatusCode && r.StatusCode.CodeNumber == 0){
                    if(callback){callback(r);}else{return true;};
                }else{
                    if(callback){callback(false);}else{return false;};
                }
            }).error(function(){
                if(callback){callback(false);}else{return false;}; 
            });
        }
        
        this.get = function(id, callback, opts){
            AjaxService.send('get', 'rest/api/json/0/topics/' + id).success(function(r) {
                if(r.StatusCode && r.StatusCode.CodeNumber == 0){
                    if(callback){callback(r, (opts ? opts : null));}else{return true;};
                }else{
                    if(callback){callback(false);}else{return false;};
                }
            }).error(function(){
                if(callback){callback(false);}else{return false;}; 
            });
        }
        
        this.find = function(d, callback){
            AjaxService.send('get', 'rest/api/json/0/topics?title=' + d).success(function(r) {
                if(r.StatusCode && r.StatusCode.CodeNumber == 0){
                    if(callback){callback(r);}else{return true;};   
                }else{
                    if(callback){callback(false);}else{return false;};
                }
            }).error(function(){
                if(callback){callback(false);}else{return false;}; 
            });
        }
        
        this.update = function(id, data, callback){
            AjaxService.send('put',  'rest/api/json/0/topics/' + id, data).success(function(r){
                if(r.StatusCode && r.StatusCode.CodeNumber == 0){
                    if(callback){callback(r);}else{return true;};
                }else{
                    if(callback){callback(false);}else{return false;};
                }
            }).error(function(){
                if(callback){callback(false);}else{return false;}; 
            }); 
        }
    });
    
    /**
     * The service of forum entries
     *
     * @service EntriesService
     * @method list {function}
     * @method get {function}
     * @method create {function}
     * @method update {function}
     * @method delete {function}
     * @method replies {function}
     * @method conversation {function}
     */
    app.service('EntriesService', function($http, AjaxService){
        this.list = function(id, callback){
            AjaxService.send('get', 'rest/api/json/0/forumentries' + (id != null ? '?topic='+ id : '' )).success(function(r){
                if(r.StatusCode && r.StatusCode.CodeNumber == 0){
                    if(callback){callback(r);}else{return true;};
                }else{
                    if(callback){callback(false);}else{return false;};
                }
            }).error(function(){
                if(callback){callback(false);}else{return false;}; 
            });
        }
        
        this.get = function(id, callback, opts){
            AjaxService.send('get', 'rest/api/json/0/forumentries/' + id).success(function(r){
                if(r.StatusCode && r.StatusCode.CodeNumber == 0){
                    if(callback){callback(r,(opts ? opts : null));}else{return true;};
                }else{
                    if(callback){callback(false);}else{return false;};
                }
            }).error(function(){
                if(callback){callback(false);}else{return false;}; 
            });
        }
        
        this.create = function(data, callback){
            AjaxService.send('post', 'rest/api/json/0/forumentries', data).success(function(r){
               if(r.StatusCode && r.StatusCode.CodeNumber == 0){
                    if(callback){callback(r);}else{return true;};
                }else{
                    console.log(r);
                    if(callback){callback(false);}else{return false;};
                }   
            }).error(function(){
                if(callback){callback(false);}else{return false;}; 
            });
        }
        
        this.update = function(id, data, callback){
            AjaxService.send('put',  'rest/api/json/0/forumentries/' + id, data).success(function(r){
               if(r.StatusCode && r.StatusCode.CodeNumber == 0){
                    if(callback){callback(r);}else{return true;}
                }else{
                    console.log(r);
                    if(callback){callback(false);}else{return r;}
                }
            }).error(function(){
                if(callback){callback(false);}else{return false;}; 
            });
        }
        
        this.delete = function(id, callback){
            AjaxService.send('delete', 'rest/api/json/0/forumentries/' + id).success(function(r){
               if(r.StatusCode && r.StatusCode.CodeNumber == 0){
                    if(callback){callback(r);}else{return true;};
                }else{
                    console.log(r);
                    if(callback){callback(false);}else{return r;};
                }   
            }).error(function(){
                if(callback){callback(false);}else{return false;}; 
            });  
        }
        
        this.replies = function(id, callback, opts){
            AjaxService.send('get', 'rest/api/json/0/forumentries' + (id != null ? '?inReplyTo='+ id : '' )).success(function(r){
                if(r.StatusCode && r.StatusCode.CodeNumber == 0){
                    if(callback){callback(r, (opts ? opts : null));}else{return true;};
                }else{
                    if(callback){callback(false);}else{return false;};
                }
            }).error(function(){
                if(callback){callback(false);}else{return false;}; 
            });
        }
        
        this.conversation = function(id, callback, opts){
            AjaxService.send('get', 'rest/api/json/0/conversations/' + id).success(function(r){
                if(r.StatusCode && r.StatusCode.CodeNumber == 0){
                    if(callback){callback(r,(opts ? opts : null));}else{return true;};
                }else{
                    if(callback){callback(false);}else{return false;};
                }
            }).error(function(){
                if(callback){callback(false);}else{return false;}; 
            });
        }
    });
    
    /**
     * The service of users
     *
     * @service UsersService
     * @method get {function}
     */
    app.service('UsersService', function($http, AjaxService){
        this.get = function(id, callback){
            AjaxService.send('get', 'rest/api/json/0/employees/'+ id).success(function(r){
                if(r.StatusCode && r.StatusCode.CodeNumber == 0){
                    if(callback){callback(r);}else{return true;};
                }else{
                    if(callback){callback(false);}else{return false;};
                }
            }).error(function(){
                if(callback){callback(false);}else{return false;}; 
            });
        };
    });
    
    /**
     * The service of captions
     *
     * @service CaptionsService
     * @method get {function}
     */
    app.service('CaptionsService', function($http, AjaxService){
        this.get = function(captions, callback){
            var data = "",
                first = true;
            for(key in captions){
                var value = captions[key],
                    param = (first ? '?' : '&');
                data += param + 'id=' + value;
                first = false;
            }
            AjaxService.send('get', 'rest/api/json/0/captions' + data).success(function(data){
                callback(data);
            }).error(function(){
                if(callback){callback(false);}else{return false;}; 
            });
        }
    });
    
    /**
     * The service with other different functions
     *
     * @service OthersService
     * @method compile {function}
     * @method notify {function}
     * @method modal {function}
     */
    app.service('OthersService', function($http, $compile, AjaxService){
        this.compile = function(template, scope){
            var temp = angular.element(template),
                link = $compile(temp),
                entry = link(scope);
            return entry;
        }
        
        this.notify = function(title, message, icon, callback){
            if(!callback){ callback = null }
            return notify({
                title: title,
                message: message,
                icon: icon,
                theme: "dark-theme",
                closeBtn: false,
                autoHide: true,
                onHide: callback,
                position: {x: "right", y: "top"}
            });   
        }
        
        this.modal = function(type, title, text, callback){
            if(!callback){ callback = null }
            return modal({
                type: type,
                title: title,
                text: text,
                buttonText: {ok:_captions.ok,yes:_captions.yes,cancel:_captions.cancel},
                callback: callback
            });
        }
    });
    
    /**
     * The service of AJAX
     *
     * @service AjaxService
     * @method send {function}
     */
    app.service('AjaxService', function($http){
        this.send = function(_method, _uri, _data){
            return $http[_method](
                _uri ? restBase + _uri : null,
                _data ? _data : { params: null },
                { params: null }
            );
        };
    });

    /*
        ================ Directives ================
        
                   Application Directives
        (load jQuery plugins for data in ng-repeat)
                
        ================ Directives ================
    */
    app.directive('mRepeatDirective', function() {
        return function(scope, element, attrs) {
   	        if (scope.$last){
                setTimeout(function(){loadJqueryFn('repeat')},1);
   		    }
  		};
	});
    
    /*
        ================ Filters ================
        
                   Application Filters
                
        ================ Filters ================
    */
    app.filter('nl2br', function () {
        return function(str, is_xhtml) {
            var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
            return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
        }
    }).filter('noHTML', function () {
        return function(text) {
            return htmlentities(text);
        }
    }).filter('ucfirst', function () {
        return function(string) {
            return (string ? string.charAt(0).toUpperCase() + string.slice(1) : '');
        }
    }).filter('bbcode', function () {
        return function(text) {
            text = htmlentities(text);
            return text
                .replace(/\[web\|(.*?)\]/g, "<a href=\"$1\" target=\"_blank\">$1</a>")
                .replace(/\[doc\|(.*?)\]/g, "<a href=\"/projectile/start#!/$1\" target=\"_parent\">Link to a Document</a>")
                .replace(/\[(.*?)\]/g, "<a href=\"#/list/$1\" style=\"text-decoration:underline\">$1</a>");
            }
    }).filter('escape', function(){
        return function(text) {
            if(!text){return ""}
            return escape(text);   
        }
    })
    
     /*
        ================ Javascript & jQuery ================
        
            Application javascript and jQuery functions
                
        ================ Javascript & jQuery ================
    */
    
    /**
     * Convert all applicable characters to HTML entities
     */
    function htmlentities(t){
        if(!t){return '';}
        return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
    }
    
    /**
     * If page is is iframe
     */
    function inIframe(){
        try {
            return window.self !== window.top;
        } catch (e) {
            return true;
        }
    }
    
    /**
     * Iso date to time
     */
    function isoDateTime(){
        var d = new Date(),
            date = d.toISOString().slice(0,19);
        return date;
    }
    
    /**
     * Location URL manipulation
     * 
     * @method addParameter {Function}
     * @method removeParameter {Function}
     * @method getParameter {Function}
     * @method redirect_to {Function}
     */
    var _location = {
        addParameter: function(key, value, sourceURL){
            var sourceURL = (sourceURL ? sourceURL : location.href),
                separator = (sourceURL.indexOf('?') > -1 ? "&" : "?");
            if(f._location.getParameter(key)){
                sourceURL = f._location.removeParameter(key)
            }
            return sourceURL + separator + key + "=" + value;
        },
        removeParameter: function(key, sourceURL){
            var sourceURL = (sourceURL ? sourceURL : location.href),
                rtn = sourceURL.split("?")[0],
                param,
                params_arr = [],
                queryString = (sourceURL.indexOf("?") !== -1) ? sourceURL.split("?")[1] : "";
            if (queryString !== "") {
                params_arr = queryString.split("&");
                for (var i = params_arr.length - 1; i >= 0; i -= 1) {
                    param = params_arr[i].split("=")[0];
                    if (param === key) {
                        params_arr.splice(i, 1);
                    }
                }
                rtn = rtn + "?" + params_arr.join("&");
            }
            return rtn;
        },
        getParameter: function(name, hash){
            if(!name){ return; }
            name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
            var regexS = "[\\?&\/]"+name+"[=\/]([^&#]*)",
                regex = new RegExp( regexS ),
                results = regex.exec( (!hash ? location.href : location.hash) );
            if( results == null )
                return false;
            else
                return decodeURIComponent(results[1].replace(/\+/g, " "));
        },
        redirect_to: function(url){
            location.href = url;
        }
    };
    
    /**
     * Back to Top button
     */
    function backToTopFn(){
        $(window).scroll(function(){;
            if($(window).scrollTop() > Math.floor($(window).height() / 2.5) && $(window).height() > 100){
                $('.scrollUpDownBtn').fadeIn(250);  
            }else{
                $('.scrollUpDownBtn').stop(true).fadeOut(250);   
            }
        });
        $('.scrollUpDownBtn').on('click', function(e){
            e.preventDefault();
            $("body").stop(true).animate({scrollTop: 0}, 'fast');
        });
    }
    
    /**
     * Scroll to Forum Entry
     */
    function scrollToMessage(){
        if(window.toMessageScrolled){ return false }
        var $hash_link = location.hash;
        if($hash_link.search(/\#\/list\//) > -1 && _location.getParameter('entryId', true)){
            var $param = _location.getParameter("entryId", true),
                $item = $('._5lBp > li:has(._5cParent[data-item-id^="'+$param+'"])');
            if($item.size() > 0){
                $item.css('opacity','1').css('background-color','#FFF8D0');
                $("body").animate({scrollTop: $item.offset().top - 25 - $('#header').outerHeight()}, "slow", function(){
                    $item.css('background-color','#fff');
                });
                window.toMessageScrolled = true;
            }
        }
    }
    
    /**
     * Load jQuery plugins
     *
     * @param k {'all','repeat', false}
     */
    function loadJqueryFn(k){
        if(k == 'all'){
            return true;
        }
        if(k == 'repeat'){
            //enable tipsy
            $('*[data-title]').tipsy();
            
            // enable textarea autosize
            $('textarea._4aS').autosize();
            
            //scroll to entry
            scrollToMessage();
            
            return;
        }
        
        // remove preloader
        $('.preloader').remove();
        
        // enable tipsy
        $('*[data-title]').tipsy();
	
	    // enable textarea autosize
	    $('textarea._4aS').autosize();
        
        // enable characters length counter
        $('textarea._4aS[maxlength]').on("keyup focus input propertychange", function (e) {
            var maxlength = $(this).attr('maxlength'),
                numberOfLineBreaks = ($(this).val().match(/\n/g)||[]).length,
                left = maxlength - $(this).val().length - numberOfLineBreaks,
                left = left < 0 ? 0 : left;
            
            $(this).next('span.help-block').find('i').text(left);
            $(this).next('span.help-block').slideDown(250)
        });
        
        // enable input autocomplete
        $('input#inputTopic').autocomplete({url: restBase + 'rest/api/json/0/topics', dropdownBtn: '<a class="inputTopicAdd-drop"><i class="icon-fi-sort"></i></a>'});
        
        // enable backToTop Button
        backToTopFn();
        
        //cancel to message scrolling
        window.toMessageScrolled = false;
        
        
        //remove tipsy {Bug}
        $(".tipsy").remove();
    }
    //if(!inIframe()){window.location = 'http://google.com'}
})();
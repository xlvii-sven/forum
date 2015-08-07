/*!
 * Forum | Application
 * Copyright (c) 2015 Infodesire
 * Website: http://infodesire.com/
 * Version: 0.0.6 (06-Aug-2015)
 * Requires: AngularJS 1.3 or later, jQuery v1.7.1 or later 
 */
(function(){
    /**
     * Application initialization in AnugularJS and declare some important properties
     *
     * @Root {String} URL in browser
     * @restBase {String} URL to restAPI
     * @documentsUrl {String} URL to Projectile documents
     * @_captions {Object} Object of all captions 
     * @static
     */
    var app = angular.module('forum', ['ngRoute', 'ngSanitize']);
    var Root = '/projectile/apps/forum/',
        restBase = '/projectile/restapps/forum/',
        documentsUrl = '/projectile/start#!/',
        _captions = {};

    /**
     * AnugularJS | Application Routing
     *
     * @/ {String} Home
     * @/list/:topicTitle {String} Get entries by topic
     * @/add {String} Home with opened add form
     * @/edit/:entryId {String} Get entry by id
     * @/edit/:entryId/edit {String} Edit entry by id
     * @static
     */
    app.config(function($routeProvider) {
        $routeProvider.when('/', {
            templateUrl: Root + 'templates/pages/home-page.html', 
            controller: 'FirstPageController',
            resolve: {_zhType: function(){return false;}}
    	})
        .when('/list/:topicTitle', {
            templateUrl: Root + 'templates/pages/home-page.html', 
            controller:  'FirstPageController',
            resolve: {_zhType: function(){return "list";}}
        })
        .when('/add', {
            templateUrl: Root + 'templates/pages/home-page.html', 
            controller: 'FirstPageController',
            resolve: {_zhType: function(){return "add";}}
    	})
        .when('/entry/:entryId', {
            templateUrl: Root + 'templates/pages/home-page.html', 
            controller:  'FirstPageController',
            resolve: {_zhType: function(){return "view";}}
        })
        .when('/entry/:entryId/edit', {
            templateUrl: Root + 'templates/pages/home-page.html', 
            controller:  'FirstPageController',
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
            document: "Document|Document",
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
            like: "Forum|Like",
            likes: "Forum|Likes",
            unlike: "Forum|Unlike",
            comment: "Tooltip|reply",
            comments: "Forum|Replies",
            removeConfirmation: "${Phrases:Really delete $0 ?}:::${Document:Entry}",
            backToTop: "Tooltip|scroll to start",
            edit: "Tooltip|Edit",
            editText: "Default|${Phrases:change $0}:::${Document:Entry}",
            remove: "Document|Remove",
            viewPrevComments: "Forum|Show previous comments"
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
    app.controller('FirstPageController', function($scope, $http, $routeParams, $filter, TopicsService, EntriesService, DocumentsService, OthersService, _zhType){
        // ----------------------- Initialize --------------------------
        /**
         * Initialize all App properties
         * 
         * @mode {String} ['home', 'view', 'edit']
         * @leftSide {Object}
         * @rightSide {Object}
         */
        $scope.mode = 'home';
        $scope.leftSide = {
            sortTopics: {
                by: '-lastModified', // sort topics by
                button: 2, // sort topics default button index
                reverse: false // sort topcis reverse
            }
        };
        $scope.rightSide = {
            title: null, // title box text
            showList: true, // show entries list
            showForm: false, // show add form
            formTitle: _setRightSideCaption('formTitle', '$scope.captions.addText'), // add form title text
            entryCommentsLimit: 3, // entry comments limit
            forceCommentsShow: false, // show all entry comments without limit
            post_text: {}, // !important for ng-model
            user: {
                image: '/projectile/startFile?f=$AVA_mine'
            },
        };
        
        
        // --------------------- Merge url components -------------------------
        /**
         * Get topic name from url
         *
         * If you have a topic in url, it will select itself automatic
         */
        if($routeParams.topicTitle){
            $scope.Topic = {title: $routeParams.topicTitle};
            $scope.post_topic = $scope.Topic.title
            
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

                $scope.Topic = data.Entries[0];
            });
        }
        
        /**
         * Get entry id from url
         *
         * If you have an entry id in url, it will select itselft automatic
         */
        if($routeParams.entryId){
            $scope.mode = _zhType == 'edit' ? 'edit' : 'view';
            
            $scope.rightSide.title = null;
            $scope.rightSide.forceCommentsShow = true;
            
            if($scope.mode == 'edit'){
                $scope.rightSide.showForm = true;
                $scope.rightSide.showList = false;
                $('#inputTopic').attr('disabled', 'disabled');
            }
        }
        
        /**
         * Get document link from url
         *
         * If you have a document link in url, it will select itself automatic
         */
        var document_link = {href: null, title: null};
        
        if(_location.getParameter("link", true, true)){
            document_link.href = _location.getParameter("link", true, true);
            
            DocumentsService.getName(document_link.href, function(data){
                if(!data || !data.Entries){ return false }
                
                if($scope.mode == 'home') $scope.rightSide.title = document_link.title = data.Entries[0]["translation"];
                window.topicsDocumentFilter = document_link.href;
            });
            
            $scope.document_link = document_link;
        }
        
        
        // ------------------------ Get data to app ---------------------------
        /**
         * Get the list of topics
         *
         * @param callback {Function}
         * @service TopicsService
         * @method list
         */
        TopicsService.list(function(data){
            if(!data || !data.Entries) return false;
            
            $scope.Topics = data.Entries;
        }, document_link.href);
        
        /**
         * Get one or a list of entries
         *
         * @param callback {Function}
         * @service EntriesService
         * @method list, get
         */
        if($scope.mode == 'home' || $scope.mode == 'view' || $scope.mode == 'edit'){
            var fn = 'list',
                param = null,
                param2 = null;
            
            switch($scope.mode){
                case 'home':
                    fn = 'list';
                    param = _zhType == "list" ? $routeParams.topicTitle: null;
                break;
                case 'view':
                    fn = 'get';
                    param = $routeParams.entryId;
                    param2 = true;
                break;
                case 'edit':
                    fn = 'get';
                    param = $routeParams.entryId;
                    param2 = false;
                break;
            }
            
            /**
             * Get one or a list of forum entries
             *
             * @param param {Null, String} null, topic title, entry id
             * @param callback {Function}
             * @param document_link {String}
             * @service EntriesService
             * @method fn {String} list, get
             */
            EntriesService[fn](param, function(data){
                if(!data || !data.Entries) return $scope.mode == 'home' ? false : location.href = '#/';

                $scope.Entries = EntriesService.convert_entries(data.Entries, param2, $scope.mode == 'edit');
                
                if($scope.mode == 'edit'){
                    $scope.Entry = $scope.Entries[0];
                    $scope.document_link = $scope.Entry.links[0];
                    $scope.form_open_entry($scope.Entries);
                }
            }, document_link.href);
        }
        
        
        // ------------------------ App HTML functions ---------------------------
        /**
         * open_topic
         *
         * Redirect page to topic url
         *
         * @param e {Object} Event
         * @param url {String} Topic URL
         * @param index {Number} Topic index (in $scope.Topics)
         */
        $scope.open_topic = function(e, url, index){
            e.preventDefault();
            location.href = url;
        }
        
        /**
         * open_document
         *
         * Redirect page to document url
         *
         * @param url {String} Document URL
         */
        $scope.open_document = function(url){            
            window.top.location.href = documentsUrl + url;
        }
        
        /**
         * add_entry
         *
         * Toggles add form on page
         *
         * @param e {Object} Event
         */
        $scope.add_entry = function(e){
            if(e) e.preventDefault();
            
            if($scope.mode != 'home') location.href = '#/add';
            
            $scope.rightSide.showForm = !$scope.rightSide.showForm;
            
            if($scope.rightSide.showForm){
                setTimeout(function(){
                    var offset = $('#entry-form').offset();
                    $('html, body').animate({
                        scrollTop: offset.top - $('#header').outerHeight() - 25,
                        scrollLeft: offset.left
                    });  
                }, 100);
            }
        }
        
        /**
         * add_entry_close
         *
         * Close and reset add form on page
         *
         * @param e {Object} Event
         */
        $scope.add_entry_close = function(e){
            e.preventDefault();
            
            if($scope.mode == 'edit'){
                history.back();   
            }else{
                $(e.currentTarget).closest("form").get(0).reset();
                $scope.rightSide.showForm = false;
            }
        }
        
        /**
         * comment_entry
         *
         * Open and bring to front comment form
         *
         * @param e {Object} Event
         * @param entry {Object} Entry
         * @param comment {Object} Comment
         * @param index {Number} Entry index (in $scope.Entries)
         */
        $scope.comment_entry = function(e, entry, comment, index){
            e.preventDefault();
            
            var el = $(e.currentTarget),
                parent = el.closest("li.entry-item[id^='entry-']"),
                form =  parent.find('.comments-post-form'),
                hiddeFn = entry.comments.length > 0 ? 'removeClass' : 'toggleClass';
            
            parent.find('.entry-comments')[hiddeFn]('hidden');
            form.find('textarea').focus();
            
            if(comment){
                $scope.rightSide.post_text[entry.id] = '@' + comment.lastModifiedByName + ': ';
            }
            
            if(form.is(':visible')){
                setTimeout(function(){
                    var offset = form.offset();
                    $('html, body').animate({
                        scrollTop: offset.top - $('#header').outerHeight() - 55,
                        scrollLeft: offset.left
                    });  
                }, 100);
            }
        }
        
        /**
         * showAllComments
         *
         * Show all entry comments
         *
         * @param e {Object} Event
         * @param entryId {Number} Entry id
         */
        $scope.showAllComments = function(e, entryId){
            e.preventDefault();
            
            var el = $(e.currentTarget),
                parent = el.closest("li[id^='entry-']");
            
            el.addClass('loading');
            
            setTimeout(function(){
                el.remove();
                parent.find('.comment-entry-item').removeClass('hidden'); 
            }, 1000);
        }
        
        /**
         * _setRightSideCaption
         *
         * Set captions dynamically from captions request
         *
         * @param key {String} $scope key
         * @param title {String} Title
         * @returns {String}
         */
        function _setRightSideCaption(key, title){
            if(!$.isEmptyObject($scope.captions)){
                if($scope.rightSide) $scope.rightSide[key] = eval(title);
                return eval(title);
            }else{
                setTimeout(function(key, title){
                    _setRightSideCaption(key, title)   
                }, 100, key, title);
                
                return "";
            }
        }
        
        
        // ----------------------- App properties changer ------------------------
        /**
         * Set right side title box text
         *
         * @dependsOn {String} mode
         */
        if($scope.mode == 'home'){
            $scope.rightSide.title = _setRightSideCaption("title", "$filter('ucfirst')($scope.captions.last + ' ' + $scope.captions.entries)");
        }
        if($scope.mode == 'edit'){
            $scope.rightSide.formTitle = _setRightSideCaption("formTitle", "$filter('ucfirst')($scope.captions.editText)");
        }
        if($scope.Topic && $scope.Topic.title){
            $scope.rightSide.title = $scope.Topic.title;
        }
        if($scope.document_link){
            $scope.rightSide.title = $scope.document_link.title;   
        }
        
        /**
         * Open add form if isseted 'add' parameter in url
         *
         * @dependsOn {String} _zhType
         */
        if(_zhType == 'add') $scope.add_entry();
        
        
        // ----------------------- App Actions ----------------------------
        /**
         * form_post_entry
         *
         * Post/Edit Entry or Comment
         *
         * @param entryId {String} Entry id
         * @param index {Number} Entry index (in $scope.Entries)
         * @void
         */
        $scope.form_post_entry = function(entryId, index){
            var el = entryId ? $('#entry-'+entryId).find('form') : $('#entry-form').find('form'),
                data = {
                    topic: $scope.post_topic,
                    text: $scope.post_text
                }
            
            if(entryId){
                data.inReplyTo = entryId;
                data.text = $scope.rightSide.post_text[entryId];
            }
            
            if($scope.document_link){
                data.links = [$scope.document_link.href];
            }
            
            el.find('button:submit').attr('disabled','disabled');
            
            /**
             * Check what kind of request is it
             *
             * @propery _zhType
             */
            switch($scope.mode){
                case 'home':
                case 'view':
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
                        OthersService.notify($scope.captions.message, $scope.captions.entryCreated, "<i class=\"fa fa-check-circle\"></i>");
                        
                        if(!entryId){
                            location.reload();
                        }else{
                            var entries = EntriesService.convert_entries(data.Entries, null, true);
                            $scope.Entries[index].comments.push(entries[0]);
                            
                            el.get(0).reset();
                            el.closest('.form-was-focused').removeClass('form-was-focused');
                        }
                        
                        el.find('button:submit').removeAttr('disabled');
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
                        OthersService.notify($scope.captions.message, $scope.captions.entryEdited, "<i class=\"fa fa-check-circle\"></i>");
                        
                        history.back();
                        el.find('button:submit').removeAttr('disabled');
                    });
                    
                break;
            }
        }
        
        /**
         * form_open_entry
         *
         * Open Entry and set values for add form 
         *
         * @param entries {Array} entries
         * @void
         */
        $scope.form_open_entry = function(entries){
            if(!entries || !entries[0]) location.href = '#/';
            
            var entry = entries[0];
            $scope.post_topic = entry.topic;
            $scope.post_text = entry.text;
            
            //html
            setTimeout(function(){
                $('textarea._4aS').trigger('autosize.resize')
            }, 100);
        }
        
        /**
         * like_entry
         *
         * Like/Unlike an Entry and update HTML
         *
         * @param e {Object} Event
         * @param entry {Object} Entry
         * @param index {Number} Entry index (in $scope.Entries)
         * @param parentIndex {Number} Entry index (in $scope.Entries) - used by liking a comment
         * @void
         */
        $scope.like_entry = function(e, entry, index, parentIndex){
            e.preventDefault();
            
            var el = $(e.currentTarget),
                parent = el.closest("li.entry-item[id^='entry-']"),
                like = !entry.liked;
            
            EntriesService.like(entry.id, {like: like});
            
            if(parentIndex != null){
                $scope.Entries[parentIndex].comments[index].likes += like ? 1 : -1;
                $scope.Entries[parentIndex].comments[index].liked = like;
            }else{
                $scope.Entries[index].likes += like ? 1 : -1;
                $scope.Entries[index].liked = like;
            }
        }
        
        /**
         * remove_entry
         *
         * Remove an Entry from Back-end, HTML and Memory
         *
         * @param e {Object} Event
         * @param entryId {Number} Entry id
         * @param index {Number} Entry index (in $scope.Entries)
         * @param parentIndex {Number} Entry index (in $scope.Entries) - used by removing a comment
         * @void
         */
        $scope.remove_entry = function(e, entryId, index, parentIndex){
            e.preventDefault();
            
            var el = $(e.currentTarget),
                parent = el.closest("li[id^='entry-']");
            
            OthersService.modal("confirm", $scope.captions.message, $scope.captions.removeConfirmation, function(r){
                if(!r) return true;

                /**
                 * Delete an Entry
                 *
                 * @param post_id {Number} id of an Entry
                 * @param callback {Function}
                 * @service EntriesService
                 * @method delete
                 */
                EntriesService.delete(entryId, function(data){
                    if(!data){
                        // Notify of error request
                        OthersService.modal("error", $scope.captions.errorTitle, $scope.captions.errorText);

                        parent.stop(true).slideDown("fast", function(){$(this).removeAttr("style")});
                        return false
                    }

                    // Notify of success request
                    OthersService.notify($scope.captions.message, $scope.captions.entryDeleted, "<i class=\"fa fa-check-circle\"></i>");
                    
                    if(!parentIndex){
                        $scope.Entries.splice(index, 1);
                    }else{
                        $scope.Entries[parentIndex].comments.splice(index, 1);
                    }
                    
                    parent.queue(function(){
                        $(this).dequeue().remove();
                    });
                });
                
                if($scope.mode != 'home') location.href = '#/';
                
                parent.stop().slideUp(250);
            });
        }
        
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
        this.list = function(callback, filter){
            AjaxService.send('get', 'api/json/0/topics' + (filter != null ? '?link=' + filter : '')).success(function(r){
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
            AjaxService.send('get', 'api/json/0/topics/' + id).success(function(r) {
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
            AjaxService.send('get', 'api/json/0/topics?title=' + d).success(function(r) {
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
            AjaxService.send('put',  'api/json/0/topics/' + id, data).success(function(r){
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
     * @method like {function}
     * @method likes {function}
     * @method replies {function}
     * @method convert_entries {function}
     */
    app.service('EntriesService', function($http, AjaxService, DocumentsService, OthersService){
        this.list = function(id, callback, filter){
            AjaxService.send('get', 'api/json/0/forumentries' + (id != null ? '?topic='+ id : '') + (filter != null ? (id==null ? '?' : '&') + 'link=' + filter : '')).success(function(r){
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
            AjaxService.send('get', 'api/json/0/forumentries/' + id).success(function(r){
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
            AjaxService.send('post', 'api/json/0/forumentries', data).success(function(r){
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
            AjaxService.send('put',  'api/json/0/forumentries/' + id, data).success(function(r){
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
            AjaxService.send('delete', 'api/json/0/forumentries/' + id).success(function(r){
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
        
        this.like = function(id, data, callback, opts){
            AjaxService.send('put', 'api/json/0/likes/^.|Forum|ForumEntry|1|' + id, data).success(function(r){
                if(r.StatusCode && r.StatusCode.CodeNumber == 0){
                    if(callback){callback(r,(opts ? opts : null));}else{return true;};
                }else{
                    if(callback){callback(false);}else{return false;};
                }
            }).error(function(){
                if(callback){callback(false);}else{return false;}; 
            });
        }
        
        this.likes = function(id, callback, opts){
            AjaxService.send('get', 'api/json/0/likes/^.|Forum|ForumEntry|1|' + id).success(function(r){
                if(r.StatusCode && r.StatusCode.CodeNumber == 0){
                    if(callback){callback(r,(opts ? opts : null));}else{return true;};
                }else{
                    if(callback){callback(false);}else{return false;};
                }
            }).error(function(){
                if(callback){callback(false);}else{return false;}; 
            });
        }
        
        this.replies = function(id, callback, opts){
            AjaxService.send('get', 'api/json/0/forumentries' + (id != null ? '?inReplyTo='+ id : '' )).success(function(r){
                if(r.StatusCode && r.StatusCode.CodeNumber == 0){
                    if(callback){callback(r, (opts ? opts : null));}else{return true;};
                }else{
                    if(callback){callback(false);}else{return false;};
                }
            }).error(function(){
                if(callback){callback(false);}else{return false;}; 
            });
        }
        
        this.convert_entries = function(entries, getComments, areComments){
            var data = entries.filter(function(value, index){
                return (areComments ? true : !value.inReplyTo);
            });
            
            for(var i = 0, val = null; i<entries.length; i++){
                val = entries[i];
                
                //user avatar
                val.lastModifiedByImageURL = '/projectile/' + val.lastModifiedByImageURL;
                
                //links
                for(var k = 0; k<val.links.length; k++){
                    val.links[k] = {href: val.links[k], title: ''};
                    
                    (function(documentLink, linksKey, Entry){
                        DocumentsService.getName(documentLink, function(data){
                            if(!data || !data.Entries){ return false }

                            Entry.links[linksKey].title = data.Entries[0]["translation"];
                        });
                    })(val.links[k].href, k, val);
                }
                
                //likes
                val.liked = false;
                val.likes = 0;
                (function(EntriesService, entry){
                    EntriesService.likes(entry.id, function(data){
                        if(data && data.Entries){
                            entry.liked = data.Entries[0].like;
                            entry.likes = data.Entries[0].likes;
                        }

                    });
                })(this, val);
                
                //comments
                val.comments = [];
                if(getComments){
                    (function(EntriesService, entry){
                        EntriesService.replies(entry.id, function(data){
                            if(data && data.Entries){
                                entry.comments = EntriesService.convert_entries(data.Entries, false, true);
                            }

                        });
                    })(this, val);
                }else{
                    if(val.inReplyTo){
                        var key = null;
                        data.filter(function(value, index){
                            if(value.id == val.inReplyTo){
                                key = index;
                                return [value];
                            }
                        });
                        if(key != null){
                            if(!data[key].comments) data[key].comments = [];
                            data[key].comments.push(val);
                        }
                    }
                }
            }

            return data;
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
            AjaxService.send('get', 'api/json/0/employees/'+ id).success(function(r){
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
            AjaxService.send('get', 'api/json/0/captions' + data).success(function(data){
                callback(data);
            }).error(function(){
                if(callback){callback(false);}else{return false;}; 
            });
        }
    });
    
    /**
     * The service of documents
     *
     * @service DocumentsService
     * @method getName {function}
     */
    app.service('DocumentsService', function($http, AjaxService){
        this.getName = function(link, callback){
            AjaxService.send('get', 'api/json/0/captions/$link|' + encodeURIComponent(link)).success(function(data){
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
                entry = link(window._scope);
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
            return encodeURIComponent(text);   
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
            if(_location.getParameter(key)){
                sourceURL = _location.removeParameter(key)
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
        getParameter: function(name, hash, top){
            if(!name){ return; }
            name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
            var regexS = "[\\?&\/]"+name+"[=\/]([^&#]*)",
                regex = new RegExp( regexS ),
                results = regex.exec( (!hash ? (top ? window.top.location.href : location.href) : (top ? window.top.location.hash : location.hash)) );
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
            
            return;
        }
        
        // enable tipsy
        $('*[data-title]').tipsy();
	
	    // enable textarea autosize
	    $('textarea._4aS').autosize();
        
        $('body').on('focus', '.comments-post-form textarea._4aS', function(){
            $(this).closest('.comments-post-form').addClass('form-was-focused'); 
        });
        
        setTimeout(function(){
            // enable input autocomplete
            $('input#inputTopic').autocomplete({url: restBase + 'api/json/0/topics' + (window.topicsDocumentFilter ? '?link=' + window.topicsDocumentFilter : ''), dropdownBtn: '<a class="inputTopicAdd-drop"><i class="fa fa-sort"></i></a>'});
        }, 100);
        
        //remove tipsy {Bug}
        $(".tipsy").remove();
    }
    
    $('html').on('click', '#home_icon_target', function(e){
        e.preventDefault();
        if(window.top.Ext) window.top.Ext.History.add('#!/app!forum');
        window.location.href = Root;
    });
    
    //if(!inIframe()){window.location = 'http://google.com'}
})();
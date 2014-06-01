// # Ghost jQuery Utils

/*global window, document, $ */

(function () {
    "use strict";

    // ## UTILS

    /**
     * Allows to check contents of each element exactly
     * @param {Object} obj
     * @param {*} index
     * @param {*} meta
     * @param {*} stack
     * @returns {boolean}
     */
    $.expr[":"].containsExact = function (obj, index, meta, stack) {
        /*jshint unused:false*/
        return (obj.textContent || obj.innerText || $(obj).text() || "") === meta[3];
    };

    /**
     * Center an element to the window vertically and centrally
     * @returns {*}
     */
    $.fn.center = function (options) {
        var $window = $(window),
            config = $.extend({
                animate        : true,
                successTrigger : 'centered'
            }, options);

        return this.each(function () {
            var $this = $(this);
            $this.css({
                'position': 'absolute'
            });
            if (config.animate) {
                $this.animate({
                    'left': ($window.width() / 2) - $this.outerWidth() / 2 + 'px',
                    'top': ($window.height() / 2) - $this.outerHeight() / 2 + 'px'
                });
            } else {
                $this.css({
                    'left': ($window.width() / 2) - $this.outerWidth() / 2 + 'px',
                    'top': ($window.height() / 2) - $this.outerHeight() / 2 + 'px'
                });
            }
            $(window).trigger(config.successTrigger);
        });
    };

    // ## getTransformProperty
    // This returns the transition duration for an element, good for calling things after a transition has finished.
    // **Original**: [https://gist.github.com/mandelbro/4067903](https://gist.github.com/mandelbro/4067903)
    // **returns:** the elements transition duration
    $.fn.transitionDuration = function () {
        var $this = $(this);

        // check the main transition duration property
        if ($this.css('transition-duration')) {
            return Math.round(parseFloat(this.css('transition-duration')) * 1000);
        }

        // check the vendor transition duration properties
        if (this.css('-webkit-transition-duration')) {
            return Math.round(parseFloat(this.css('-webkit-transition-duration')) * 1000);
        }

        if (this.css('-ms-transition-duration')) {
            return Math.round(parseFloat(this.css('-ms-transition-duration')) * 1000);
        }

        if (this.css('-moz-transition-duration')) {
            return Math.round(parseFloat(this.css('-moz-transition-duration')) * 1000);
        }

        if (this.css('-o-transition-duration')) {
            return Math.round(parseFloat(this.css('-o-transition-duration')) * 1000);
        }

        // if we're here, then no transition duration was found, return 0
        return 0;
    };

    // ## scrollShadow
    // This adds a 'scroll' class to the targeted element when the element is scrolled
    // **target:** The element in which the class is applied. Defaults to scrolled element.
    // **class-name:** The class which is applied.
    // **offset:** How far the user has to scroll before the class is applied.
    $.fn.scrollClass = function (options) {
        var config = $.extend({
                'target'     : '',
                'class-name' : 'scrolling',
                'offset'     : 1
            }, options);

        return this.each(function () {
            var $this = $(this),
                $target = $this;
            if (config.target) {
                $target = $(config.target);
            }
            $this.scroll(function () {
                if ($this.scrollTop() > config.offset) {
                    $target.addClass(config['class-name']);
                } else {
                    $target.removeClass(config['class-name']);
                }
            });
        });
    };

    $.fn.selectText = function () {
        var elem = this[0],
            range,
            selection;
        if (document.body.createTextRange) {
            range = document.body.createTextRange();
            range.moveToElementText(elem);
            range.select();
        } else if (window.getSelection) {
            selection = window.getSelection();
            range = document.createRange();
            range.selectNodeContents(elem);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    };

    /**
     * Set interactions for all menus and overlays
     * This finds all visible 'hideClass' elements and hides them upon clicking away from the element itself.
     * A callback can be defined to customise the results. By default it will hide the element.
     * @param {Function} callback
     */
    $.fn.hideAway = function (callback) {
        var $self = $(this);
        $("body").on('click', function (event) {
            var $target = $(event.target),
                hideClass = $self.selector;
            if (!$target.parents().is(hideClass + ":visible") && !$target.is(hideClass + ":visible")) {
                if (callback) {
                    callback($("body").find(hideClass + ":visible"));
                } else {
                    $("body").find(hideClass + ":visible").fadeOut(150);

                    // Toggle active classes on menu headers
                    $("[data-toggle].active").removeClass("active");
                }
            }
        });

        return this;
    };

    // ## GLOBALS

    $('.overlay').hideAway();

    /**
     * Adds appropriate inflection for pluralizing the singular form of a word when appropriate.
     * This is an overly simplistic implementation that does not handle irregular plurals.
     * @param {Number} count
     * @param {String} singularWord
     * @returns {String}
     */
    $.pluralize = function inflect(count, singularWord) {
        var base = [count, ' ', singularWord];

        return (count === 1) ? base.join('') : base.concat('s').join('');
    };

}());

/*global jQuery, Ghost */
(function ($) {
    "use strict";

    var UploadUi;


    UploadUi = function ($dropzone, settings) {
        var $url = '<div class="js-url"><input class="url js-upload-url" type="url" placeholder="http://"/></div>',
            $cancel = '<a class="image-cancel js-cancel" title="Delete"><span class="hidden">Delete</span></a>',
            $progress =  $('<div />', {
                "class" : "js-upload-progress progress progress-success active",
                "role": "progressbar",
                "aria-valuemin": "0",
                "aria-valuemax": "100"
            }).append($("<div />", {
                "class": "js-upload-progress-bar bar",
                "style": "width:0%"
            }));

        $.extend(this, {
            complete: function (result) {
                var self = this;

                function showImage(width, height) {
                    $dropzone.find('img.js-upload-target').attr({"width": width, "height": height}).css({"display": "block"});
                    $dropzone.find('.fileupload-loading').remove();
                    $dropzone.css({"height": "auto"});
                    $dropzone.delay(250).animate({opacity: 100}, 1000, function () {
                        $('.js-button-accept').prop('disabled', false);
                        self.init();
                    });
                }

                function animateDropzone($img) {
                    $dropzone.animate({opacity: 0}, 250, function () {
                        $dropzone.removeClass('image-uploader').addClass('pre-image-uploader');
                        $dropzone.css({minHeight: 0});
                        self.removeExtras();
                        $dropzone.animate({height: $img.height()}, 250, function () {
                            showImage($img.width(), $img.height());
                        });
                    });
                }

                function preLoadImage() {
                    var $img = $dropzone.find('img.js-upload-target')
                        .attr({'src': '', "width": 'auto', "height": 'auto'});

                    $progress.animate({"opacity": 0}, 250, function () {
                        $dropzone.find('span.media').after('<img class="fileupload-loading"  src="' + Ghost.paths.subdir + '/ghost/img/loadingcat.gif" />');
                        if (!settings.editor) {$progress.find('.fileupload-loading').css({"top": "56px"}); }
                    });
                    $dropzone.trigger("uploadsuccess", [result]);
                    $img.one('load', function () {
                        animateDropzone($img);
                    }).attr('src', result);
                }
                preLoadImage();
            },

            bindFileUpload: function () {
                var self = this;

                $dropzone.find('.js-fileupload').fileupload().fileupload("option", {
                    url: Ghost.paths.subdir + '/ghost/upload/',
                    headers: {
                        'X-CSRF-Token': $("meta[name='csrf-param']").attr('content')
                    },
                    add: function (e, data) {
                        /*jshint unused:false*/
                        $('.js-button-accept').prop('disabled', true);
                        $dropzone.find('.js-fileupload').removeClass('right');
                        $dropzone.find('.js-url').remove();
                        $progress.find('.js-upload-progress-bar').removeClass('fail');
                        $dropzone.trigger('uploadstart', [$dropzone.attr('id')]);
                        $dropzone.find('span.media, div.description, a.image-url, a.image-webcam')
                            .animate({opacity: 0}, 250, function () {
                                $dropzone.find('div.description').hide().css({"opacity": 100});
                                if (settings.progressbar) {
                                    $dropzone.find('div.js-fail').after($progress);
                                    $progress.animate({opacity: 100}, 250);
                                }
                                data.submit();
                            });
                    },
                    dropZone: settings.fileStorage ? $dropzone : null,
                    progressall: function (e, data) {
                        /*jshint unused:false*/
                        var progress = parseInt(data.loaded / data.total * 100, 10);
                        if (!settings.editor) {$progress.find('div.js-progress').css({"position": "absolute", "top": "40px"}); }
                        if (settings.progressbar) {
                            $dropzone.trigger("uploadprogress", [progress, data]);
                            $progress.find('.js-upload-progress-bar').css('width', progress + '%');
                        }
                    },
                    fail: function (e, data) {
                        /*jshint unused:false*/
                        $('.js-button-accept').prop('disabled', false);
                        $dropzone.trigger("uploadfailure", [data.result]);
                        $dropzone.find('.js-upload-progress-bar').addClass('fail');
                        if (data.jqXHR.status === 413) {
                            $dropzone.find('div.js-fail').text("The image you uploaded was larger than the maximum file size your server allows.");
                        } else if (data.jqXHR.status === 415) {
                            $dropzone.find('div.js-fail').text("The image type you uploaded is not supported. Please use .PNG, .JPG, .GIF, .SVG.");
                        } else {
                            $dropzone.find('div.js-fail').text("Something went wrong :(");
                        }
                        $dropzone.find('div.js-fail, button.js-fail').fadeIn(1500);
                        $dropzone.find('button.js-fail').on('click', function () {
                            $dropzone.css({minHeight: 0});
                            $dropzone.find('div.description').show();
                            self.removeExtras();
                            self.init();
                        });
                    },
                    done: function (e, data) {
                        /*jshint unused:false*/
                        self.complete(data.result);
                    }
                });
            },

            buildExtras: function () {
                if (!$dropzone.find('span.media')[0]) {
                    $dropzone.prepend('<span class="media"><span class="hidden">Image Upload</span></span>');
                }
                if (!$dropzone.find('div.description')[0]) {
                    $dropzone.append('<div class="description">Add image</div>');
                }
                if (!$dropzone.find('div.js-fail')[0]) {
                    $dropzone.append('<div class="js-fail failed" style="display: none">Something went wrong :(</div>');
                }
                if (!$dropzone.find('button.js-fail')[0]) {
                    $dropzone.append('<button class="js-fail button-add" style="display: none">Try Again</button>');
                }
                if (!$dropzone.find('a.image-url')[0]) {
                    $dropzone.append('<a class="image-url" title="Add image from URL"><span class="hidden">URL</span></a>');
                }
//                if (!$dropzone.find('a.image-webcam')[0]) {
//                    $dropzone.append('<a class="image-webcam" title="Add image from webcam"><span class="hidden">Webcam</span></a>');
//                }
            },

            removeExtras: function () {
                $dropzone.find('span.media, div.js-upload-progress, a.image-url, a.image-upload, a.image-webcam, div.js-fail, button.js-fail, a.js-cancel').remove();
            },

            initWithDropzone: function () {
                var self = this;
                //This is the start point if no image exists
                $dropzone.find('img.js-upload-target').css({"display": "none"});
                $dropzone.removeClass('pre-image-uploader image-uploader-url').addClass('image-uploader');
                this.removeExtras();
                this.buildExtras();
                this.bindFileUpload();
                if (!settings.fileStorage) {
                    self.initUrl();
                    return;
                }
                $dropzone.find('a.image-url').on('click', function () {
                    self.initUrl();
                });
            },
            initUrl: function () {
                var self = this, val;
                this.removeExtras();
                $dropzone.addClass('image-uploader-url').removeClass('pre-image-uploader');
                $dropzone.find('.js-fileupload').addClass('right');
                if (settings.fileStorage) {
                    $dropzone.append($cancel);
                }
                $dropzone.find('.js-cancel').on('click', function () {
                    $dropzone.find('.js-url').remove();
                    $dropzone.find('.js-fileupload').removeClass('right');
                    self.removeExtras();
                    self.initWithDropzone();
                });

                $dropzone.find('div.description').before($url);

                if (settings.editor) {
                    $dropzone.find('div.js-url').append('<button class="js-button-accept button-save">Save</button>');
                }

                $dropzone.find('.js-button-accept').on('click', function () {
                    val = $dropzone.find('.js-upload-url').val();
                    $dropzone.find('div.description').hide();
                    $dropzone.find('.js-fileupload').removeClass('right');
                    $dropzone.find('.js-url').remove();
                    if (val === "") {
                        $dropzone.trigger("uploadsuccess", 'http://');
                        self.initWithDropzone();
                    } else {
                        self.complete(val);
                    }
                });

                // Only show the toggle icon if there is a dropzone mode to go back to
                if (settings.fileStorage !== false) {
                    $dropzone.append('<a class="image-upload" title="Add image"><span class="hidden">Upload</span></a>');
                }

                $dropzone.find('a.image-upload').on('click', function () {
                    $dropzone.find('.js-url').remove();
                    $dropzone.find('.js-fileupload').removeClass('right');
                    self.initWithDropzone();
                });

            },
            initWithImage: function () {
                var self = this;
                // This is the start point if an image already exists
                $dropzone.removeClass('image-uploader image-uploader-url').addClass('pre-image-uploader');
                $dropzone.find('div.description').hide();
                $dropzone.append($cancel);
                $dropzone.find('.js-cancel').on('click', function () {
                    $dropzone.find('img.js-upload-target').attr({'src': ''});
                    $dropzone.find('div.description').show();
                    $dropzone.delay(2500).animate({opacity: 100}, 1000, function () {
                        self.init();
                    });

                    $dropzone.trigger("uploadsuccess", 'http://');
                    self.initWithDropzone();
                });
            },

            init: function () {
                // First check if field image is defined by checking for js-upload-target class
                if (!$dropzone.find('img.js-upload-target')[0]) {
                    // This ensures there is an image we can hook into to display uploaded image
                    $dropzone.prepend('<img class="js-upload-target" style="display: none"  src="" />');
                }
                $('.js-button-accept').prop('disabled', false);
                if ($dropzone.find('img.js-upload-target').attr('src') === '') {
                    this.initWithDropzone();
                } else {
                    this.initWithImage();
                }
            }
        });
    };


    $.fn.upload = function (options) {
        var settings = $.extend({
            progressbar: true,
            editor: false,
            fileStorage: true
        }, options);
        return this.each(function () {
            var $dropzone = $(this),
                ui;

            ui = new UploadUi($dropzone, settings);
            ui.init();
        });
    };
}(jQuery));

/* jshint node:true, browser:true */

// Ghost Image Preview
//
// Manages the conversion of image markdown `![]()` from markdown into the HTML image preview
// This provides a dropzone and other interface elements for adding images
// Is only used in the admin client.


var Ghost = Ghost || {};
(function () {
    var ghostimagepreview = function () {
        return [
            // ![] image syntax
            {
                type: 'lang',
                filter: function (text) {
                    var imageMarkdownRegex = /^(?:\{<(.*?)>\})?!(?:\[([^\n\]]*)\])(?:\(([^\n\]]*)\))?$/gim,
                        /* regex from isURL in node-validator. Yum! */
                        uriRegex = /^(?!mailto:)(?:(?:https?|ftp):\/\/)?(?:\S+(?::\S*)?@)?(?:(?:(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[0-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))|localhost)(?::\d{2,5})?(?:\/[^\s]*)?$/i,
                        pathRegex = /^(\/)?([^\/\0]+(\/)?)+$/i;

                    return text.replace(imageMarkdownRegex, function (match, key, alt, src) {
                        var result = '',
                            output;

                        if (src && (src.match(uriRegex) || src.match(pathRegex))) {
                            result = '<img class="js-upload-target" src="' + src + '"/>';
                        }

                        if (Ghost && Ghost.touchEditor) {
                            output = '<section class="image-uploader">' +
                                result + '<div class="description">Mobile uploads coming soon</div></section>';
                        } else {
                            output = '<section id="image_upload_' + key + '" class="js-drop-zone image-uploader">' +
                                result + '<div class="description">Add image of <strong>' + alt + '</strong></div>' +
                                '<input data-url="upload" class="js-fileupload main fileupload" type="file" name="uploadimage">' +
                                '</section>';
                        }

                        return output;
                    });
                }
            }
        ];
    };

    // Client-side export
    if (typeof window !== 'undefined' && window.Showdown && window.Showdown.extensions) {
        window.Showdown.extensions.ghostimagepreview = ghostimagepreview;
    }
    // Server-side export
    if (typeof module !== 'undefined') {
        module.exports = ghostimagepreview;
    }
}());

/* jshint node:true, browser:true */

// Ghost GFM
// Taken and extended from the Showdown Github Extension (WIP)
// Makes a number of pre and post-processing changes to the way markdown is handled
//
//  ~~strike-through~~   ->  <del>strike-through</del> (Pre)
//  GFM newlines & underscores (Pre)
//  4 or more underscores (Pre)
//  autolinking / custom image handling (Post)

(function () {
    var ghostgfm = function () {
        return [
            {
                // strike-through
                // NOTE: showdown already replaced "~" with "~T", so we need to adjust accordingly.
                type    : 'lang',
                regex   : '(~T){2}([^~]+)(~T){2}',
                replace : function (match, prefix, content, suffix) {
                    return '<del>' + content + '</del>';
                }
            },
            {
                // GFM newline and underscore modifications, happen BEFORE showdown
                type    : 'lang',
                filter  : function (text) {
                    var extractions = {},
                        imageMarkdownRegex = /^(?:\{(.*?)\})?!(?:\[([^\n\]]*)\])(?:\(([^\n\]]*)\))?$/gim,
                        hashID = 0;

                    function hashId() {
                        return hashID++;
                    }

                    // Extract pre blocks
                    text = text.replace(/<pre>[\s\S]*?<\/pre>/gim, function (x) {
                        var hash = hashId();
                        extractions[hash] = x;
                        return "{gfm-js-extract-pre-" + hash + "}";
                    }, 'm');

                    // Extract code blocks
                    text = text.replace(/```[\s\S]*```/gim, function (x) {
                        var hash = hashId();
                        extractions[hash] = x;
                        return "{gfm-js-extract-code-" + hash + "}";
                    }, 'm');


                    //prevent foo_bar and foo_bar_baz from ending up with an italic word in the middle
                    text = text.replace(/(^(?! {4}|\t)(?!__)\w+_\w+_\w[\w_]*)/gm, function (x) {
                        return x.replace(/_/gm, '\\_');
                    });

                    text = text.replace(/\{gfm-js-extract-code-([0-9]+)\}/gm, function (x, y) {
                        return extractions[y];
                    });

                    // in very clear cases, let newlines become <br /> tags
                    text = text.replace(/^[\w\<\"\'][^\n]*\n+/gm, function (x) {
                        return x.match(/\n{2}/) ? x : x.trim() + "  \n";
                    });

                    // better URL support, but no title support
                    text = text.replace(imageMarkdownRegex, function (match, key, alt, src) {
                        if (src) {
                            return '<img src="' + src + '" alt="' + alt + '" />';
                        }

                        return '';
                    });

                    text = text.replace(/\{gfm-js-extract-pre-([0-9]+)\}/gm, function (x, y) {
                        return "\n\n" + extractions[y];
                    });


                    return text;
                }
            },

            // 4 or more inline underscores e.g. Ghost rocks my _____!
            {
                type: 'lang',
                filter: function (text) {
                    return text.replace(/([^_\n\r])(_{4,})/g, function (match, prefix, underscores) {
                        return prefix + underscores.replace(/_/g, '&#95;');
                    });
                }
            },

            {
                // GFM autolinking & custom image handling, happens AFTER showdown
                type    : 'html',
                filter  : function (text) {
                    var refExtractions = {},
                        preExtractions = {},
                        hashID = 0;

                    function hashId() {
                        return hashID++;
                    }

                    // Extract pre blocks
                    text = text.replace(/<(pre|code)>[\s\S]*?<\/(\1)>/gim, function (x) {
                        var hash = hashId();
                        preExtractions[hash] = x;
                        return "{gfm-js-extract-pre-" + hash + "}";
                    }, 'm');

                    // filter out def urls
                    // from Marked https://github.com/chjj/marked/blob/master/lib/marked.js#L24
                    text = text.replace(/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/gmi,
                        function (x) {
                            var hash = hashId();
                            refExtractions[hash] = x;
                            return "{gfm-js-extract-ref-url-" + hash + "}";
                        });

                    // match a URL
                    // adapted from https://gist.github.com/jorilallo/1283095#L158
                    // and http://blog.stevenlevithan.com/archives/mimic-lookbehind-javascript
                    text = text.replace(/(\]\(|\]|\[|<a[^\>]*?\>)?https?\:\/\/[^"\s\<\>]*[^.,;'">\:\s\<\>\)\]\!]/gmi,
                        function (wholeMatch, lookBehind, matchIndex) {
                            // Check we are not inside an HTML tag
                            var left = text.slice(0, matchIndex), right = text.slice(matchIndex);
                            if ((left.match(/<[^>]+$/) && right.match(/^[^>]*>/)) || lookBehind) {
                                return wholeMatch;
                            }
                            // If we have a matching lookBehind, this is a failure, else wrap the match in <a> tag
                            return lookBehind ? wholeMatch : "<a href='" + wholeMatch + "'>" + wholeMatch + "</a>";
                        });

                    // replace extractions
                    text = text.replace(/\{gfm-js-extract-pre-([0-9]+)\}/gm, function (x, y) {
                        return preExtractions[y];
                    });

                    text = text.replace(/\{gfm-js-extract-ref-url-([0-9]+)\}/gi, function (x, y) {
                        return "\n\n" + refExtractions[y];
                    });

                    return text;
                }
            }
        ];
    };

    // Client-side export
    if (typeof window !== 'undefined' && window.Showdown && window.Showdown.extensions) {
        window.Showdown.extensions.ghostgfm = ghostgfm;
    }
    // Server-side export
    if (typeof module !== 'undefined') {
        module.exports = ghostgfm;
    }
}());

/**
 * http://www.openjs.com/scripts/events/keyboard_shortcuts/
 * Version : 2.01.B
 * By Binny V A
 * License : BSD
 */
shortcut = {
    'all_shortcuts':{},//All the shortcuts are stored in this array
    'add': function(shortcut_combination,callback,opt) {
        //Provide a set of default options
        var default_options = {
            'type':'keydown',
            'propagate':false,
            'disable_in_input':false,
            'target':document,
            'keycode':false
        }
        if(!opt) opt = default_options;
        else {
            for(var dfo in default_options) {
                if(typeof opt[dfo] == 'undefined') opt[dfo] = default_options[dfo];
            }
        }

        var ele = opt.target;
        if(typeof opt.target == 'string') ele = document.getElementById(opt.target);
        var ths = this;
        shortcut_combination = shortcut_combination.toLowerCase();

        //The function to be called at keypress
        var func = function(e) {
            e = e || window.event;
            
            if(opt['disable_in_input']) { //Don't enable shortcut keys in Input, Textarea fields
                var element;
                if(e.target) element=e.target;
                else if(e.srcElement) element=e.srcElement;
                if(element.nodeType==3) element=element.parentNode;

                if(element.tagName == 'INPUT' || element.tagName == 'TEXTAREA') return;
            }
    
            //Find Which key is pressed
            if (e.keyCode) code = e.keyCode;
            else if (e.which) code = e.which;
            else return;
            var character = String.fromCharCode(code).toLowerCase();
            
            if(code == 188) character=","; //If the user presses , when the type is onkeydown
            if(code == 190) character="."; //If the user presses , when the type is onkeydown

            var keys = shortcut_combination.split("+");
            //Key Pressed - counts the number of valid keypresses - if it is same as the number of keys, the shortcut function is invoked
            var kp = 0;
            
            //Work around for stupid Shift key bug created by using lowercase - as a result the shift+num combination was broken
            var shift_nums = {
                "`":"~",
                "1":"!",
                "2":"@",
                "3":"#",
                "4":"$",
                "5":"%",
                "6":"^",
                "7":"&",
                "8":"*",
                "9":"(",
                "0":")",
                "-":"_",
                "=":"+",
                ";":":",
                "'":"\"",
                ",":"<",
                ".":">",
                "/":"?",
                "\\":"|"
            }
            //Special Keys - and their codes
            var special_keys = {
                'esc':27,
                'escape':27,
                'tab':9,
                'space':32,
                'return':13,
                'enter':13,
                'backspace':8,
    
                'scrolllock':145,
                'scroll_lock':145,
                'scroll':145,
                'capslock':20,
                'caps_lock':20,
                'caps':20,
                'numlock':144,
                'num_lock':144,
                'num':144,
                
                'pause':19,
                'break':19,
                
                'insert':45,
                'home':36,
                'delete':46,
                'end':35,
                
                'pageup':33,
                'page_up':33,
                'pu':33,
    
                'pagedown':34,
                'page_down':34,
                'pd':34,
    
                'left':37,
                'up':38,
                'right':39,
                'down':40,
    
                'f1':112,
                'f2':113,
                'f3':114,
                'f4':115,
                'f5':116,
                'f6':117,
                'f7':118,
                'f8':119,
                'f9':120,
                'f10':121,
                'f11':122,
                'f12':123
            }
    
            var modifiers = { 
                shift: { wanted:false, pressed:false},
                ctrl : { wanted:false, pressed:false},
                alt  : { wanted:false, pressed:false},
                meta : { wanted:false, pressed:false}   //Meta is Mac specific
            };
                        
            if(e.ctrlKey)   modifiers.ctrl.pressed = true;
            if(e.shiftKey)  modifiers.shift.pressed = true;
            if(e.altKey)    modifiers.alt.pressed = true;
            if(e.metaKey)   modifiers.meta.pressed = true;
                        
            for(var i=0; k=keys[i],i<keys.length; i++) {
                //Modifiers
                if(k == 'ctrl' || k == 'control') {
                    kp++;
                    modifiers.ctrl.wanted = true;

                } else if(k == 'shift') {
                    kp++;
                    modifiers.shift.wanted = true;

                } else if(k == 'alt') {
                    kp++;
                    modifiers.alt.wanted = true;
                } else if(k == 'meta') {
                    kp++;
                    modifiers.meta.wanted = true;
                } else if(k.length > 1) { //If it is a special key
                    if(special_keys[k] == code) kp++;
                    
                } else if(opt['keycode']) {
                    if(opt['keycode'] == code) kp++;

                } else { //The special keys did not match
                    if(character == k) kp++;
                    else {
                        if(shift_nums[character] && e.shiftKey) { //Stupid Shift key bug created by using lowercase
                            character = shift_nums[character]; 
                            if(character == k) kp++;
                        }
                    }
                }
            }
            
            if(kp == keys.length && 
                        modifiers.ctrl.pressed == modifiers.ctrl.wanted &&
                        modifiers.shift.pressed == modifiers.shift.wanted &&
                        modifiers.alt.pressed == modifiers.alt.wanted &&
                        modifiers.meta.pressed == modifiers.meta.wanted) {
                callback(e);
    
                if(!opt['propagate']) { //Stop the event
                    //e.cancelBubble is supported by IE - this will kill the bubbling process.
                    e.cancelBubble = true;
                    e.returnValue = false;
    
                    //e.stopPropagation works in Firefox.
                    if (e.stopPropagation) {
                        e.stopPropagation();
                        e.preventDefault();
                    }
                    return false;
                }
            }
        }
        this.all_shortcuts[shortcut_combination] = {
            'callback':func, 
            'target':ele, 
            'event': opt['type']
        };
        //Attach the function with the event
        if(ele.addEventListener) ele.addEventListener(opt['type'], func, false);
        else if(ele.attachEvent) ele.attachEvent('on'+opt['type'], func);
        else ele['on'+opt['type']] = func;
    },

    //Remove the shortcut - just specify the shortcut and I will remove the binding
    'remove':function(shortcut_combination) {
        shortcut_combination = shortcut_combination.toLowerCase();
        var binding = this.all_shortcuts[shortcut_combination];
        delete(this.all_shortcuts[shortcut_combination])
        if(!binding) return;
        var type = binding['event'];
        var ele = binding['target'];
        var callback = binding['callback'];

        if(ele.detachEvent) ele.detachEvent('on'+type, callback);
        else if(ele.removeEventListener) ele.removeEventListener(type, callback, false);
        else ele['on'+type] = false;
    }
};

/*
 * To Title Case 2.0.1 – http://individed.com/code/to-title-case/
 * Copyright © 2008–2012 David Gouch. Licensed under the MIT License.
 */

String.prototype.toTitleCase = function () {
    var smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|of|on|or|the|to|vs?\.?|via)$/i;

    return this.replace(/([^\W_]+[^\s-]*) */g, function (match, p1, index, title) {
        if (index > 0 && index + p1.length !== title.length &&
            p1.search(smallWords) > -1 && title.charAt(index - 2) !== ":" &&
            title.charAt(index - 1).search(/[^\s-]/) < 0) {
            return match.toLowerCase();
        }

        if (p1.substr(1).search(/[A-Z]|\../) > -1) {
            return match;
        }

        return match.charAt(0).toUpperCase() + match.substr(1);
    });
};
/*globals window, $, _, Backbone, validator */
(function () {
    'use strict';

    function ghostPaths() {
        var path = window.location.pathname,
            subdir = path.substr(0, path.search('/ghost/'));

        return {
            subdir: subdir,
            apiRoot: subdir + '/ghost/api/v0.1'
        };
    }

    var Ghost = {
        Layout      : {},
        Views       : {},
        Collections : {},
        Models      : {},

        paths: ghostPaths(),

        // This is a helper object to denote legacy things in the
        // middle of being transitioned.
        temporary: {},

        currentView: null,
        router: null
    };

    _.extend(Ghost, Backbone.Events);

    Backbone.oldsync = Backbone.sync;
    // override original sync method to make header request contain csrf token
    Backbone.sync = function (method, model, options, error) {
        options.beforeSend = function (xhr) {
            xhr.setRequestHeader('X-CSRF-Token', $("meta[name='csrf-param']").attr('content'));
        };
        /* call the old sync method */
        return Backbone.oldsync(method, model, options, error);
    };

    Backbone.oldModelProtoUrl = Backbone.Model.prototype.url;
    //overwrite original url method to add slash to end of the url if needed.
    Backbone.Model.prototype.url = function () {
        var url = Backbone.oldModelProtoUrl.apply(this, arguments);
        return url + (url.charAt(url.length - 1) === '/' ? '' : '/');
    };

    Ghost.init = function () {
        Ghost.router = new Ghost.Router();

        // This is needed so Backbone recognizes elements already rendered server side
        // as valid views, and events are bound
        Ghost.notifications = new Ghost.Views.NotificationCollection({model: []});

        Backbone.history.start({
            pushState: true,
            hashChange: false,
            root: Ghost.paths.subdir + '/ghost'
        });
    };

    validator.handleErrors = function (errors) {
        Ghost.notifications.clearEverything();
        _.each(errors, function (errorObj) {

            Ghost.notifications.addItem({
                type: 'error',
                message: errorObj.message || errorObj,
                status: 'passive'
            });

            if (errorObj.hasOwnProperty('el')) {
                errorObj.el.addClass('input-error');
            }
        });
    };

    window.Ghost = Ghost;

    window.addEventListener("load", Ghost.init, false);
}());

// # Ghost Mobile Interactions

/*global window, document, $, FastClick */

(function () {
    'use strict';

    FastClick.attach(document.body);

    // ### general wrapper to handle conditional screen size actions
    function responsiveAction(event, mediaCondition, cb) {
        if (!window.matchMedia(mediaCondition).matches) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        cb();
    }

    // ### Show content preview when swiping left on content list
    $('.manage').on('click', '.content-list ol li', function (event) {
        responsiveAction(event, '(max-width: 800px)', function () {
            $('.content-list').animate({right: '100%', left: '-100%', 'margin-right': '15px'}, 300);
            $('.content-preview').animate({right: '0', left: '0', 'margin-left': '0'}, 300);
        });
    });

    // ### Hide content preview
    $('.manage').on('click', '.content-preview .button-back', function (event) {
        responsiveAction(event, '(max-width: 800px)', function () {
            $('.content-list').animate({right: '0', left: '0', 'margin-right': '0'}, 300);
            $('.content-preview').animate({right: '-100%', left: '100%', 'margin-left': '15px'}, 300);
        });
    });

    // ### Show settings options page when swiping left on settings menu link
    $('.settings').on('click', '.settings-menu li', function (event) {
        responsiveAction(event, '(max-width: 800px)', function () {
            $('.settings-sidebar').animate({right: '100%', left: '-102%', 'margin-right': '15px'}, 300);
            $('.settings-content').animate({right: '0', left: '0', 'margin-left': '0'}, 300);
            $('.settings-content .button-back, .settings-content .button-save').css('display', 'inline-block');
        });
    });

    // ### Hide settings options page
    $('.settings').on('click', '.settings-content .button-back', function (event) {
        responsiveAction(event, '(max-width: 800px)', function () {
            $('.settings-sidebar').animate({right: '0', left: '0', 'margin-right': '0'}, 300);
            $('.settings-content').animate({right: '-100%', left: '100%', 'margin-left': '15'}, 300);
            $('.settings-content .button-back, .settings-content .button-save').css('display', 'none');
        });
    });

    // ### Toggle the sidebar menu
    $('[data-off-canvas]').on('click', function (event) {
        responsiveAction(event, '(max-width: 650px)', function () {
            $('body').toggleClass('off-canvas');
        });
    });

}());

// # Toggle Support

/*global document, $, Ghost */
(function () {
    'use strict';

    Ghost.temporary.hideToggles = function () {
        $('[data-toggle]').each(function () {
            var toggle = $(this).data('toggle');
            $(this).parent().children(toggle + ':visible').fadeOut(150);
        });

        // Toggle active classes on menu headers
        $('[data-toggle].active').removeClass('active');
    };

    Ghost.temporary.initToggles = function ($el) {

        $el.find('[data-toggle]').each(function () {
            var toggle = $(this).data('toggle');
            $(this).parent().children(toggle).hide();
        });

        $el.find('[data-toggle]').on('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            var $this = $(this),
                toggle = $this.data('toggle'),
                isAlreadyActive = $this.is('.active');

            // Close all the other open toggle menus
            Ghost.temporary.hideToggles();

            if (!isAlreadyActive) {
                $this.toggleClass('active');
                $(this).parent().children(toggle).toggleClass('open').fadeToggle(150);
            }
        });

    };


    $(document).ready(function () {

        // ## Toggle Up In Your Grill
        // Allows for toggling via data-attributes.
        // ### Usage
        //       <nav>
        //         <a href="#" data-toggle=".toggle-me">Toggle</a>
        //         <ul class="toggle-me">
        //            <li>Toggled yo</li>
        //         </ul>
        //       </nav>
        Ghost.temporary.initToggles($(document));
    });

}());

// # Surrounds given text with Markdown syntax

/*global $, CodeMirror, Showdown, moment */
(function () {
    'use strict';
    var Markdown = {
        init : function (options, elem) {
            var self = this;
            self.elem = elem;

            self.style = (typeof options === 'string') ? options : options.style;

            self.options = $.extend({}, CodeMirror.prototype.addMarkdown.options, options);

            self.replace();
        },
        replace: function () {
            var text = this.elem.getSelection(), pass = true, cursor = this.elem.getCursor(), line = this.elem.getLine(cursor.line), md, word, letterCount, converter, textIndex, position;
            switch (this.style) {
            case 'h1':
                this.elem.setLine(cursor.line, '# ' + line);
                this.elem.setCursor(cursor.line, cursor.ch + 2);
                pass = false;
                break;
            case 'h2':
                this.elem.setLine(cursor.line, '## ' + line);
                this.elem.setCursor(cursor.line, cursor.ch + 3);
                pass = false;
                break;
            case 'h3':
                this.elem.setLine(cursor.line, '### ' + line);
                this.elem.setCursor(cursor.line, cursor.ch + 4);
                pass = false;
                break;
            case 'h4':
                this.elem.setLine(cursor.line, '#### ' + line);
                this.elem.setCursor(cursor.line, cursor.ch + 5);
                pass = false;
                break;
            case 'h5':
                this.elem.setLine(cursor.line, '##### ' + line);
                this.elem.setCursor(cursor.line, cursor.ch + 6);
                pass = false;
                break;
            case 'h6':
                this.elem.setLine(cursor.line, '###### ' + line);
                this.elem.setCursor(cursor.line, cursor.ch + 7);
                pass = false;
                break;
            case 'link':
                md = this.options.syntax.link.replace('$1', text);
                this.elem.replaceSelection(md, 'end');
                if (!text) {
                    this.elem.setCursor(cursor.line, cursor.ch + 1);
                } else {
                    textIndex = line.indexOf(text, cursor.ch - text.length);
                    position = textIndex + md.length - 1;
                    this.elem.setSelection({line: cursor.line, ch: position - 7}, {line: cursor.line, ch: position});
                }
                pass = false;
                break;
            case 'image':
                md = this.options.syntax.image.replace('$1', text);
                if (line !== '') {
                    md = "\n\n" + md;
                }
                this.elem.replaceSelection(md, "end");
                cursor = this.elem.getCursor();
                this.elem.setSelection({line: cursor.line, ch: cursor.ch - 8}, {line: cursor.line, ch: cursor.ch - 1});
                pass = false;
                break;
            case 'uppercase':
                md = text.toLocaleUpperCase();
                break;
            case 'lowercase':
                md = text.toLocaleLowerCase();
                break;
            case 'titlecase':
                md = text.toTitleCase();
                break;
            case 'selectword':
                word = this.elem.getTokenAt(cursor);
                if (!/\w$/g.test(word.string)) {
                    this.elem.setSelection({line: cursor.line, ch: word.start}, {line: cursor.line, ch: word.end - 1});
                } else {
                    this.elem.setSelection({line: cursor.line, ch: word.start}, {line: cursor.line, ch: word.end});
                }
                break;
            case 'copyHTML':
                converter = new Showdown.converter();
                if (text) {
                    md = converter.makeHtml(text);
                } else {
                    md = converter.makeHtml(this.elem.getValue());
                }

                $(".modal-copyToHTML-content").text(md).selectText();
                pass = false;
                break;
            case 'list':
                md = text.replace(/^(\s*)(\w\W*)/gm, '$1* $2');
                this.elem.replaceSelection(md, 'end');
                pass = false;
                break;
            case 'currentDate':
                md = moment(new Date()).format('D MMMM YYYY');
                this.elem.replaceSelection(md, 'end');
                pass = false;
                break;
            case 'newLine':
                if (line !== "") {
                    this.elem.setLine(cursor.line, line + "\n\n");
                }
                pass = false;
                break;
            default:
                if (this.options.syntax[this.style]) {
                    md = this.options.syntax[this.style].replace('$1', text);
                }
            }
            if (pass && md) {
                this.elem.replaceSelection(md, 'end');
                if (!text) {
                    letterCount = md.length;
                    this.elem.setCursor({line: cursor.line, ch: cursor.ch - (letterCount / 2)});
                }
            }
        }
    };

    CodeMirror.prototype.addMarkdown = function (options) {
        var markdown = Object.create(Markdown);
        markdown.init(options, this);
    };

    CodeMirror.prototype.addMarkdown.options = {
        style: null,
        syntax: {
            bold: '**$1**',
            italic: '*$1*',
            strike: '~~$1~~',
            code: '`$1`',
            link: '[$1](http://)',
            image: '![$1](http://)',
            blockquote: '> $1'
        }
    };

}());

/*globals Handlebars, moment, Ghost */
(function () {
    'use strict';
    Handlebars.registerHelper('date', function (context, options) {
        if (!options && context.hasOwnProperty('hash')) {
            options = context;
            context = undefined;

            // set to published_at by default, if it's available
            // otherwise, this will print the current date
            if (this.published_at) {
                context = this.published_at;
            }
        }

        // ensure that context is undefined, not null, as that can cause errors
        context = context === null ? undefined : context;

        var f = options.hash.format || 'MMM Do, YYYY',
            timeago = options.hash.timeago,
            date;


        if (timeago) {
            date = moment(context).fromNow();
        } else {
            date = moment(context).format(f);
        }
        return date;
    });

    Handlebars.registerHelper('admin_url', function () {
        return Ghost.paths.subdir + '/ghost';
    });

    Handlebars.registerHelper('asset', function (context, options) {
        var output = '',
            isAdmin = options && options.hash && options.hash.ghost;

        output += Ghost.paths.subdir + '/';

        if (!context.match(/^shared/)) {
            if (isAdmin) {
                output += 'ghost/';
            } else {
                output += 'assets/';
            }
        }

        output += context;
        return new Handlebars.SafeString(output);
    });
}());

// # Ghost Editor
//
// Ghost Editor contains a set of modules which make up the editor component
// It manages the left and right panes, and all of the communication between them
// Including scrolling,

/*global document, $, _, Ghost */
(function () {
    'use strict';

    var Editor = function () {
        var self = this,
            $document = $(document),
        // Create all the needed editor components, passing them what they need to function
            markdown = new Ghost.Editor.MarkdownEditor(),
            uploadMgr = new Ghost.Editor.UploadManager(markdown),
            preview = new Ghost.Editor.HTMLPreview(markdown, uploadMgr),
            scrollHandler = new Ghost.Editor.ScrollHandler(markdown, preview),
            unloadDirtyMessage,
            handleChange,
            handleDrag;

        unloadDirtyMessage = function () {
            return '==============================\n\n' +
                'Hey there! It looks like you\'re in the middle of writing' +
                ' something and you haven\'t saved all of your content.' +
                '\n\nSave before you go!\n\n' +
                '==============================';
        };

        handleChange = function () {
            self.setDirty(true);
            preview.update();
        };

        handleDrag = function (e) {
            e.preventDefault();
        };

        // Public API
        _.extend(this, {
            enable: function () {
                // Listen for changes
                $document.on('markdownEditorChange', handleChange);

                // enable editing and scrolling
                markdown.enable();
                scrollHandler.enable();
            },

            disable: function () {
                // Don't listen for changes
                $document.off('markdownEditorChange', handleChange);

                // disable editing and scrolling
                markdown.disable();
                scrollHandler.disable();
            },

            // Get the markdown value from the editor for saving
            // Upload manager makes sure the upload markers are removed beforehand
            value: function () {
                return uploadMgr.value();
            },

            setDirty: function (dirty) {
                window.onbeforeunload = dirty ? unloadDirtyMessage : null;
            }
        });

         // Initialise
        $document.on('drop dragover', handleDrag);
        preview.update();
        this.enable();
    };

    Ghost.Editor = Ghost.Editor || {};
    Ghost.Editor.Main = Editor;
}());
// # Ghost Editor Marker Manager
//
// MarkerManager looks after the array of markers which are attached to image markdown in the editor.
//
// Marker Manager is told by the Upload Manager to add a marker to a line.
// A marker takes the form of a 'magic id' which looks like:
// {<1>}
// It is appended to the start of the given line, and then defined as a CodeMirror 'TextMarker' widget which is
// subsequently added to an array of markers to keep track of all markers in the editor.
// The TextMarker is also set to 'collapsed' mode which means it does not show up in the display.
// Currently, the markers can be seen if you copy and paste your content out of Ghost into a text editor.
// The markers are stripped on save so should not appear in the DB


/*global _, Ghost */

(function () {
    'use strict';

    var imageMarkdownRegex = /^(?:\{<(.*?)>\})?!(?:\[([^\n\]]*)\])(?:\(([^\n\]]*)\))?$/gim,
        markerRegex = /\{<([\w\W]*?)>\}/,
        MarkerManager;

    MarkerManager = function (editor) {
        var markers = {},
            uploadPrefix = 'image_upload',
            uploadId = 1,
            addMarker,
            removeMarker,
            markerRegexForId,
            stripMarkerFromLine,
            findAndStripMarker,
            checkMarkers,
            initMarkers;

        // the regex
        markerRegexForId = function (id) {
            id = id.replace('image_upload_', '');
            return new RegExp('\\{<' + id + '>\\}', 'gmi');
        };

        // Add a marker to the given line
        // Params:
        // line - CodeMirror LineHandle
        // ln - line number
        addMarker = function (line, ln) {
            var marker,
                magicId = '{<' + uploadId + '>}',
                newText = magicId + line.text;

            editor.replaceRange(
                newText,
                {line: ln, ch: 0},
                {line: ln, ch: newText.length}
            );

            marker = editor.markText(
                {line: ln, ch: 0},
                {line: ln, ch: (magicId.length)},
                {collapsed: true}
            );

            markers[uploadPrefix + '_' + uploadId] = marker;
            uploadId += 1;
        };

        // Remove a marker
        // Will be passed a LineHandle if we already know which line the marker is on
        removeMarker = function (id, marker, line) {
            delete markers[id];
            marker.clear();

            if (line) {
                stripMarkerFromLine(line);
            } else {
                findAndStripMarker(id);
            }
        };

        // Removes the marker on the given line if there is one
        stripMarkerFromLine = function (line) {
            var markerText = line.text.match(markerRegex),
                ln = editor.getLineNumber(line);

            if (markerText) {
                editor.replaceRange(
                    '',
                    {line: ln, ch: markerText.index},
                    {line: ln, ch: markerText.index + markerText[0].length}
                );
            }
        };

        // Find a marker in the editor by id & remove it
        // Goes line by line to find the marker by it's text if we've lost track of the TextMarker
        findAndStripMarker = function (id) {
            editor.eachLine(function (line) {
                var markerText = markerRegexForId(id).exec(line.text),
                    ln;

                if (markerText) {
                    ln = editor.getLineNumber(line);
                    editor.replaceRange(
                        '',
                        {line: ln, ch: markerText.index},
                        {line: ln, ch: markerText.index + markerText[0].length}
                    );
                }
            });
        };

        // Check each marker to see if it is still present in the editor and if it still corresponds to image markdown
        // If it is no longer a valid image, remove it
        checkMarkers = function () {
            _.each(markers, function (marker, id) {
                var line;
                marker = markers[id];
                if (marker.find()) {
                    line = editor.getLineHandle(marker.find().from.line);
                    if (!line.text.match(imageMarkdownRegex)) {
                        removeMarker(id, marker, line);
                    }
                } else {
                    removeMarker(id, marker);
                }
            });
        };

        // Add markers to the line if it needs one
        initMarkers = function (line) {
            var isImage = line.text.match(imageMarkdownRegex),
                hasMarker = line.text.match(markerRegex);

            if (isImage && !hasMarker) {
                addMarker(line, editor.getLineNumber(line));
            }
        };

        // Initialise
        editor.eachLine(initMarkers);

        // Public API
        _.extend(this, {
            markers: markers,
            checkMarkers: checkMarkers,
            addMarker: addMarker,
            stripMarkerFromLine: stripMarkerFromLine,
            getMarkerRegexForId: markerRegexForId
        });
    };

    Ghost.Editor = Ghost.Editor || {};
    Ghost.Editor.MarkerManager = MarkerManager;
}());
// # Ghost Editor Upload Manager
//
// UploadManager ensures that markdown gets updated when images get uploaded via the Preview.
//
// The Ghost Editor has a particularly tricky problem to solve, in that it is possible to upload an image by
// interacting with the preview. The process of uploading an image is handled by uploader.js, but there is still
// a lot of work needed to ensure that uploaded files end up in the right place - that is that the image
// path gets added to the correct piece of markdown in the editor.
//
// To solve this, Ghost adds a unique 'marker' to each piece of markdown which represents an image:
// More detail about how the markers work can be find in markerManager.js
//
// UploadManager handles changes in the editor, looking for text which matches image markdown, and telling the marker
// manager to add a marker. It also checks changed lines to see if they have a marker but are no longer an image.
//
// UploadManager's most important job is handling uploads such that when a successful upload completes, the correct
// piece of image markdown is updated with the path.
// This is done in part by ghostImagePreview.js, which takes the marker from the markdown and uses it to create an ID
// on the dropzone. When an upload completes successfully from uploader.js, the event thrown contains reference to the
// dropzone, from which uploadManager can pull the ID & then get the right marker from the Marker Manager.
//
// Without a doubt, the separation of concerns between the uploadManager, and the markerManager could be vastly
// improved


/*global $, _, Ghost */
(function () {
    'use strict';

    var imageMarkdownRegex = /^(?:\{<(.*?)>\})?!(?:\[([^\n\]]*)\])(?:\(([^\n\]]*)\))?$/gim,
        markerRegex = /\{<([\w\W]*?)>\}/,
        UploadManager;

    UploadManager = function (markdown) {
        var editor = markdown.codemirror,
            markerMgr = new Ghost.Editor.MarkerManager(editor),
            findLine,
            checkLine,
            value,
            handleUpload,
            handleChange;

        // Find the line with the marker which matches
        findLine = function (result_id) {
            // try to find the right line to replace
            if (markerMgr.markers.hasOwnProperty(result_id) && markerMgr.markers[result_id].find()) {
                return editor.getLineHandle(markerMgr.markers[result_id].find().from.line);
            }

            return false;
        };

        // Check the given line to see if it has an image, and if it correctly has a marker
        // In the special case of lines which were just pasted in, any markers are removed to prevent duplication
        checkLine = function (ln, mode) {
            var line = editor.getLineHandle(ln),
                isImage = line.text.match(imageMarkdownRegex),
                hasMarker;

            // We care if it is an image
            if (isImage) {
                hasMarker = line.text.match(markerRegex);

                if (hasMarker && (mode === 'paste' || mode === 'undo')) {
                    // this could be a duplicate, and won't be a real marker
                    markerMgr.stripMarkerFromLine(line);
                }

                if (!hasMarker) {
                    markerMgr.addMarker(line, ln);
                }
            }
            // TODO: hasMarker but no image?
        };

        // Get the markdown with all the markers stripped
        value = function () {
            var value = editor.getValue();

            _.each(markerMgr.markers, function (marker, id) {
                /*jshint unused:false*/
                value = value.replace(markerMgr.getMarkerRegexForId(id), '');
            });

            return value;
        };

        // Match the uploaded file to a line in the editor, and update that line with a path reference
        // ensuring that everything ends up in the correct place and format.
        handleUpload = function (e, result_src) {
            var line = findLine($(e.currentTarget).attr('id')),
                lineNumber = editor.getLineNumber(line),
                match = line.text.match(/\([^\n]*\)?/),
                replacement = '(http://)';

            if (match) {
                // simple case, we have the parenthesis
                editor.setSelection(
                    {line: lineNumber, ch: match.index + 1},
                    {line: lineNumber, ch: match.index + match[0].length - 1}
                );
            } else {
                match = line.text.match(/\]/);
                if (match) {
                    editor.replaceRange(
                        replacement,
                        {line: lineNumber, ch: match.index + 1},
                        {line: lineNumber, ch: match.index + 1}
                    );
                    editor.setSelection(
                        {line: lineNumber, ch: match.index + 2},
                        {line: lineNumber, ch: match.index + replacement.length }
                    );
                }
            }
            editor.replaceSelection(result_src);
        };

        // Change events from CodeMirror tell us which lines have changed.
        // Each changed line is then checked to see if a marker needs to be added or removed
        handleChange = function (cm, changeObj) {
            /*jshint unused:false*/
            var linesChanged = _.range(changeObj.from.line, changeObj.from.line + changeObj.text.length);

            _.each(linesChanged, function (ln) {
                checkLine(ln, changeObj.origin);
            });

            // Is this a line which may have had a marker on it?
            markerMgr.checkMarkers();
        };

        // Public API
        _.extend(this, {
            value: value,
            enable: function () {
                var filestorage = $('#entry-markdown-content').data('filestorage');
                $('.js-drop-zone').upload({editor: true, fileStorage: filestorage});
                $('.js-drop-zone').on('uploadstart', markdown.off);
                $('.js-drop-zone').on('uploadfailure', markdown.on);
                $('.js-drop-zone').on('uploadsuccess', markdown.on);
                $('.js-drop-zone').on('uploadsuccess', handleUpload);
            },
            disable: function () {
                $('.js-drop-zone').off('uploadsuccess', handleUpload);
            }
        });

        editor.on('change', handleChange);
    };
    Ghost.Editor = Ghost.Editor || {};
    Ghost.Editor.UploadManager = UploadManager;
}());
// # Ghost Editor Markdown Editor
//
// Markdown Editor is a light wrapper around CodeMirror

/*global Ghost, CodeMirror, shortcut, _, $ */
(function () {
    'use strict';

    var MarkdownShortcuts,
        MarkdownEditor;

    MarkdownShortcuts = [
        {'key': 'Ctrl+Alt+U', 'style': 'strike'},
        {'key': 'Ctrl+Shift+K', 'style': 'code'},
        {'key': 'Meta+K', 'style': 'code'},
        {'key': 'Ctrl+Alt+1', 'style': 'h1'},
        {'key': 'Ctrl+Alt+2', 'style': 'h2'},
        {'key': 'Ctrl+Alt+3', 'style': 'h3'},
        {'key': 'Ctrl+Alt+4', 'style': 'h4'},
        {'key': 'Ctrl+Alt+5', 'style': 'h5'},
        {'key': 'Ctrl+Alt+6', 'style': 'h6'},
        {'key': 'Ctrl+Shift+L', 'style': 'link'},
        {'key': 'Ctrl+Shift+I', 'style': 'image'},
        {'key': 'Ctrl+Q', 'style': 'blockquote'},
        {'key': 'Ctrl+Shift+1', 'style': 'currentDate'},
        {'key': 'Ctrl+U', 'style': 'uppercase'},
        {'key': 'Ctrl+Shift+U', 'style': 'lowercase'},
        {'key': 'Ctrl+Alt+Shift+U', 'style': 'titlecase'},
        {'key': 'Ctrl+Alt+W', 'style': 'selectword'},
        {'key': 'Ctrl+L', 'style': 'list'}
    ];

    if (navigator.userAgent.indexOf('Mac') !== -1) {
        MarkdownShortcuts.push({'key': 'Meta+B', 'style': 'bold'});
        MarkdownShortcuts.push({'key': 'Meta+I', 'style': 'italic'});
        MarkdownShortcuts.push({'key': 'Meta+Alt+C', 'style': 'copyHTML'});
        MarkdownShortcuts.push({'key': 'Meta+Enter', 'style': 'newLine'});
    } else {
        MarkdownShortcuts.push({'key': 'Ctrl+B', 'style': 'bold'});
        MarkdownShortcuts.push({'key': 'Ctrl+I', 'style': 'italic'});
        MarkdownShortcuts.push({'key': 'Ctrl+Alt+C', 'style': 'copyHTML'});
        MarkdownShortcuts.push({'key': 'Ctrl+Enter', 'style': 'newLine'});

    }

    MarkdownEditor = function () {
        var codemirror = CodeMirror.fromTextArea(document.getElementById('entry-markdown'), {
            mode:           'gfm',
            tabMode:        'indent',
            tabindex:       '2',
            cursorScrollMargin: 10,
            lineWrapping:   true,
            dragDrop:       false,
            extraKeys: {
                Home:   'goLineLeft',
                End:    'goLineRight'
            }
        });

        // Markdown shortcuts for the editor
        _.each(MarkdownShortcuts, function (combo) {
            shortcut.add(combo.key, function () {
                return codemirror.addMarkdown({style: combo.style});
            });
        });

        // Public API
        _.extend(this, {
            codemirror: codemirror,

            scrollViewPort: function () {
                return $('.CodeMirror-scroll');
            },
            scrollContent: function () {
                return $('.CodeMirror-sizer');
            },
            enable: function () {
                codemirror.setOption('readOnly', false);
                codemirror.on('change', function () {
                    $(document).trigger('markdownEditorChange');
                });
            },
            disable: function () {
                codemirror.setOption('readOnly', 'nocursor');
                codemirror.off('change', function () {
                    $(document).trigger('markdownEditorChange');
                });
            },
            isCursorAtEnd: function () {
                return codemirror.getCursor('end').line > codemirror.lineCount() - 5;
            },
            value: function () {
                return codemirror.getValue();
            }
        });
    };

    Ghost.Editor = Ghost.Editor || {};
    Ghost.Editor.MarkdownEditor = MarkdownEditor;
} ());

// # Ghost Editor HTML Preview
//
// HTML Preview is the right pane in the split view editor.
// It is effectively just a scrolling container for the HTML output from showdown
// It knows how to update itself, and that's pretty much it.

/*global Ghost, Showdown, Countable, _, $ */
(function () {
    'use strict';

    var HTMLPreview = function (markdown, uploadMgr) {
        var converter = new Showdown.converter({extensions: ['ghostimagepreview', 'ghostgfm']}),
            preview = document.getElementsByClassName('rendered-markdown')[0],
            update;

        // Update the preview
        // Includes replacing all the HTML, intialising upload dropzones, and updating the counter
        update = function () {
            preview.innerHTML = converter.makeHtml(markdown.value());

            uploadMgr.enable();

            Countable.once(preview, function (counter) {
                $('.entry-word-count').text($.pluralize(counter.words, 'word'));
                $('.entry-character-count').text($.pluralize(counter.characters, 'character'));
                $('.entry-paragraph-count').text($.pluralize(counter.paragraphs, 'paragraph'));
            });
        };

        // Public API
        _.extend(this, {
            scrollViewPort: function () {
                return $('.entry-preview-content');
            },
            scrollContent: function () {
                return $('.rendered-markdown');
            },
            update: update
        });
    };

    Ghost.Editor = Ghost.Editor || {};
    Ghost.Editor.HTMLPreview = HTMLPreview;
} ());
// # Ghost Editor Scroll Handler
//
// Scroll Handler does the (currently very simple / naive) job of syncing the right pane with the left pane
// as the right pane scrolls

/*global Ghost, _ */
(function () {
    'use strict';

    var ScrollHandler = function (markdown, preview) {
        var $markdownViewPort = markdown.scrollViewPort(),
            $previewViewPort = preview.scrollViewPort(),
            $markdownContent = markdown.scrollContent(),
            $previewContent = preview.scrollContent(),
            syncScroll;

        syncScroll = _.throttle(function () {
            // calc position
            var markdownHeight = $markdownContent.height() - $markdownViewPort.height(),
                previewHeight = $previewContent.height() - $previewViewPort.height(),
                ratio = previewHeight / markdownHeight,
                previewPosition = $markdownViewPort.scrollTop() * ratio;

            if (markdown.isCursorAtEnd()) {
                previewPosition = previewHeight + 30;
            }

            // apply new scroll
            $previewViewPort.scrollTop(previewPosition);
        }, 10);

        _.extend(this, {
            enable: function () { // Handle Scroll Events
                $markdownViewPort.on('scroll', syncScroll);
                $markdownViewPort.scrollClass({target: '.entry-markdown', offset: 10});
                $previewViewPort.scrollClass({target: '.entry-preview', offset: 10});
            },
            disable: function () {
                $markdownViewPort.off('scroll', syncScroll);
            }
        });

    };

    Ghost.Editor = Ghost.Editor || {};
    Ghost.Editor.ScrollHandler = ScrollHandler;
} ());
// Taken from js-bin with thanks to Remy Sharp
// yeah, nasty, but it allows me to switch from a RTF to plain text if we're running a iOS

/*global Ghost, $, _, DocumentTouch, CodeMirror*/
(function () {
    Ghost.touchEditor = false;

    var noop = function () {},
        hasTouchScreen,
        smallScreen,
        TouchEditor,
        _oldCM,
        key;

    // Taken from "Responsive design & the Guardian" with thanks to Matt Andrews
    // Added !window._phantom so that the functional tests run as though this is not a touch screen.
    // In future we can do something more advanced here for testing both touch and non touch
    hasTouchScreen = function () {
        return !window._phantom &&
            (
                ('ontouchstart' in window) ||
                (window.DocumentTouch && document instanceof DocumentTouch)
            );
    };

    smallScreen = function () {
        if (window.matchMedia('(max-width: 1000px)').matches) {
            return true;
        }

        return false;
    };

    if (hasTouchScreen()) {
        $('body').addClass('touch-editor');
        Ghost.touchEditor = true;

        TouchEditor = function (el, options) {
            /*jshint unused:false*/
            this.textarea = el;
            this.win = { document : this.textarea };
            this.ready = true;
            this.wrapping = document.createElement('div');

            var textareaParent = this.textarea.parentNode;
            this.wrapping.appendChild(this.textarea);
            textareaParent.appendChild(this.wrapping);

            this.textarea.style.opacity = 1;

            $(this.textarea).blur(_.throttle(function () {
                $(document).trigger('markdownEditorChange', { panelId: el.id });
            }, 200));

            if (!smallScreen()) {
                $(this.textarea).on('change', _.throttle(function () {
                    $(document).trigger('markdownEditorChange', { panelId: el.id });
                }, 200));
            }
        };

        TouchEditor.prototype = {
            setOption: function (type, handler) {
                if (type === 'onChange') {
                    $(this.textarea).change(handler);
                }
            },
            eachLine: function () {
                return [];
            },
            getValue: function () {
                return this.textarea.value;
            },
            setValue: function (code) {
                this.textarea.value = code;
            },
            focus: noop,
            getCursor: function () {
                return { line: 0, ch: 0 };
            },
            setCursor: noop,
            currentLine: function () {
                return 0;
            },
            cursorPosition: function () {
                return { character: 0 };
            },
            addMarkdown: noop,
            nthLine: noop,
            refresh: noop,
            selectLines: noop,
            on: noop
        };

        _oldCM = CodeMirror;

        // CodeMirror = noop;

        for (key in _oldCM) {
            if (_oldCM.hasOwnProperty(key)) {
                CodeMirror[key] = noop;
            }
        }

        CodeMirror.fromTextArea = function (el, options) {
            return new TouchEditor(el, options);
        };

        CodeMirror.keyMap = { basic: {} };

    }
}());
this["JST"] = this["JST"] || {};

this["JST"]["forgotten"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<form id=\"forgotten\" class=\"forgotten-form\" method=\"post\" novalidate=\"novalidate\">\n    <div class=\"email-wrap\">\n        <input class=\"email\" type=\"email\" placeholder=\"Email Address\" name=\"email\" autocapitalize=\"off\" autocorrect=\"off\">\n    </div>\n    <button class=\"button-save\" type=\"submit\">Send new password</button>\n</form>\n";
  });

this["JST"]["list-item"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this, functionType="function";

function program1(depth0,data) {
  
  
  return " featured";
  }

function program3(depth0,data) {
  
  
  return " page";
  }

function program5(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n            ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.page), {hash:{},inverse:self.program(8, program8, data),fn:self.program(6, program6, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        ";
  return buffer;
  }
function program6(depth0,data) {
  
  
  return "\n                    <span class=\"page\">Page</span>\n            ";
  }

function program8(depth0,data) {
  
  var buffer = "", stack1, options;
  buffer += "\n                <time datetime=\"";
  options = {hash:{
    'format': ("YYYY-MM-DD hh:mm")
  },data:data};
  buffer += escapeExpression(((stack1 = helpers.date || (depth0 && depth0.date)),stack1 ? stack1.call(depth0, (depth0 && depth0.published_at), options) : helperMissing.call(depth0, "date", (depth0 && depth0.published_at), options)))
    + "\" class=\"date published\">\n                    Published ";
  options = {hash:{
    'timeago': ("True")
  },data:data};
  buffer += escapeExpression(((stack1 = helpers.date || (depth0 && depth0.date)),stack1 ? stack1.call(depth0, (depth0 && depth0.published_at), options) : helperMissing.call(depth0, "date", (depth0 && depth0.published_at), options)))
    + "\n                </time>\n            ";
  return buffer;
  }

function program10(depth0,data) {
  
  
  return "\n            <span class=\"draft\">Draft</span>\n        ";
  }

  buffer += "<a class=\"permalink";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.featured), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.page), {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\" href=\"#\" title=\"Edit this post\">\n    <h3 class=\"entry-title\">";
  if (stack1 = helpers.title) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.title); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</h3>\n    <section class=\"entry-meta\">\n        <span class=\"status\">\n        ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.published), {hash:{},inverse:self.program(10, program10, data),fn:self.program(5, program5, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        </span>\n    </section>\n</a>\n";
  return buffer;
  });

this["JST"]["login"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<form id=\"login\" class=\"login-form\" method=\"post\" novalidate=\"novalidate\">\n    <div class=\"email-wrap\">\n        <input class=\"email\" type=\"email\" placeholder=\"Email Address\" name=\"email\" autocapitalize=\"off\" autocorrect=\"off\">\n    </div>\n    <div class=\"password-wrap\">\n        <input class=\"password\" type=\"password\" placeholder=\"Password\" name=\"password\">\n    </div>\n    <button class=\"button-save\" type=\"submit\">Log in</button>\n    <section class=\"meta\">\n        <a class=\"forgotten-password\" href=\"";
  if (stack1 = helpers.admin_url) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.admin_url); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "/forgotten/\">Forgotten password?</a>\n    </section>\n</form>\n";
  return buffer;
  });

this["JST"]["modal"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, stack2, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "-"
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.options)),stack1 == null || stack1 === false ? stack1 : stack1.type)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1));
  return buffer;
  }

function program3(depth0,data) {
  
  var stack1, stack2;
  stack2 = helpers.each.call(depth0, ((stack1 = (depth0 && depth0.options)),stack1 == null || stack1 === false ? stack1 : stack1.style), {hash:{},inverse:self.noop,fn:self.program(4, program4, data),data:data});
  if(stack2 || stack2 === 0) { return stack2; }
  else { return ''; }
  }
function program4(depth0,data) {
  
  var buffer = "";
  buffer += "modal-style-"
    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
    + " ";
  return buffer;
  }

function program6(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "<header class=\"modal-header\"><h1>"
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.content)),stack1 == null || stack1 === false ? stack1 : stack1.title)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</h1></header>";
  return buffer;
  }

function program8(depth0,data) {
  
  
  return "<a class=\"close\" href=\"#\" title=\"Close\"><span class=\"hidden\">Close</span></a>";
  }

function program10(depth0,data) {
  
  var buffer = "", stack1, stack2;
  buffer += "\n        <footer class=\"modal-footer\">\n            <button class=\"js-button-accept ";
  stack2 = helpers['if'].call(depth0, ((stack1 = ((stack1 = ((stack1 = (depth0 && depth0.options)),stack1 == null || stack1 === false ? stack1 : stack1.confirm)),stack1 == null || stack1 === false ? stack1 : stack1.accept)),stack1 == null || stack1 === false ? stack1 : stack1.buttonClass), {hash:{},inverse:self.program(13, program13, data),fn:self.program(11, program11, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\">"
    + escapeExpression(((stack1 = ((stack1 = ((stack1 = ((stack1 = (depth0 && depth0.options)),stack1 == null || stack1 === false ? stack1 : stack1.confirm)),stack1 == null || stack1 === false ? stack1 : stack1.accept)),stack1 == null || stack1 === false ? stack1 : stack1.text)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</button>\n            <button class=\"js-button-reject ";
  stack2 = helpers['if'].call(depth0, ((stack1 = ((stack1 = ((stack1 = (depth0 && depth0.options)),stack1 == null || stack1 === false ? stack1 : stack1.confirm)),stack1 == null || stack1 === false ? stack1 : stack1.reject)),stack1 == null || stack1 === false ? stack1 : stack1.buttonClass), {hash:{},inverse:self.program(17, program17, data),fn:self.program(15, program15, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\">"
    + escapeExpression(((stack1 = ((stack1 = ((stack1 = ((stack1 = (depth0 && depth0.options)),stack1 == null || stack1 === false ? stack1 : stack1.confirm)),stack1 == null || stack1 === false ? stack1 : stack1.reject)),stack1 == null || stack1 === false ? stack1 : stack1.text)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</button>\n        </footer>\n        ";
  return buffer;
  }
function program11(depth0,data) {
  
  var stack1;
  return escapeExpression(((stack1 = ((stack1 = ((stack1 = ((stack1 = (depth0 && depth0.options)),stack1 == null || stack1 === false ? stack1 : stack1.confirm)),stack1 == null || stack1 === false ? stack1 : stack1.accept)),stack1 == null || stack1 === false ? stack1 : stack1.buttonClass)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1));
  }

function program13(depth0,data) {
  
  
  return "button-add";
  }

function program15(depth0,data) {
  
  var stack1;
  return escapeExpression(((stack1 = ((stack1 = ((stack1 = ((stack1 = (depth0 && depth0.options)),stack1 == null || stack1 === false ? stack1 : stack1.confirm)),stack1 == null || stack1 === false ? stack1 : stack1.reject)),stack1 == null || stack1 === false ? stack1 : stack1.buttonClass)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1));
  }

function program17(depth0,data) {
  
  
  return "button-delete";
  }

  buffer += "<article class=\"modal";
  stack2 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.options)),stack1 == null || stack1 === false ? stack1 : stack1.type), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += " ";
  stack2 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.options)),stack1 == null || stack1 === false ? stack1 : stack1.style), {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.options)),stack1 == null || stack1 === false ? stack1 : stack1.animation)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + " js-modal\">\n    <section class=\"modal-content\">\n        ";
  stack2 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.content)),stack1 == null || stack1 === false ? stack1 : stack1.title), {hash:{},inverse:self.noop,fn:self.program(6, program6, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n        ";
  stack2 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.options)),stack1 == null || stack1 === false ? stack1 : stack1.close), {hash:{},inverse:self.noop,fn:self.program(8, program8, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n        <section class=\"modal-body\">\n        </section>\n        ";
  stack2 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.options)),stack1 == null || stack1 === false ? stack1 : stack1.confirm), {hash:{},inverse:self.noop,fn:self.program(10, program10, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n    </section>\n</article>";
  return buffer;
  });

this["JST"]["modals/blank"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var stack1, stack2, functionType="function";


  stack2 = ((stack1 = ((stack1 = (depth0 && depth0.content)),stack1 == null || stack1 === false ? stack1 : stack1.text)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1);
  if(stack2 || stack2 === 0) { return stack2; }
  else { return ''; }
  });

this["JST"]["modals/copyToHTML"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "Press Ctrl / Cmd + C to copy the following HTML.\n<pre>\n<code class=\"modal-copyToHTML-content\"></code>\n</pre>";
  });

this["JST"]["modals/markdown"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<section class=\"markdown-help-container\">\n    <table class=\"modal-markdown-help-table\">\n        <thead>\n        <tr>\n            <th>Result</th>\n            <th>Markdown</th>\n            <th>Shortcut</th>\n        </tr>\n        </thead>\n        <tbody>\n        <tr>\n            <td><strong>Bold</strong></td>\n            <td>**text**</td>\n            <td>Ctrl / Cmd + B</td>\n        </tr>\n        <tr>\n            <td><em>Emphasize</em></td>\n            <td>*text*</td>\n            <td>Ctrl / Cmd + I</td>\n        </tr>\n        <tr>\n            <td>Strike-through</td>\n            <td>~~text~~</td>\n            <td>Ctrl + Alt + U</td>\n        </tr>\n        <tr>\n            <td><a href=\"#\">Link</a></td>\n            <td>[title](http://)</td>\n            <td>Ctrl + Shift + L</td>\n        </tr>\n        <tr>\n            <td>Image</td>\n            <td>![alt](http://)</td>\n            <td>Ctrl + Shift + I</td>\n        </tr>\n        <tr>\n            <td>List</td>\n            <td>* item</td>\n            <td>Ctrl + L</td>\n        </tr>\n        <tr>\n            <td>Blockquote</td>\n            <td>> quote</td>\n            <td>Ctrl + Q</td>\n        </tr>\n        <tr>\n            <td>H1</td>\n            <td># Heading</td>\n            <td>Ctrl + Alt + 1</td>\n        </tr>\n        <tr>\n            <td>H2</td>\n            <td>## Heading</td>\n            <td>Ctrl + Alt + 2</td>\n        </tr>\n        <tr>\n            <td>H3</td>\n            <td>### Heading</td>\n            <td>Ctrl + Alt + 3</td>\n        </tr>\n        <tr>\n            <td><code>Inline Code</code></td>\n            <td>`code`</td>\n            <td>Cmd + K / Ctrl + Shift + K</td>\n        </tr>\n        </tbody>\n    </table>\n    For further Markdown syntax reference: <a href=\"http://daringfireball.net/projects/markdown/syntax\" target=\"_blank\">Markdown Documentation</a>\n</section>";
  });

this["JST"]["modals/uploadImage"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, stack2, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  return " style=\"display: none\"";
  }

function program3(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "accept=\""
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.options)),stack1 == null || stack1 === false ? stack1 : stack1.acceptEncoding)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"";
  return buffer;
  }

  buffer += "<section class=\"js-drop-zone\">\n    <img class=\"js-upload-target\" src=\""
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.options)),stack1 == null || stack1 === false ? stack1 : stack1.src)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"";
  stack2 = helpers.unless.call(depth0, ((stack1 = (depth0 && depth0.options)),stack1 == null || stack1 === false ? stack1 : stack1.src), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += " alt=\"logo\">\n    <input data-url=\"upload\" class=\"js-fileupload main\" type=\"file\" name=\"uploadimage\" ";
  stack2 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.options)),stack1 == null || stack1 === false ? stack1 : stack1.acceptEncoding), {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += ">\n</section>\n";
  return buffer;
  });

this["JST"]["notification"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "-";
  if (stack1 = helpers.type) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.type); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1);
  return buffer;
  }

  buffer += "<section class=\"notification";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.type), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " notification-";
  if (stack1 = helpers.status) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.status); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + " js-notification\">\n    ";
  if (stack1 = helpers.message) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.message); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    <a class=\"close\" href=\"#\"><span class=\"hidden\">Close</span></a>\n</section>\n";
  return buffer;
  });

this["JST"]["preview"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, stack2, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  return "featured";
  }

function program3(depth0,data) {
  
  
  return "unfeatured";
  }

function program5(depth0,data) {
  
  
  return "Unfeature";
  }

function program7(depth0,data) {
  
  
  return "Feature";
  }

function program9(depth0,data) {
  
  
  return "Published";
  }

function program11(depth0,data) {
  
  
  return "Written";
  }

function program13(depth0,data) {
  
  var stack1;
  return escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.author)),stack1 == null || stack1 === false ? stack1 : stack1.name)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1));
  }

function program15(depth0,data) {
  
  var stack1;
  return escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.author)),stack1 == null || stack1 === false ? stack1 : stack1.email)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1));
  }

function program17(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n    <div class=\"no-posts-box\">\n        <div class=\"no-posts\">\n            <h3>You Haven't Written Any Posts Yet!</h3>\n            <form action=\"";
  if (stack1 = helpers.admin_url) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.admin_url); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "/editor/\"><button class=\"button-add large\" title=\"New Post\">Write a new Post</button></form>\n        </div>\n    </div>\n";
  return buffer;
  }

  buffer += "<header class=\"floatingheader\">\n    <button class=\"button-back\" href=\"#\">Back</button>\n    <a class=\"";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.featured), {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\" href=\"#\" title=\"";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.featured), {hash:{},inverse:self.program(7, program7, data),fn:self.program(5, program5, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " this post\">\n        <span class=\"hidden\">Star</span>\n    </a>\n    <small>\n        <span class=\"status\">";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.published), {hash:{},inverse:self.program(11, program11, data),fn:self.program(9, program9, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</span>\n        <span class=\"normal\">by</span>\n        <span class=\"author\">";
  stack2 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.author)),stack1 == null || stack1 === false ? stack1 : stack1.name), {hash:{},inverse:self.program(15, program15, data),fn:self.program(13, program13, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "</span>\n    </small>\n    <section class=\"post-controls\">\n        <a class=\"post-edit\" href=\"#\" title=\"Edit Post\"><span class=\"hidden\">Edit Post</span></a>\n        <a class=\"post-settings\" href=\"#\" data-toggle=\".post-settings-menu\" title=\"Post Settings\"><span class=\"hidden\">Post Settings</span></a>\n        <div class=\"post-settings-menu menu-drop-right overlay\">\n            <form>\n                <table class=\"plain\">\n                    <tr class=\"post-setting\">\n                        <td class=\"post-setting-label\">\n                            <label for=\"url\">URL</label>\n                        </td>\n                        <td class=\"post-setting-field\">\n                            <input id=\"url\" class=\"post-setting-slug\" type=\"text\" value=\"\" />\n                        </td>\n                    </tr>\n                    <tr class=\"post-setting\">\n                        <td class=\"post-setting-label\">\n                            <label for=\"pub-date\">Pub Date</label>\n                        </td>\n                        <td class=\"post-setting-field\">\n                            <input id=\"pub-date\" class=\"post-setting-date\" type=\"text\" value=\"\"><!--<span class=\"post-setting-calendar\"></span>-->\n                        </td>\n                    </tr>\n                    <tr class=\"post-setting\">\n                        <td class=\"post-setting-label\">\n                            <span class=\"label\">Static Page</span>\n                        </td>\n                        <td class=\"post-setting-item\">\n                            <input id=\"static-page\" class=\"post-setting-static-page\" type=\"checkbox\" value=\"\">\n                            <label class=\"checkbox\" for=\"static-page\"></label>\n                        </td>\n                    </tr>\n                </table>\n            </form>\n            <a class=\"delete\" href=\"#\">Delete This Post</a>\n        </div>\n    </section>\n</header>\n<section class=\"content-preview-content\">\n    <div class=\"wrapper\"><h1>";
  if (stack2 = helpers.title) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
  else { stack2 = (depth0 && depth0.title); stack2 = typeof stack2 === functionType ? stack2.call(depth0, {hash:{},data:data}) : stack2; }
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "</h1>";
  if (stack2 = helpers.html) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
  else { stack2 = (depth0 && depth0.html); stack2 = typeof stack2 === functionType ? stack2.call(depth0, {hash:{},data:data}) : stack2; }
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "</div>\n</section>\n";
  stack2 = helpers.unless.call(depth0, (depth0 && depth0.title), {hash:{},inverse:self.noop,fn:self.program(17, program17, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n";
  return buffer;
  });

this["JST"]["reset"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<form id=\"reset\" class=\"reset-form\" method=\"post\" novalidate=\"novalidate\">\n    <div class=\"password-wrap\">\n        <input class=\"password\" type=\"password\" placeholder=\"Password\" name=\"newpassword\" />\n    </div>\n    <div class=\"password-wrap\">\n        <input class=\"password\" type=\"password\" placeholder=\"Confirm Password\" name=\"ne2password\" />\n    </div>\n    <button class=\"button-save\" type=\"submit\">Reset Password</button>\n</form>\n";
  });

this["JST"]["settings/apps"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n        <li>\n            ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0['package']), {hash:{},inverse:self.program(4, program4, data),fn:self.program(2, program2, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n            <button data-app=\"";
  if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.name); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" class=\"";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.active), {hash:{},inverse:self.program(8, program8, data),fn:self.program(6, program6, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</button>\n        </li>\n        ";
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = "", stack1;
  buffer += escapeExpression(((stack1 = ((stack1 = (depth0 && depth0['package'])),stack1 == null || stack1 === false ? stack1 : stack1.name)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + " - "
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0['package'])),stack1 == null || stack1 === false ? stack1 : stack1.version)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1));
  return buffer;
  }

function program4(depth0,data) {
  
  var buffer = "", stack1;
  if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.name); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + " - package.json missing :(";
  return buffer;
  }

function program6(depth0,data) {
  
  
  return "button-delete js-button-deactivate js-button-active\">Deactivate";
  }

function program8(depth0,data) {
  
  
  return "button-add js-button-activate\">Activate";
  }

  buffer += "<header>\n    <button class=\"button-back\">Back</button>\n    <h2 class=\"title\">Apps</h2>\n</header>\n\n<section class=\"content\">\n    <ul class=\"js-apps\">\n        ";
  stack1 = helpers.each.call(depth0, (depth0 && depth0.availableApps), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    </ul>\n</section>";
  return buffer;
  });

this["JST"]["settings/general"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n                    <a class=\"js-modal-logo\" href=\"#\"><img id=\"blog-logo\" src=\"";
  if (stack1 = helpers.logo) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.logo); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" alt=\"logo\"></a>\n                ";
  return buffer;
  }

function program3(depth0,data) {
  
  
  return "\n                    <a class=\"button-add js-modal-logo\" >Upload Image</a>\n                ";
  }

function program5(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n                    <a class=\"js-modal-cover\" href=\"#\"><img id=\"blog-cover\" src=\"";
  if (stack1 = helpers.cover) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.cover); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" alt=\"cover photo\"></a>\n                ";
  return buffer;
  }

function program7(depth0,data) {
  
  
  return "\n                    <a class=\"button-add js-modal-cover\">Upload Image</a>\n                ";
  }

function program9(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n                        <option value=\"";
  if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.name); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.active), {hash:{},inverse:self.noop,fn:self.program(10, program10, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += ">";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0['package']), {hash:{},inverse:self.program(14, program14, data),fn:self.program(12, program12, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</option>\n                        ";
  stack1 = helpers.unless.call(depth0, (depth0 && depth0['package']), {hash:{},inverse:self.noop,fn:self.program(16, program16, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                    ";
  return buffer;
  }
function program10(depth0,data) {
  
  
  return "selected";
  }

function program12(depth0,data) {
  
  var buffer = "", stack1;
  buffer += escapeExpression(((stack1 = ((stack1 = (depth0 && depth0['package'])),stack1 == null || stack1 === false ? stack1 : stack1.name)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + " - "
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0['package'])),stack1 == null || stack1 === false ? stack1 : stack1.version)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1));
  return buffer;
  }

function program14(depth0,data) {
  
  var stack1;
  if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.name); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  return escapeExpression(stack1);
  }

function program16(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "<script>console.log('Hi! The theme named \"";
  if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.name); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" does not have a package.json file or it\\'s malformed. This will be required in the future. For more info, see http://docs.ghost.org/themes/.');</script>";
  return buffer;
  }

  buffer += "<header>\n    <button class=\"button-back\">Back</button>\n    <h2 class=\"title\">General</h2>\n    <section class=\"page-actions\">\n        <button class=\"button-save\">Save</button>\n    </section>\n</header>\n\n<section class=\"content\">\n    <form id=\"settings-general\" novalidate=\"novalidate\">\n        <fieldset>\n\n            <div class=\"form-group\">\n                <label for=\"blog-title\">Blog Title</label>\n                <input id=\"blog-title\" name=\"general[title]\" type=\"text\" value=\"";
  if (stack1 = helpers.title) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.title); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" />\n                <p>The name of your blog</p>\n            </div>\n\n            <div class=\"form-group description-container\">\n                <label for=\"blog-description\">Blog Description</label>\n                <textarea id=\"blog-description\">";
  if (stack1 = helpers.description) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.description); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</textarea>\n                <p>\n                    Describe what your blog is about\n                    <span class=\"word-count\">0</span>\n                </p>\n\n            </div>\n        </fieldset>\n            <div class=\"form-group\">\n                <label for=\"blog-logo\">Blog Logo</label>\n                ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.logo), {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                <p>Display a sexy logo for your publication</p>\n            </div>\n\n            <div class=\"form-group\">\n                <label for=\"blog-cover\">Blog Cover</label>\n                ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.cover), {hash:{},inverse:self.program(7, program7, data),fn:self.program(5, program5, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                <p>Display a cover image on your site</p>\n            </div>\n        <fieldset>\n            <div class=\"form-group\">\n                <label for=\"email-address\">Email Address</label>\n                <input id=\"email-address\" name=\"general[email-address]\" type=\"email\" value=\"";
  if (stack1 = helpers.email) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.email); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" autocapitalize=\"off\" autocorrect=\"off\" />\n                <p>Address to use for admin notifications</p>\n            </div>\n\n            <div class=\"form-group\">\n                <label for=\"postsPerPage\">Posts per page</label>\n                <input id=\"postsPerPage\" name=\"general[postsPerPage]\" type=\"number\" value=\"";
  if (stack1 = helpers.postsPerPage) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.postsPerPage); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" />\n                <p>How many posts should be displayed on each page</p>\n            </div>\n\n            <div class=\"form-group\">\n                <label for=\"permalinks\">Dated Permalinks</label>\n                <input id=\"permalinks\" name=\"general[permalinks]\" type=\"checkbox\" value='permalink'/>\n                <label class=\"checkbox\" for=\"permalinks\"></label>\n                <p>Include the date in your post URLs</p>\n            </div>\n\n            <div class=\"form-group\">\n                <label for=\"activeTheme\">Theme</label>\n                <select id=\"activeTheme\" name=\"general[activeTheme]\">\n                    ";
  stack1 = helpers.each.call(depth0, (depth0 && depth0.availableThemes), {hash:{},inverse:self.noop,fn:self.program(9, program9, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                </select>\n                <p>Select a theme for your blog</p>\n            </div>\n\n        </fieldset>\n    </form>\n</section>\n";
  return buffer;
  });

this["JST"]["settings/sidebar"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<header>\n    <h1 class=\"title\">Settings</h1>\n</header>\n<nav class=\"settings-menu\">\n    <ul>\n        <li class=\"general\"><a href=\"#general\">General</a></li>\n        <li class=\"users\"><a href=\"#user\">User</a></li>\n        <li class=\"apps\"><a href=\"#apps\">Apps</a></li>\n    </ul>\n</nav>";
  });

this["JST"]["settings/user-profile"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing, self=this;

function program1(depth0,data) {
  
  var stack1;
  if (stack1 = helpers.cover) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.cover); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  return escapeExpression(stack1);
  }

function program3(depth0,data) {
  
  var stack1, options;
  options = {hash:{},data:data};
  return escapeExpression(((stack1 = helpers.asset || (depth0 && depth0.asset)),stack1 ? stack1.call(depth0, "shared/img/user-cover.png", options) : helperMissing.call(depth0, "asset", "shared/img/user-cover.png", options)));
  }

function program5(depth0,data) {
  
  var stack1;
  if (stack1 = helpers.image) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.image); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  return escapeExpression(stack1);
  }

function program7(depth0,data) {
  
  var stack1, options;
  options = {hash:{},data:data};
  return escapeExpression(((stack1 = helpers.asset || (depth0 && depth0.asset)),stack1 ? stack1.call(depth0, "shared/img/user-image.png", options) : helperMissing.call(depth0, "asset", "shared/img/user-image.png", options)));
  }

  buffer += "<header>\n    <button class=\"button-back\">Back</button>\n    <h2 class=\"title\">Your Profile</h2>\n    <section class=\"page-actions\">\n        <button class=\"button-save\">Save</button>\n    </section>\n</header>\n\n<section class=\"content no-padding\">\n\n    <header class=\"user-profile-header\">\n        <img id=\"user-cover\" class=\"cover-image\" src=\"";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.cover), {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\" title=\"";
  if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.name); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "'s Cover Image\"/>\n\n        <a class=\"edit-cover-image js-modal-cover button\" href=\"#\">Change Cover</a>\n    </header>\n\n    <form class=\"user-profile\" novalidate=\"novalidate\">\n\n        <fieldset class=\"user-details-top\">\n\n            <figure class=\"user-image\">\n                <div id=\"user-image\" class=\"img\" style=\"background-image: url(";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.image), {hash:{},inverse:self.program(7, program7, data),fn:self.program(5, program5, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += ");\" href=\"#\"><span class=\"hidden\">";
  if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.name); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "'s Picture</span></div>\n                <a href=\"#\" class=\"edit-user-image js-modal-image\">Edit Picture</a>\n            </figure>\n\n            <div class=\"form-group\">\n                <label for=\"user-name\" class=\"hidden\">Full Name</label>\n                <input type=\"text\" value=\"";
  if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.name); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" id=\"user-name\" placeholder=\"Full Name\" autocorrect=\"off\" />\n                <p>Use your real name so people can recognise you</p>\n            </div>\n\n        </fieldset>\n\n        <fieldset class=\"user-details-bottom\">\n\n            <div class=\"form-group\">\n                <label for\"user-email\">Email</label>\n                <input type=\"email\" value=\"";
  if (stack1 = helpers.email) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.email); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" id=\"user-email\" placeholder=\"Email Address\" autocapitalize=\"off\" autocorrect=\"off\" />\n                <p>Used for notifications</p>\n            </div>\n\n            <div class=\"form-group\">\n                <label for=\"user-location\">Location</label>\n                <input type=\"text\" value=\"";
  if (stack1 = helpers.location) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.location); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" id=\"user-location\" />\n                <p>Where in the world do you live?</p>\n            </div>\n\n            <div class=\"form-group\">\n                <label for=\"user-website\">Website</label>\n                <input type=\"url\" value=\"";
  if (stack1 = helpers.website) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.website); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" id=\"user-website\" autocapitalize=\"off\" autocorrect=\"off\" />\n                <p>Have a website or blog other than this one? Link it!</p>\n            </div>\n\n            <div class=\"form-group bio-container\">\n                <label for=\"user-bio\">Bio</label>\n                <textarea id=\"user-bio\">";
  if (stack1 = helpers.bio) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.bio); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</textarea>\n                <p>\n                    Write about you, in 200 characters or less.\n                    <span class=\"word-count\">0</span>\n                </p>\n            </div>\n\n            <hr />\n\n        </fieldset>\n\n        <fieldset>\n\n            <div class=\"form-group\">\n                <label for=\"user-password-old\">Old Password</label>\n                <input type=\"password\" id=\"user-password-old\" />\n            </div>\n\n            <div class=\"form-group\">\n                <label for=\"user-password-new\">New Password</label>\n                <input type=\"password\" id=\"user-password-new\" />\n            </div>\n\n            <div class=\"form-group\">\n                <label for=\"user-new-password-verification\">Verify Password</label>\n                <input type=\"password\" id=\"user-new-password-verification\" />\n            </div>\n            <div class=\"form-group\">\n                <button type=\"button\" class=\"button-delete button-change-password\">Change Password</button>\n            </div>\n\n        </fieldset>\n\n    </form>\n</section>\n";
  return buffer;
  });

this["JST"]["signup"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<form id=\"signup\" class=\"signup-form\" method=\"post\" novalidate=\"novalidate\">\n    <div class=\"name-wrap\">\n        <input class=\"name\" type=\"text\" placeholder=\"Full Name\" name=\"name\" autocorrect=\"off\" />\n    </div>\n    <div class=\"email-wrap\">\n        <input class=\"email\" type=\"email\" placeholder=\"Email Address\" name=\"email\" autocapitalize=\"off\" autocorrect=\"off\" />\n    </div>\n    <div class=\"password-wrap\">\n        <input class=\"password\" type=\"password\" placeholder=\"Password\" name=\"password\" />\n    </div>\n    <button class=\"button-save\" type=\"submit\">Sign Up</button>\n</form>\n";
  });
/*global Ghost, _, Backbone, NProgress */

(function () {
    "use strict";
    NProgress.configure({ showSpinner: false });

    // Adds in a call to start a loading bar
    // This is sets up a success function which completes the loading bar
    function wrapSync(method, model, options) {
        if (options !== undefined && _.isObject(options)) {
            NProgress.start();

            /*jshint validthis:true */
            var self = this,
                oldSuccess = options.success;
            /*jshint validthis:false */

            options.success = function () {
                NProgress.done();
                return oldSuccess.apply(self, arguments);
            };
        }

        /*jshint validthis:true */
        return Backbone.sync.call(this, method, model, options);
    }

    Ghost.ProgressModel = Backbone.Model.extend({
        sync: wrapSync
    });

    Ghost.ProgressCollection = Backbone.Collection.extend({
        sync: wrapSync
    });
}());

/*global Ghost, _, Backbone, JSON */
(function () {
    'use strict';

    Ghost.Models.Post = Ghost.ProgressModel.extend({

        defaults: {
            status: 'draft'
        },

        blacklist: ['published', 'draft'],

        parse: function (resp) {

            if (resp.posts) {
                resp = resp.posts[0];
            }
            if (resp.status) {
                resp.published = resp.status === 'published';
                resp.draft = resp.status === 'draft';
            }
            if (resp.tags) {
                return resp;
            }
            return resp;
        },

        validate: function (attrs) {
            if (_.isEmpty(attrs.title)) {
                return 'You must specify a title for the post.';
            }
        },

        addTag: function (tagToAdd) {
            var tags = this.get('tags') || [];
            tags.push(tagToAdd);
            this.set('tags', tags);
        },

        removeTag: function (tagToRemove) {
            var tags = this.get('tags') || [];
            tags = _.reject(tags, function (tag) {
                return tag.id === tagToRemove.id || tag.name === tagToRemove.name;
            });
            this.set('tags', tags);
        },
        sync: function (method, model, options) {
            //wrap post in {posts: [{...}]}
            if (method === 'create' || method === 'update') {
                options.data = JSON.stringify({posts: [this.attributes]});
                options.contentType = 'application/json';
                options.url = model.url() + '?include=tags';
            }

            return Backbone.Model.prototype.sync.apply(this, arguments);
        }
    });

    Ghost.Collections.Posts = Backbone.Collection.extend({
        currentPage: 1,
        totalPages: 0,
        totalPosts: 0,
        nextPage: 0,
        prevPage: 0,

        url: Ghost.paths.apiRoot + '/posts/',
        model: Ghost.Models.Post,

        parse: function (resp) {
            if (_.isArray(resp.posts)) {
                this.limit = resp.meta.pagination.limit;
                this.currentPage = resp.meta.pagination.page;
                this.totalPages = resp.meta.pagination.pages;
                this.totalPosts = resp.meta.pagination.total;
                this.nextPage = resp.meta.pagination.next;
                this.prevPage = resp.meta.pagination.prev;
                return resp.posts;
            }
            return resp;
        }
    });

}());
/*global Backbone, Ghost, _ */
(function () {
    'use strict';
    //id:0 is used to issue PUT requests
    Ghost.Models.Settings = Ghost.ProgressModel.extend({
        url: Ghost.paths.apiRoot + '/settings/?type=blog,theme,app',
        id: '0',

        parse: function (response) {
            var result = _.reduce(response.settings, function (settings, setting) {
                settings[setting.key] = setting.value;

                return settings;
            }, {});

            return result;
        },

        sync: function (method, model, options) {
            var settings = _.map(this.attributes, function (value, key) {
                return { key: key, value: value };
            });
            //wrap settings in {settings: [{...}]}
            if (method === 'update') {
                options.data = JSON.stringify({settings: settings});
                options.contentType = 'application/json';
            }

            return Backbone.Model.prototype.sync.apply(this, arguments);
        }
    });

}());
/*global Ghost */
(function () {
    'use strict';

    Ghost.Collections.Tags = Ghost.ProgressCollection.extend({
        url: Ghost.paths.apiRoot + '/tags/',

        parse: function (resp) {
            return resp.tags;
        }
    });
}());

/*global Ghost, Backbone */
(function () {
    'use strict';

    Ghost.Models.Themes = Backbone.Model.extend({
        url: Ghost.paths.apiRoot + '/themes/'
    });

}());

/*global Ghost, Backbone, $ */
(function () {
    'use strict';
    Ghost.Models.uploadModal = Backbone.Model.extend({

        options: {
            close: true,
            type: 'action',
            style: ["wide"],
            animation: 'fade',
            afterRender: function () {
                var filestorage = $('#' + this.options.model.id).data('filestorage');
                this.$('.js-drop-zone').upload({fileStorage: filestorage});
            },
            confirm: {
                reject: {
                    func: function () { // The function called on rejection
                        return true;
                    },
                    buttonClass: true,
                    text: "Cancel" // The reject button text
                }
            }
        },
        content: {
            template: 'uploadImage'
        },

        initialize: function (options) {
            this.options.id = options.id;
            this.options.key = options.key;
            this.options.src = options.src;
            this.options.confirm.accept = options.accept;
            this.options.acceptEncoding = options.acceptEncoding || 'image/*';
        }
    });

}());

/*global Ghost,Backbone */
(function () {
    'use strict';

    Ghost.Models.User = Ghost.ProgressModel.extend({
        url: Ghost.paths.apiRoot + '/users/me/',

        parse: function (resp) {
            // unwrap user from {users: [{...}]}
            if (resp.users) {
                resp = resp.users[0];
            }

            return resp;
        },

        sync: function (method, model, options) {
            // wrap user in {users: [{...}]}
            if (method === 'create' || method === 'update') {
                options.data = JSON.stringify({users: [this.attributes]});
                options.contentType = 'application/json';
            }

            return Backbone.Model.prototype.sync.apply(this, arguments);
        }
    });

//    Ghost.Collections.Users = Backbone.Collection.extend({
//        url: Ghost.paths.apiRoot + '/users/'
//    });

}());
/*global Ghost */
(function () {
    'use strict';

    Ghost.Models.Widget = Ghost.ProgressModel.extend({

        defaults: {
            title: '',
            name: '',
            author: '',
            applicationID: '',
            size: '',
            content: {
                template: '',
                data: {
                    number: {
                        count: 0,
                        sub: {
                            value: 0,
                            dir: '', // "up" or "down"
                            item: '',
                            period: ''
                        }
                    }
                }
            },
            settings: {
                settingsPane: false,
                enabled: false,
                options: [{
                    title: 'ERROR',
                    value: 'Widget options not set'
                }]
            }
        }
    });

    Ghost.Collections.Widgets = Ghost.ProgressCollection.extend({
        // url: Ghost.paths.apiRoot + '/widgets/', // What will this be?
        model: Ghost.Models.Widget
    });

}());

/*global window, document, setTimeout, Ghost, $, _, Backbone, JST, shortcut */
(function () {
    "use strict";

    Ghost.TemplateView = Backbone.View.extend({
        templateName: "widget",

        template: function (data) {
            return JST[this.templateName](data);
        },

        templateData: function () {
            if (this.model) {
                return this.model.toJSON();
            }

            if (this.collection) {
                return this.collection.toJSON();
            }

            return {};
        },

        render: function () {
            if (_.isFunction(this.beforeRender)) {
                this.beforeRender();
            }

            this.$el.html(this.template(this.templateData()));

            if (_.isFunction(this.afterRender)) {
                this.afterRender();
            }

            return this;
        }
    });

    Ghost.View = Ghost.TemplateView.extend({

        // Adds a subview to the current view, which will
        // ensure its removal when this view is removed,
        // or when view.removeSubviews is called
        addSubview: function (view) {
            if (!(view instanceof Backbone.View)) {
                throw new Error("Subview must be a Backbone.View");
            }
            this.subviews = this.subviews || [];
            this.subviews.push(view);
            return view;
        },

        // Removes any subviews associated with this view
        // by `addSubview`, which will in-turn remove any
        // children of those views, and so on.
        removeSubviews: function () {
            var children = this.subviews;

            if (!children) {
                return this;
            }

            _(children).invoke("remove");

            this.subviews = [];
            return this;
        },

        // Extends the view's remove, by calling `removeSubviews`
        // if any subviews exist.
        remove: function () {
            if (this.subviews) {
                this.removeSubviews();
            }
            return Backbone.View.prototype.remove.apply(this, arguments);
        }
    });

    Ghost.Views.Utils = {

        // Used in API request fail handlers to parse a standard api error
        // response json for the message to display
        getRequestErrorMessage: function (request) {
            var message,
                msgDetail;

            // Can't really continue without a request
            if (!request) {
                return null;
            }

            // Seems like a sensible default
            message = request.statusText;

            // If a non 200 response
            if (request.status !== 200) {
                try {
                    // Try to parse out the error, or default to "Unknown"
                    if (request.responseJSON.errors && _.isArray(request.responseJSON.errors)) {
                        message = '';
                        _.each(request.responseJSON.errors, function (errorItem) {
                            message += '<br/>' + errorItem.message;
                        });
                    } else {
                        message =  request.responseJSON.error || "Unknown Error";
                    }
                } catch (e) {
                    msgDetail = request.status ? request.status + " - " + request.statusText : "Server was not available";
                    message = "The server returned an error (" + msgDetail + ").";
                }
            }

            return message;
        },

        // Getting URL vars
        getUrlVariables: function () {
            var vars = [],
                hash,
                hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&'),
                i;

            for (i = 0; i < hashes.length; i += 1) {
                hash = hashes[i].split('=');
                vars.push(hash[0]);
                vars[hash[0]] = hash[1];
            }
            return vars;
        }
    };

    /**
     * This is the view to generate the markup for the individual
     * notification. Will be included into #notifications.
     *
     * States can be
     * - persistent
     * - passive
     *
     * Types can be
     * - error
     * - success
     * - alert
     * -   (empty)
     *
     */
    Ghost.Views.Notification = Ghost.View.extend({
        templateName: 'notification',
        className: 'js-bb-notification',
        template: function (data) {
            return JST[this.templateName](data);
        },
        render: function () {
            var html = this.template(this.model);
            this.$el.html(html);
            return this;
        }
    });

    /**
     * This handles Notification groups
     */
    Ghost.Views.NotificationCollection = Ghost.View.extend({
        el: '#notifications',
        initialize: function () {
            var self = this;
            this.render();
            Ghost.on('urlchange', function () {
                self.clearEverything();
            });
            shortcut.add("ESC", function () {
                // Make sure there isn't currently an open modal, as the escape key should close that first.
                // This is a temporary solution to enable closing extra-long notifications, and should be refactored
                // into something more robust in future
                if ($('.js-modal').length < 1) {
                    self.clearEverything();
                }
            });
        },
        events: {
            'animationend .js-notification': 'removeItem',
            'webkitAnimationEnd .js-notification': 'removeItem',
            'oanimationend .js-notification': 'removeItem',
            'MSAnimationEnd .js-notification': 'removeItem',
            'click .js-notification.notification-passive .close': 'closePassive',
            'click .js-notification.notification-persistent .close': 'closePersistent'
        },
        render: function () {
            _.each(this.model, function (item) {
                this.renderItem(item);
            }, this);
        },
        renderItem: function (item) {
            var itemView = new Ghost.Views.Notification({ model: item }),
                height,
                $notification = $(itemView.render().el);

            this.$el.append($notification);
            height = $notification.hide().outerHeight(true);
            $notification.animate({height: height}, 250, function () {
                $(this)
                    .css({height: "auto"})
                    .fadeIn(250);
            });
        },
        addItem: function (item) {
            this.model.push(item);
            this.renderItem(item);
        },
        clearEverything: function () {
            this.$el.find('.js-notification.notification-passive').parent().remove();
        },
        removeItem: function (e) {
            e.preventDefault();
            var self = e.currentTarget,
                bbSelf = this;
            if (self.className.indexOf('notification-persistent') !== -1) {
                $.ajax({
                    type: "DELETE",
                    headers: {
                        'X-CSRF-Token': $("meta[name='csrf-param']").attr('content')
                    },
                    url: Ghost.paths.apiRoot + '/notifications/' + $(self).find('.close').data('id')
                }).done(function (result) {
                    /*jshint unused:false*/
                    bbSelf.$el.slideUp(250, function () {
                        $(this).show().css({height: "auto"});
                        $(self).remove();
                    });
                });
            } else {
                $(self).slideUp(250, function () {
                    $(this)
                        .show()
                        .css({height: "auto"})
                        .parent()
                        .remove();
                });
            }
        },
        closePassive: function (e) {
            $(e.currentTarget)
                .parent()
                .fadeOut(250)
                .slideUp(250, function () {
                    $(this).remove();
                });
        },
        closePersistent: function (e) {
            var self = e.currentTarget,
                bbSelf = this;
            $.ajax({
                type: "DELETE",
                headers: {
                    'X-CSRF-Token': $("meta[name='csrf-param']").attr('content')
                },
                url: Ghost.paths.apiRoot + '/notifications/' + $(self).data('id')
            }).done(function (result) {
                /*jshint unused:false*/
                var height = bbSelf.$('.js-notification').outerHeight(true),
                    $parent = $(self).parent();
                bbSelf.$el.css({height: height});

                if ($parent.parent().hasClass('js-bb-notification')) {
                    $parent.parent().fadeOut(200,  function () {
                        $(this).remove();
                        bbSelf.$el.slideUp(250, function () {
                            $(this).show().css({height: "auto"});
                        });
                    });
                } else {
                    $parent.fadeOut(200,  function () {
                        $(this).remove();
                        bbSelf.$el.slideUp(250, function () {
                            $(this).show().css({height: "auto"});
                        });
                    });
                }
            });
        }
    });

    // ## Modals
    Ghost.Views.Modal = Ghost.View.extend({
        el: '#modal-container',
        templateName: 'modal',
        className: 'js-bb-modal',
        // Render and manages modal dismissal
        initialize: function () {
            this.render();
            var self = this;
            if (this.model.options.close) {
                shortcut.add("ESC", function () {
                    self.removeElement();
                });
                $(document).on('click', '.modal-background', function () {
                    self.removeElement();
                });
            } else {
                shortcut.remove("ESC");
                $(document).off('click', '.modal-background');
            }

            if (this.model.options.confirm) {
                // Initiate functions for buttons here so models don't get tied up.
                this.acceptModal = function () {
                    this.model.options.confirm.accept.func.call(this);
                    self.removeElement();
                };
                this.rejectModal = function () {
                    this.model.options.confirm.reject.func.call(this);
                    self.removeElement();
                };
            }
        },
        templateData: function () {
            return this.model;
        },
        events: {
            'click .close': 'removeElement',
            'click .js-button-accept': 'acceptModal',
            'click .js-button-reject': 'rejectModal'
        },
        afterRender: function () {
            this.$el.fadeIn(50);
            $(".modal-background").show(10, function () {
                $(this).addClass("in");
            });
            if (this.model.options.confirm) {
                this.$('.close').remove();
            }
            this.$(".modal-body").html(this.addSubview(new Ghost.Views.Modal.ContentView({model: this.model})).render().el);

//            if (document.body.style.webkitFilter !== undefined) { // Detect webkit filters
//                $("body").addClass("blur"); // Removed due to poor performance in Chrome
//            }

            if (_.isFunction(this.model.options.afterRender)) {
                this.model.options.afterRender.call(this);
            }
            if (this.model.options.animation) {
                this.animate(this.$el.children(".js-modal"));
            }
        },
        // #### remove
        // Removes Backbone attachments from modals
        remove: function () {
            this.undelegateEvents();
            this.$el.empty();
            this.stopListening();
            return this;
        },
        // #### removeElement
        // Visually removes the modal from the user interface
        removeElement: function (e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }

            var self = this,
                $jsModal = $('.js-modal'),
                removeModalDelay = $jsModal.transitionDuration(),
                removeBackgroundDelay = self.$el.transitionDuration();

            $jsModal.removeClass('in');

            if (!this.model.options.animation) {
                removeModalDelay = removeBackgroundDelay = 0;
            }

            setTimeout(function () {

                if (document.body.style.filter !== undefined) {
                    $("body").removeClass("blur");
                }
                $(".modal-background").removeClass('in');

                setTimeout(function () {
                    self.remove();
                    self.$el.hide();
                    $(".modal-background").hide();
                }, removeBackgroundDelay);
            }, removeModalDelay);

        },
        // #### animate
        // Animates the animation
        animate: function (target) {
            setTimeout(function () {
                target.addClass('in');
            }, target.transitionDuration());
        }
    });

    // ## Modal Content
    Ghost.Views.Modal.ContentView = Ghost.View.extend({

        template: function (data) {
            return JST['modals/' + this.model.content.template](data);
        },
        templateData: function () {
            return this.model;
        }

    });
}());

/*global window, Ghost, $, _, Backbone, NProgress */
(function () {
    "use strict";

    var ContentList,
        ContentItem,
        PreviewContainer;

    // Base view
    // ----------
    Ghost.Views.Blog = Ghost.View.extend({
        initialize: function (options) {
            /*jshint unused:false*/
            var self = this,
                finishProgress = function () {
                    NProgress.done();
                };

            // Basic collection request/sync flow progress bar handlers
            this.listenTo(this.collection, 'request', function () {
                NProgress.start();
            });
            this.listenTo(this.collection, 'sync', finishProgress);

            // A special case because models that are destroyed are removed from the
            // collection before the sync event fires and bubbles up
            this.listenTo(this.collection, 'destroy', function (model) {
                self.listenToOnce(model, 'sync', finishProgress);
            });

            this.addSubview(new PreviewContainer({ el: '.js-content-preview', collection: this.collection })).render();
            this.addSubview(new ContentList({ el: '.js-content-list', collection: this.collection })).render();
        }
    });


    // Content list (sidebar)
    // -----------------------
    ContentList = Ghost.View.extend({

        isLoading: false,

        events: {
            'click .content-list-content'    : 'scrollHandler'
        },

        initialize: function () {
            this.$('.content-list-content').scrollClass({target: '.content-list', offset: 10});
            this.listenTo(this.collection, 'remove', this.showNext);
            this.listenTo(this.collection, 'add', this.renderPost);
            // Can't use backbone event bind (see: http://stackoverflow.com/questions/13480843/backbone-scroll-event-not-firing)
            this.$('.content-list-content').scroll($.proxy(this.checkScroll, this));
        },

        showNext: function () {
            if (this.isLoading) { return; }

            if (!this.collection.length) {
                return Backbone.trigger('blog:activeItem', null);
            }

            var id = this.collection.at(0) ? this.collection.at(0).id : false;
            if (id) {
                Backbone.trigger('blog:activeItem', id);
            }
        },

        reportLoadError: function (response) {
            var message = 'A problem was encountered while loading more posts';

            if (response) {
                // Get message from response
                message += '; ' + Ghost.Views.Utils.getRequestErrorMessage(response);
            } else {
                message += '.';
            }

            Ghost.notifications.addItem({
                type: 'error',
                message: message,
                status: 'passive'
            });
        },

        checkScroll: function (event) {
            var self = this,
                element = event.target,
                triggerPoint = 100;

            // If we haven't passed our threshold, exit
            if (this.isLoading || (element.scrollTop + element.clientHeight + triggerPoint <= element.scrollHeight)) {
                return;
            }

            // If we've loaded the max number of pages, exit
            if (this.collection.currentPage >=  this.collection.totalPages) {
                return;
            }

            // Load moar posts!
            this.isLoading = true;
            this.collection.fetch({
                update: true,
                remove: false,
                data: {
                    status: 'all',
                    page: (self.collection.currentPage + 1),
                    staticPages: 'all'
                }
            }).then(function onSuccess(response) {
                /*jshint unused:false*/
                self.render();
                self.isLoading = false;
            }, function onError(e) {
                self.reportLoadError(e);
            });
        },

        renderPost: function (model) {
            this.$('ol').append(this.addSubview(new ContentItem({model: model})).render().el);
        },

        render: function () {
            var $list = this.$('ol');

            // Clear out any pre-existing subviews.
            this.removeSubviews();

            this.collection.each(function (model) {
                $list.append(this.addSubview(new ContentItem({model: model})).render().el);
            }, this);
            this.showNext();
        }

    });

    // Content Item
    // -----------------------
    ContentItem = Ghost.View.extend({

        tagName: 'li',

        events: {
            'click a': 'setActiveItem'
        },

        active: false,

        initialize: function () {
            this.listenTo(Backbone, 'blog:activeItem', this.checkActive);
            this.listenTo(this.model, 'change:page change:featured', this.render);
            this.listenTo(this.model, 'destroy', this.removeItem);
        },

        removeItem: function () {
            var self = this;
            $.when(this.$el.slideUp()).then(function () {
                self.remove();
            });
        },

        // If the current item isn't active, we trigger the event to
        // notify a change in which item we're viewing.
        setActiveItem: function (e) {
            e.preventDefault();
            if (this.active !== true) {
                Backbone.trigger('blog:activeItem', this.model.id);
                this.render();
            }
        },

        // Checks whether this item is active and doesn't match the current id.
        checkActive: function (id) {
            if (this.model.id !== id) {
                if (this.active) {
                    this.active = false;
                    this.$el.removeClass('active');
                    this.render();
                }
            } else {
                this.active = true;
                this.$el.addClass('active');
            }
        },

        showPreview: function (e) {
            var item = $(e.currentTarget);
            this.$('.content-list-content li').removeClass('active');
            item.addClass('active');
            Backbone.trigger('blog:activeItem', item.data('id'));
        },

        templateName: "list-item",

        templateData: function () {
            return _.extend({active: this.active}, this.model.toJSON());
        }
    });

    // Content preview
    // ----------------
    PreviewContainer = Ghost.View.extend({

        activeId: null,

        events: {
            'click .post-controls .post-edit' : 'editPost',
            'click .featured' : 'toggleFeatured',
            'click .unfeatured' : 'toggleFeatured'
        },

        initialize: function () {
            this.listenTo(Backbone, 'blog:activeItem', this.setActivePreview);
        },

        setActivePreview: function (id) {
            if (this.activeId !== id) {
                this.activeId = id;
                this.render();
            }
        },

        editPost: function (e) {
            e.preventDefault();
            // for now this will disable "open in new tab", but when we have a Router implemented
            // it can go back to being a normal link to '#/ghost/editor/X'
            window.location = Ghost.paths.subdir + '/ghost/editor/' + this.model.get('id') + '/';
        },

        toggleFeatured: function (e) {
            e.preventDefault();
            var self = this,
                featured = !self.model.get('featured'),
                featuredEl = $(e.currentTarget),
                model = this.collection.get(this.activeId);

            model.save({
                featured: featured
            }, {
                success : function () {
                    featuredEl.removeClass("featured unfeatured").addClass(featured ? "featured" : "unfeatured");
                    Ghost.notifications.clearEverything();
                    Ghost.notifications.addItem({
                        type: 'success',
                        message: "Post successfully marked as " + (featured ? "featured" : "not featured") + ".",
                        status: 'passive'
                    });
                },
                error : function (model, xhr) {
                    /*jshint unused:false*/
                    Ghost.notifications.addItem({
                        type: 'error',
                        message: Ghost.Views.Utils.getRequestErrorMessage(xhr),
                        status: 'passive'
                    });
                }
            });
        },

        templateName: "preview",

        render: function () {
            var self = this;

            this.model = this.collection.get(this.activeId);
            this.$el.html(this.template(this.templateData()));

            this.$('.content-preview-content').scrollClass({target: '.content-preview', offset: 10});
            this.$('.wrapper').on('click', 'a', function (e) {
                $(e.currentTarget).attr('target', '_blank');
            });

            if (this.model !== undefined) {
                this.model.fetch({ data: { status: 'all', include: 'tags,author' } }).then(function () {
                    self.addSubview(new Ghost.View.PostSettings({ el: $('.post-controls'), model: self.model })).render();
                });
            }

            Ghost.temporary.initToggles(this.$el);
            return this;
        }
    });

}());

/*global Ghost, $ */
(function () {
    "use strict";

    Ghost.Views.Debug = Ghost.View.extend({
        events: {
            "click .settings-menu a": "handleMenuClick",
            "click #startupload": "handleUploadClick",
            "click .js-delete": "handleDeleteClick",
            "click #sendtestmail": "handleSendTestMailClick"
        },

        initialize: function () {
            var view = this;

            this.uploadButton = this.$el.find('#startupload');

            // Disable import button and initizalize BlueImp file upload
            this.uploadButton.prop('disabled', 'disabled');
            $('#importfile').fileupload({
                url: Ghost.paths.apiRoot + '/db/',
                limitMultiFileUploads: 1,
                replaceFileInput: false,
                headers: {
                    'X-CSRF-Token': $("meta[name='csrf-param']").attr('content')
                },
                dataType: 'json',
                add: function (e, data) {
                    /*jshint unused:false*/

                    // Bind the upload data to the view, so it is
                    // available to the click handler, and enable the
                    // upload button.
                    view.fileUploadData = data;
                    data.context = view.uploadButton.removeProp('disabled');
                },
                done: function (e, data) {
                    /*jshint unused:false*/
                    $('#startupload').text('Import');
                    if (!data.result) {
                        throw new Error('No response received from server.');
                    }
                    if (!data.result.message) {
                        throw new Error('Unknown error');
                    }

                    Ghost.notifications.addItem({
                        type: 'success',
                        message: data.result.message,
                        status: 'passive'
                    });
                },
                error: function (response) {
                    $('#startupload').text('Import');
                    var responseJSON = response.responseJSON,
                        message = responseJSON && responseJSON.errors[0].message ? responseJSON.errors[0].message : 'unknown';
                    Ghost.notifications.addItem({
                        type: 'error',
                        message: ['A problem was encountered while importing new content to your blog. Error: ', message].join(''),
                        status: 'passive'
                    });
                }

            });

        },

        handleMenuClick: function (ev) {
            ev.preventDefault();

            var $target = $(ev.currentTarget);

            // Hide the current content
            this.$(".settings-content").hide();

            // Show the clicked content
            this.$("#debug-" + $target.attr("class")).show();

            return false;
        },

        handleUploadClick: function (ev) {
            ev.preventDefault();

            if (!this.uploadButton.prop('disabled')) {
                this.fileUploadData.context = this.uploadButton.text('Importing');
                this.fileUploadData.submit();
            }

            // Prevent double post by disabling the button.
            this.uploadButton.prop('disabled', 'disabled');
        },

        handleDeleteClick: function (ev) {
            ev.preventDefault();
            this.addSubview(new Ghost.Views.Modal({
                model: {
                    options: {
                        close: true,
                        confirm: {
                            accept: {
                                func: function () {
                                    $.ajax({
                                        url: Ghost.paths.apiRoot + '/db/',
                                        type: 'DELETE',
                                        headers: {
                                            'X-CSRF-Token': $("meta[name='csrf-param']").attr('content')
                                        },
                                        success: function onSuccess(response) {
                                            if (!response) {
                                                throw new Error('No response received from server.');
                                            }
                                            if (!response.message) {
                                                throw new Error(response.detail || 'Unknown error');
                                            }

                                            Ghost.notifications.addItem({
                                                type: 'success',
                                                message: response.message,
                                                status: 'passive'
                                            });

                                        },
                                        error: function onError(response) {
                                            var responseText = JSON.parse(response.responseText),
                                                message = responseText && responseText.errors[0].message ? responseText.errors[0].message : 'unknown';
                                            Ghost.notifications.addItem({
                                                type: 'error',
                                                message: ['A problem was encountered while deleting content from your blog. Error: ', message].join(''),
                                                status: 'passive'
                                            });

                                        }
                                    });
                                },
                                text: "Delete",
                                buttonClass: "button-delete"
                            },
                            reject: {
                                func: function () {
                                    return true;
                                },
                                text: "Cancel",
                                buttonClass: "button"
                            }
                        },
                        type: "action",
                        style: ["wide", "centered"],
                        animation: 'fade'
                    },
                    content: {
                        template: 'blank',
                        title: 'Would you really like to delete all content from your blog?',
                        text: '<p>This is permanent! No backups, no restores, no magic undo button. <br /> We warned you, ok?</p>'
                    }
                }
            }));
        },
        
        handleSendTestMailClick: function (ev) {
            ev.preventDefault();
        
            $.ajax({
                url: Ghost.paths.apiRoot + '/mail/test/',
                type: 'POST',
                headers: {
                    'X-CSRF-Token': $("meta[name='csrf-param']").attr('content')
                },
                success: function onSuccess(response) {
                    Ghost.notifications.addItem({
                        type: 'success',
                        message: ['Check your email for the test message: ', response.message].join(''),
                        status: 'passive'
                    });
                },
                error: function onError(response) {
                    var responseText = JSON.parse(response.responseText),
                        message = responseText && responseText.errors[0].message ? responseText.errors[0].message : 'unknown';
                    Ghost.notifications.addItem({
                        type: 'error',
                        message: ['A problem was encountered while sending the test email: ', message].join(''),
                        status: 'passive'
                    });

                }
            });
        },
    });
}());

// The Save / Publish button

/*global $, _, Ghost, shortcut */

(function () {
    'use strict';

    // The Publish, Queue, Publish Now buttons
    // ----------------------------------------
    Ghost.View.EditorActionsWidget = Ghost.View.extend({

        events: {
            'click [data-set-status]': 'handleStatus',
            'click .js-publish-button': 'handlePostButton'
        },

        statusMap: null,

        createStatusMap: {
            'draft': 'Save Draft',
            'published': 'Publish Now'
        },

        updateStatusMap: {
            'draft': 'Unpublish',
            'published': 'Update Post'
        },

        //TODO: This has to be moved to the I18n localization file.
        //This structure is supposed to be close to the i18n-localization which will be used soon.
        messageMap: {
            errors: {
                post: {
                    published: {
                        'published': 'Your post could not be updated.',
                        'draft': 'Your post could not be saved as a draft.'
                    },
                    draft: {
                        'published': 'Your post could not be published.',
                        'draft': 'Your post could not be saved as a draft.'
                    }

                }
            },

            success: {
                post: {
                    published: {
                        'published': 'Your post has been updated.',
                        'draft': 'Your post has been saved as a draft.'
                    },
                    draft: {
                        'published': 'Your post has been published.',
                        'draft': 'Your post has been saved as a draft.'
                    }
                }
            }
        },

        initialize: function () {
            var self = this;

            // Toggle publish
            shortcut.add('Ctrl+Alt+P', function () {
                self.toggleStatus();
            });
            shortcut.add('Ctrl+S', function () {
                self.updatePost();
            });
            shortcut.add('Meta+S', function () {
                self.updatePost();
            });
            this.listenTo(this.model, 'change:status', this.render);
        },

        toggleStatus: function () {
            var self = this,
                keys = Object.keys(this.statusMap),
                model = self.model,
                prevStatus = model.get('status'),
                currentIndex = keys.indexOf(prevStatus),
                newIndex,
                status;

            newIndex = currentIndex + 1 > keys.length - 1 ? 0 : currentIndex + 1;
            status = keys[newIndex];

            this.setActiveStatus(keys[newIndex], this.statusMap[status], prevStatus);

            this.savePost({
                status: keys[newIndex]
            }).then(function () {
                    self.reportSaveSuccess(status, prevStatus);
                }, function (xhr) {
                    // Show a notification about the error
                    self.reportSaveError(xhr, model, status, prevStatus);
                });
        },

        setActiveStatus: function (newStatus, displayText, currentStatus) {
            var isPublishing = (newStatus === 'published' && currentStatus !== 'published'),
                isUnpublishing = (newStatus === 'draft' && currentStatus === 'published'),
            // Controls when background of button has the splitbutton-delete/button-delete classes applied
                isImportantStatus = (isPublishing || isUnpublishing);

            $('.js-publish-splitbutton')
                .removeClass(isImportantStatus ? 'splitbutton-save' : 'splitbutton-delete')
                .addClass(isImportantStatus ? 'splitbutton-delete' : 'splitbutton-save');

            // Set the publish button's action and proper coloring
            $('.js-publish-button')
                .attr('data-status', newStatus)
                .text(displayText)
                .removeClass(isImportantStatus ? 'button-save' : 'button-delete')
                .addClass(isImportantStatus ? 'button-delete' : 'button-save');

            // Remove the animated popup arrow
            $('.js-publish-splitbutton > a')
                .removeClass('active');

            // Set the active action in the popup
            $('.js-publish-splitbutton .editor-options li')
                .removeClass('active')
                .filter(['li[data-set-status="', newStatus, '"]'].join(''))
                .addClass('active');
        },

        handleStatus: function (e) {
            if (e) { e.preventDefault(); }
            var status = $(e.currentTarget).attr('data-set-status'),
                currentStatus = this.model.get('status');

            this.setActiveStatus(status, this.statusMap[status], currentStatus);

            // Dismiss the popup menu
            $('body').find('.overlay:visible').fadeOut();
        },

        handlePostButton: function (e) {
            if (e) { e.preventDefault(); }
            var status = $(e.currentTarget).attr('data-status');

            this.updatePost(status);
        },

        updatePost: function (status) {
            var self = this,
                model = this.model,
                prevStatus = model.get('status');

            // Default to same status if not passed in
            status = status || prevStatus;

            model.trigger('willSave');

            this.savePost({
                status: status
            }).then(function () {
                    self.reportSaveSuccess(status, prevStatus);
                    // Refresh publish button and all relevant controls with updated status.
                    self.render();
                }, function (xhr) {
                    // Set the model status back to previous
                    model.set({ status: prevStatus });
                    // Set appropriate button status
                    self.setActiveStatus(status, self.statusMap[status], prevStatus);
                    // Show a notification about the error
                    self.reportSaveError(xhr, model, status, prevStatus);
                });
        },

        savePost: function (data) {
            var publishButton = $('.js-publish-button'),
                saved,
                enablePublish = function (deferred) {
                    deferred.always(function () {
                        publishButton.prop('disabled', false);
                    });
                    return deferred;
                };

            publishButton.prop('disabled', true);

            _.each(this.model.blacklist, function (item) {
                this.model.unset(item);
            }, this);

            saved = this.model.save(_.extend({
                title: this.options.$title.val(),
                markdown: this.options.editor.value()
            }, data));

            // TODO: Take this out if #2489 gets merged in Backbone. Or patch Backbone
            // ourselves for more consistent promises.
            if (saved) {
                return enablePublish(saved);
            }

            return enablePublish($.Deferred().reject());
        },

        reportSaveSuccess: function (status, prevStatus) {
            Ghost.notifications.clearEverything();
            Ghost.notifications.addItem({
                type: 'success',
                message: this.messageMap.success.post[prevStatus][status],
                status: 'passive'
            });
            this.options.editor.setDirty(false);
        },

        reportSaveError: function (response, model, status, prevStatus) {
            var message = this.messageMap.errors.post[prevStatus][status];

            if (response) {
                // Get message from response
                message += ' ' + Ghost.Views.Utils.getRequestErrorMessage(response);
            } else if (model.validationError) {
                // Grab a validation error
                message += ' ' + model.validationError;
            }

            Ghost.notifications.clearEverything();
            Ghost.notifications.addItem({
                type: 'error',
                message: message,
                status: 'passive'
            });
        },

        setStatusLabels: function (statusMap) {
            _.each(statusMap, function (label, status) {
                $('li[data-set-status="' + status + '"] > a').text(label);
            });
        },

        render: function () {
            var status = this.model.get('status');

            // Assume that we're creating a new post
            if (status !== 'published') {
                this.statusMap = this.createStatusMap;
            } else {
                this.statusMap = this.updateStatusMap;
            }

            // Populate the publish menu with the appropriate verbiage
            this.setStatusLabels(this.statusMap);

            // Default the selected publish option to the current status of the post.
            this.setActiveStatus(status, this.statusMap[status], status);
        }

    });
}());
// The Tag UI area associated with a post

/*global window, document, setTimeout, $, _, Ghost */

(function () {
    "use strict";

    Ghost.View.EditorTagWidget = Ghost.View.extend({

        events: {
            'keyup [data-input-behaviour="tag"]': 'handleKeyup',
            'keydown [data-input-behaviour="tag"]': 'handleKeydown',
            'keypress [data-input-behaviour="tag"]': 'handleKeypress',
            'click ul.suggestions li': 'handleSuggestionClick',
            'click .tags .tag': 'handleTagClick',
            'click .tag-label': 'mobileTags'
        },

        keys: {
            UP: 38,
            DOWN: 40,
            ESC: 27,
            ENTER: 13,
            BACKSPACE: 8
        },

        initialize: function () {
            var self = this,
                tagCollection = new Ghost.Collections.Tags();

            tagCollection.fetch().then(function () {
                self.allGhostTags = tagCollection.toJSON();
            });

            this.listenTo(this.model, 'willSave', this.completeCurrentTag, this);
        },

        render: function () {
            var tags = this.model.get('tags'),
                $tags = $('.tags'),
                tagOffset,
                self = this;

            $tags.empty();

            if (tags) {
                _.forEach(tags, function (tag) {
                    var $tag = $('<span class="tag" data-tag-id="' + tag.id + '">' + _.escape(tag.name) + '</span>');
                    $tags.append($tag);
                    $("[data-tag-id=" + tag.id + "]")[0].scrollIntoView(true);
                });
            }

            this.$suggestions = $("ul.suggestions").hide(); // Initialise suggestions overlay

            if ($tags.length) {
                tagOffset = $('.tag-input').offset().left;
                $('.tag-blocks').css({'left': tagOffset + 'px'});
            }

            $(window).on('resize', self.resize).trigger('resize');

            $('.tag-label').on('touchstart', function () {
                $(this).addClass('touch');
            });

            return this;
        },

        mobileTags: function () {
            var mq = window.matchMedia("(max-width: 400px)"),
                publishBar = $("#publish-bar");
            if (mq.matches) {

                if (publishBar.hasClass("extended-tags")) {
                    publishBar.css("top", "auto").animate({"height": "40px"}, 300, "swing", function () {
                        $(this).removeClass("extended-tags");
                        $(".tag-input").blur();
                    });
                } else {
                    publishBar.animate({"top": 0, "height": $(window).height()}, 300, "swing", function () {
                        $(this).addClass("extended-tags");
                        $(".tag-input").focus();
                    });
                }

                $(".tag-input").one("blur", function () {

                    if (publishBar.hasClass("extended-tags") && !$(':hover').last().hasClass("tag")) {
                        publishBar.css("top", "auto").animate({"height": "40px"}, 300, "swing", function () {
                            $(this).removeClass("extended-tags");
                            $(document.activeElement).blur();
                            document.documentElement.style.display = "none";
                            setTimeout(function () { document.documentElement.style.display = 'block'; }, 0);
                        });
                    }
                });

                window.scrollTo(0, 1);
            }
        },

        showSuggestions: function ($target, _searchTerm) {
            var searchTerm = _searchTerm.toLowerCase(),
                matchingTags = this.findMatchingTags(searchTerm),
                styles = {
                    left: $target.position().left
                },
                // Limit the suggestions number
                maxSuggestions = 5,
                // Escape regex special characters
                escapedTerm = searchTerm.replace(/[\-\/\\\^$*+?.()|\[\]{}]/g, '\\$&'),
                regexTerm = escapedTerm.replace(/(\s+)/g, "(<[^>]+>)*$1(<[^>]+>)*"),
                regexPattern = new RegExp("(" + regexTerm + ")", "i");

            this.$suggestions.css(styles);
            this.$suggestions.html("");

            matchingTags = _.first(matchingTags, maxSuggestions);
            if (matchingTags.length > 0) {
                this.$suggestions.show();
            }
            _.each(matchingTags, function (matchingTag) {
                var highlightedName,
                    suggestionHTML;

                highlightedName = matchingTag.name.replace(regexPattern, function (match, p1) {
                    return "<mark>" + _.escape(p1) + "</mark>";
                });
                /*jslint regexp: true */ // - would like to remove this
                highlightedName = highlightedName.replace(/(<mark>[^<>]*)((<[^>]+>)+)([^<>]*<\/mark>)/, function (match, p1, p2, p3, p4) {
                    return _.escape(p1) + '</mark>' + _.escape(p2) + '<mark>' + _.escape(p4);
                });
                
                suggestionHTML = "<li data-tag-id='" + matchingTag.id + "' data-tag-name='" + _.escape(matchingTag.name) + "'><a href='#'>" + highlightedName + "</a></li>";
                this.$suggestions.append(suggestionHTML);
            }, this);
        },

        handleKeyup: function (e) {
            var $target = $(e.currentTarget),
                searchTerm = $.trim($target.val());

            if (e.keyCode === this.keys.UP) {
                e.preventDefault();
                if (this.$suggestions.is(":visible")) {
                    if (this.$suggestions.children(".selected").length === 0) {
                        this.$suggestions.find("li:last-child").addClass('selected');
                    } else {
                        this.$suggestions.children(".selected").removeClass('selected').prev().addClass('selected');
                    }
                }
            } else if (e.keyCode === this.keys.DOWN) {
                e.preventDefault();
                if (this.$suggestions.is(":visible")) {
                    if (this.$suggestions.children(".selected").length === 0) {
                        this.$suggestions.find("li:first-child").addClass('selected');
                    } else {
                        this.$suggestions.children(".selected").removeClass('selected').next().addClass('selected');
                    }
                }
            } else if (e.keyCode === this.keys.ESC) {
                this.$suggestions.hide();
            } else {
                if (searchTerm) {
                    this.showSuggestions($target, searchTerm);
                } else {
                    this.$suggestions.hide();
                }
            }

            if (e.keyCode === this.keys.UP || e.keyCode === this.keys.DOWN) {
                return false;
            }
        },

        handleKeydown: function (e) {
            var $target = $(e.currentTarget),
                lastBlock,
                tag;
            // Delete character tiggers on Keydown, so needed to check on that event rather than Keyup.
            if (e.keyCode === this.keys.BACKSPACE && !$target.val()) {
                lastBlock = this.$('.tags').find('.tag').last();
                lastBlock.remove();
                tag = {id: lastBlock.data('tag-id'), name: lastBlock.text()};
                this.model.removeTag(tag);
            }
        },

        handleKeypress: function (e) {
            var $target = $(e.currentTarget),
                searchTerm = $.trim($target.val()),
                tag,
                $selectedSuggestion,
                isComma = ",".localeCompare(String.fromCharCode(e.keyCode || e.charCode)) === 0,
                hasAlreadyBeenAdded;

            // use localeCompare in case of international keyboard layout
            if ((e.keyCode === this.keys.ENTER || isComma) && searchTerm) {
                // Submit tag using enter or comma key
                e.preventDefault();

                $selectedSuggestion = this.$suggestions.children(".selected");
                if (this.$suggestions.is(":visible") && $selectedSuggestion.length !== 0) {
                    tag = {id: $selectedSuggestion.data('tag-id'), name: _.unescape($selectedSuggestion.data('tag-name'))};
                    hasAlreadyBeenAdded = this.hasTagBeenAdded(tag.name);
                    if (!hasAlreadyBeenAdded) {
                        this.addTag(tag);
                    }
                } else {
                    if (isComma) {
                        // Remove comma from string if comma is used to submit.
                        searchTerm = searchTerm.replace(/,/g, "");
                    }

                    hasAlreadyBeenAdded = this.hasTagBeenAdded(searchTerm);
                    if (!hasAlreadyBeenAdded) {
                        this.addTag({id: null, name: searchTerm});
                    }
                }
                $target.val('').focus();
                searchTerm = ""; // Used to reset search term
                this.$suggestions.hide();
            }
        },

        completeCurrentTag: function () {
            var $target = this.$('.tag-input'),
                tagName = $target.val(),
                hasAlreadyBeenAdded;

            hasAlreadyBeenAdded = this.hasTagBeenAdded(tagName);

            if (tagName.length > 0 && !hasAlreadyBeenAdded) {
                this.addTag({id: null, name: tagName});
            }
        },

        handleSuggestionClick: function (e) {
            var $target = $(e.currentTarget);
            if (e) { e.preventDefault(); }
            this.addTag({id: $target.data('tag-id'), name: _.unescape($target.data('tag-name'))});
        },

        handleTagClick: function (e) {
            var $tag = $(e.currentTarget),
                tag = {id: $tag.data('tag-id'), name: $tag.text()};
            $tag.remove();
            window.scrollTo(0, 1);
            this.model.removeTag(tag);
        },

        resize: _.throttle(function () {
            var $tags = $('.tags');
            if ($(window).width() > 400) {
                $tags.css("max-width", $("#entry-tags").width() - 320);
            } else {
                $tags.css("max-width", "inherit");
            }
        }, 50),

        findMatchingTags: function (searchTerm) {
            var matchingTagModels,
                self = this;

            if (!this.allGhostTags) {
                return [];
            }

            searchTerm = searchTerm.toUpperCase();
            matchingTagModels = _.filter(this.allGhostTags, function (tag) {
                var tagNameMatches,
                    hasAlreadyBeenAdded;

                tagNameMatches = tag.name.toUpperCase().indexOf(searchTerm) !== -1;

                hasAlreadyBeenAdded = self.hasTagBeenAdded(tag.name);

                return tagNameMatches && !hasAlreadyBeenAdded;
            });

            return matchingTagModels;
        },

        addTag: function (tag) {
            var $tag = $('<span class="tag" data-tag-id="' + tag.id + '">' + _.escape(tag.name) + '</span>');
            this.$('.tags').append($tag);
            $(".tag").last()[0].scrollIntoView(true);
            window.scrollTo(0, 1);
            this.model.addTag(tag);

            this.$('.tag-input').val('').focus();
            this.$suggestions.hide();
        },

        hasTagBeenAdded: function (tagName) {
            return _.some(this.model.get('tags'), function (usedTag) {
                return tagName.toUpperCase() === usedTag.name.toUpperCase();
            });
        }
    });

}());

// # Article Editor

/*global document, setTimeout, navigator, $, Backbone, Ghost, shortcut */
(function () {
    'use strict';

    var PublishBar;

    // The publish bar associated with a post, which has the TagWidget and
    // Save button and options and such.
    // ----------------------------------------
    PublishBar = Ghost.View.extend({

        initialize: function () {

            this.addSubview(new Ghost.View.EditorTagWidget(
                {el: this.$('#entry-tags'), model: this.model}
            )).render();
            this.addSubview(new Ghost.View.PostSettings(
                {el: $('#entry-controls'), model: this.model}
            )).render();

            // Pass the Actions widget references to the title and editor so that it can get
            // the values that need to be saved
            this.addSubview(new Ghost.View.EditorActionsWidget(
                {
                    el: this.$('#entry-actions'),
                    model: this.model,
                    $title: this.options.$title,
                    editor: this.options.editor
                }
            )).render();

        },

        render: function () { return this; }
    });


    // The entire /editor page's route
    // ----------------------------------------
    Ghost.Views.Editor = Ghost.View.extend({

        events: {
            'click .markdown-help': 'showHelp',
            'blur #entry-title': 'trimTitle',
            'orientationchange': 'orientationChange'
        },

        initialize: function () {
            this.$title = this.$('#entry-title');
            this.$editor = this.$('#entry-markdown');

            this.$title.val(this.model.get('title')).focus();
            this.$editor.text(this.model.get('markdown'));

            // Create a new editor
            this.editor = new Ghost.Editor.Main();

            // Add the container view for the Publish Bar
            // Passing reference to the title and editor
            this.addSubview(new PublishBar(
                {el: '#publish-bar', model: this.model, $title: this.$title, editor: this.editor}
            )).render();

            this.listenTo(this.model, 'change:title', this.renderTitle);
            this.listenTo(this.model, 'change:id', this.handleIdChange);

            this.bindShortcuts();

            $('.entry-markdown header, .entry-preview header').on('click', function (e) {
                $('.entry-markdown, .entry-preview').removeClass('active');
                $(e.currentTarget).closest('section').addClass('active');
            });
        },

        bindShortcuts: function () {
            var self = this;

             // Zen writing mode shortcut - full editor view
            shortcut.add('Alt+Shift+Z', function () {
                $('body').toggleClass('zen');
            });

            // HTML copy & paste
            shortcut.add('Ctrl+Alt+C', function () {
                self.showHTML();
            });
        },

        trimTitle: function () {
            var rawTitle = this.$title.val(),
                trimmedTitle = $.trim(rawTitle);

            if (rawTitle !== trimmedTitle) {
                this.$title.val(trimmedTitle);
            }

            // Trigger title change for post-settings.js
            this.model.set('title', trimmedTitle);
        },

        renderTitle: function () {
            this.$title.val(this.model.get('title'));
        },

        handleIdChange: function (m) {
            // This is a special case for browsers which fire an unload event when using navigate. The id change
            // happens before the save success and can cause the unload alert to appear incorrectly on first save
            // The id only changes in the event that the save has been successful, so this workaround is safes
            this.editor.setDirty(false);
            Backbone.history.navigate('/editor/' + m.id + '/');
        },

        // This is a hack to remove iOS6 white space on orientation change bug
        // See: http://cl.ly/RGx9
        orientationChange: function () {
            if (/iPhone/.test(navigator.userAgent) && !/Opera Mini/.test(navigator.userAgent)) {
                var focusedElement = document.activeElement,
                    s = document.documentElement.style;
                focusedElement.blur();
                s.display = 'none';
                setTimeout(function () { s.display = 'block'; focusedElement.focus(); }, 0);
            }
        },

        showEditorModal: function (content) {
            this.addSubview(new Ghost.Views.Modal({
                model: {
                    options: {
                        close: true,
                        style: ['wide'],
                        animation: 'fade'
                    },
                    content: content
                }
            }));
        },

        showHelp: function () {
            var content = {
                template: 'markdown',
                title: 'Markdown Help'
            };
            this.showEditorModal(content);
        },

        showHTML: function () {
            var content = {
                template: 'copyToHTML',
                title: 'Copied HTML'
            };
            this.showEditorModal(content);
        },

        render: function () { return this; }
    });
}());
/*global window, Ghost, $, validator */
(function () {
    "use strict";

    Ghost.Views.Login = Ghost.View.extend({

        initialize: function () {
            this.render();
        },

        templateName: "login",

        events: {
            'submit #login': 'submitHandler'
        },

        afterRender: function () {
            var self = this;
            this.$el.css({"opacity": 0}).animate({"opacity": 1}, 500, function () {
                self.$("[name='email']").focus();
            });
        },

        submitHandler: function (event) {
            event.preventDefault();
            var email = this.$el.find('.email').val(),
                password = this.$el.find('.password').val(),
                redirect = Ghost.Views.Utils.getUrlVariables().r,
                validationErrors = [];

            if (!validator.isEmail(email)) {
                validationErrors.push("Invalid Email");
            }

            if (!validator.isLength(password, 0)) {
                validationErrors.push("Please enter a password");
            }

            if (validationErrors.length) {
                validator.handleErrors(validationErrors);
            } else {
                $.ajax({
                    url: Ghost.paths.subdir + '/ghost/signin/',
                    type: 'POST',
                    headers: {
                        'X-CSRF-Token': $("meta[name='csrf-param']").attr('content')
                    },
                    data: {
                        email: email,
                        password: password,
                        redirect: redirect
                    },
                    success: function (msg) {
                        window.location.href = msg.redirect;
                    },
                    error: function (xhr) {
                        Ghost.notifications.clearEverything();
                        Ghost.notifications.addItem({
                            type: 'error',
                            message: Ghost.Views.Utils.getRequestErrorMessage(xhr),
                            status: 'passive'
                        });
                    }
                });
            }
        }
    });

    Ghost.Views.Signup = Ghost.View.extend({

        initialize: function () {
            this.submitted = "no";
            this.render();
        },

        templateName: "signup",

        events: {
            'submit #signup': 'submitHandler'
        },

        afterRender: function () {
            var self = this;

            this.$el
                .css({"opacity": 0})
                .animate({"opacity": 1}, 500, function () {
                    self.$("[name='name']").focus();
                });
        },

        submitHandler: function (event) {
            event.preventDefault();
            var name = this.$('.name').val(),
                email = this.$('.email').val(),
                password = this.$('.password').val(),
                validationErrors = [],
                self = this;

            if (!validator.isLength(name, 1)) {
                validationErrors.push("Please enter a name.");
            }

            if (!validator.isEmail(email)) {
                validationErrors.push("Please enter a correct email address.");
            }

            if (!validator.isLength(password, 0)) {
                validationErrors.push("Please enter a password");
            }

            if (!validator.equals(this.submitted, "no")) {
                validationErrors.push("Ghost is signing you up. Please wait...");
            }

            if (validationErrors.length) {
                validator.handleErrors(validationErrors);
            } else {
                this.submitted = "yes";
                $.ajax({
                    url: Ghost.paths.subdir + '/ghost/signup/',
                    type: 'POST',
                    headers: {
                        'X-CSRF-Token': $("meta[name='csrf-param']").attr('content')
                    },
                    data: {
                        name: name,
                        email: email,
                        password: password
                    },
                    success: function (msg) {
                        window.location.href = msg.redirect;
                    },
                    error: function (xhr) {
                        self.submitted = "no";
                        Ghost.notifications.clearEverything();
                        Ghost.notifications.addItem({
                            type: 'error',
                            message: Ghost.Views.Utils.getRequestErrorMessage(xhr),
                            status: 'passive'
                        });
                    }
                });
            }
        }
    });

    Ghost.Views.Forgotten = Ghost.View.extend({

        initialize: function () {
            this.render();
        },

        templateName: "forgotten",

        events: {
            'submit #forgotten': 'submitHandler'
        },

        afterRender: function () {
            var self = this;
            this.$el.css({"opacity": 0}).animate({"opacity": 1}, 500, function () {
                self.$("[name='email']").focus();
            });
        },

        submitHandler: function (event) {
            event.preventDefault();

            var email = this.$el.find('.email').val(),
                validationErrors = [];

            if (!validator.isEmail(email)) {
                validationErrors.push("Please enter a correct email address.");
            }

            if (validationErrors.length) {
                validator.handleErrors(validationErrors);
            } else {
                $.ajax({
                    url: Ghost.paths.subdir + '/ghost/forgotten/',
                    type: 'POST',
                    headers: {
                        'X-CSRF-Token': $("meta[name='csrf-param']").attr('content')
                    },
                    data: {
                        email: email
                    },
                    success: function (msg) {

                        window.location.href = msg.redirect;
                    },
                    error: function (xhr) {
                        Ghost.notifications.clearEverything();
                        Ghost.notifications.addItem({
                            type: 'error',
                            message: Ghost.Views.Utils.getRequestErrorMessage(xhr),
                            status: 'passive'
                        });
                    }
                });
            }
        }
    });

    Ghost.Views.ResetPassword = Ghost.View.extend({
        templateName: 'reset',

        events: {
            'submit #reset': 'submitHandler'
        },

        initialize: function (attrs) {
            attrs = attrs || {};

            this.token = attrs.token;

            this.render();
        },

        afterRender: function () {
            var self = this;
            this.$el.css({"opacity": 0}).animate({"opacity": 1}, 500, function () {
                self.$("[name='newpassword']").focus();
            });
        },

        submitHandler: function (ev) {
            ev.preventDefault();

            var self = this,
                newPassword = this.$('input[name="newpassword"]').val(),
                ne2Password = this.$('input[name="ne2password"]').val();

            if (newPassword !== ne2Password) {
                Ghost.notifications.clearEverything();
                Ghost.notifications.addItem({
                    type: 'error',
                    message: "Your passwords do not match.",
                    status: 'passive'
                });

                return;
            }

            this.$('input, button').prop('disabled', true);

            $.ajax({
                url: Ghost.paths.subdir + '/ghost/reset/' + this.token + '/',
                type: 'POST',
                headers: {
                    'X-CSRF-Token': $("meta[name='csrf-param']").attr('content')
                },
                data: {
                    newpassword: newPassword,
                    ne2password: ne2Password
                },
                success: function (msg) {
                    window.location.href = msg.redirect;
                },
                error: function (xhr) {
                    self.$('input, button').prop('disabled', false);

                    Ghost.notifications.clearEverything();
                    Ghost.notifications.addItem({
                        type: 'error',
                        message: Ghost.Views.Utils.getRequestErrorMessage(xhr),
                        status: 'passive'
                    });
                }
            });

            return false;
        }
    });
}());

// The Post Settings Menu available in the content preview screen, as well as the post editor.

/*global window, $, _, Ghost, moment */

(function () {
    "use strict";

    var parseDateFormats = ["DD MMM YY HH:mm", "DD MMM YYYY HH:mm", "DD/MM/YY HH:mm", "DD/MM/YYYY HH:mm",
            "DD-MM-YY HH:mm", "DD-MM-YYYY HH:mm", "YYYY-MM-DD HH:mm"],
        displayDateFormat = 'DD MMM YY @ HH:mm';

    Ghost.View.PostSettings = Ghost.View.extend({

        events: {
            'blur  .post-setting-slug' : 'editSlug',
            'click .post-setting-slug' : 'selectSlug',
            'blur  .post-setting-date' : 'editDate',
            'click .post-setting-static-page' : 'toggleStaticPage',
            'click .delete' : 'deletePost'
        },

        initialize: function () {
            if (this.model) {
                // These three items can be updated outside of the post settings menu, so have to be listened to.
                this.listenTo(this.model, 'change:id', this.render);
                this.listenTo(this.model, 'change:title', this.updateSlugPlaceholder);
                this.listenTo(this.model, 'change:published_at', this.updatePublishedDate);
            }
        },

        render: function () {
            var slug = this.model ? this.model.get('slug') : '',
                pubDate = this.model ? this.model.get('published_at') : 'Not Published',
                $pubDateEl = this.$('.post-setting-date'),
                $postSettingSlugEl = this.$('.post-setting-slug');

            $postSettingSlugEl.val(slug);

            // Update page status test if already a page.
            if (this.model && this.model.get('page')) {
                $('.post-setting-static-page').prop('checked', this.model.get('page'));
            }

            // Insert the published date, and make it editable if it exists.
            if (this.model && this.model.get('published_at')) {
                pubDate = moment(pubDate).format(displayDateFormat);
                $pubDateEl.attr('placeholder', '');
            } else {
                $pubDateEl.attr('placeholder', moment().format(displayDateFormat));
            }

            if (this.model && this.model.get('id')) {
                this.$('.post-setting-page').removeClass('hidden');
                this.$('.delete').removeClass('hidden');
            }

            // Apply different style for model's that aren't
            // yet persisted to the server.
            // Mostly we're hiding the delete post UI
            if (this.model.id === undefined) {
                this.$el.addClass('unsaved');
            } else {
                this.$el.removeClass('unsaved');
            }

            $pubDateEl.val(pubDate);
        },

        // Requests a new slug when the title was changed
        updateSlugPlaceholder: function () {
            var title = this.model.get('title'),
                $postSettingSlugEl = this.$('.post-setting-slug');

            // If there's a title present we want to
            // validate it against existing slugs in the db
            // and then update the placeholder value.
            if (title) {
                $.ajax({
                    url: Ghost.paths.apiRoot + '/slugs/post/' + encodeURIComponent(title) + '/',
                    success: function (result) {
                        $postSettingSlugEl.attr('placeholder', result);
                    }
                });
            } else {
                // If there's no title set placeholder to blank
                // and don't make an ajax request to server
                // for a proper slug (as there won't be any).
                $postSettingSlugEl.attr('placeholder', '');
                return;
            }
        },

        selectSlug: function (e) {
            e.currentTarget.select();
        },

        editSlug: _.debounce(function (e) {
            e.preventDefault();
            var self = this,
                slug = self.model.get('slug'),
                slugEl = e.currentTarget,
                newSlug = slugEl.value,
                placeholder = slugEl.placeholder;

            newSlug = (_.isEmpty(newSlug) && placeholder) ? placeholder : newSlug;

            // If the model doesn't currently
            // exist on the server (aka has no id)
            // then just update the model's value
            if (self.model.id === undefined) {
                this.model.set({
                    slug: newSlug
                });
                return;
            }

            // Ignore unchanged slugs
            if (slug === newSlug) {
                slugEl.value = slug === undefined ? '' : slug;
                return;
            }

            this.model.save({
                slug: newSlug
            }, {
                success : function (model, response, options) {
                    /*jshint unused:false*/
                    // Repopulate slug in case it changed on the server (e.g. 'new-slug-2')
                    slugEl.value = model.get('slug');
                    Ghost.notifications.addItem({
                        type: 'success',
                        message: "Permalink successfully changed to <strong>" + model.get('slug') + '</strong>.',
                        status: 'passive'
                    });
                },
                error : function (model, xhr) {
                    /*jshint unused:false*/
                    slugEl.value = model.previous('slug');
                    Ghost.notifications.addItem({
                        type: 'error',
                        message: Ghost.Views.Utils.getRequestErrorMessage(xhr),
                        status: 'passive'
                    });
                }
            });
        }, 500),


        updatePublishedDate: function () {
            var pubDate = this.model.get('published_at') ? moment(this.model.get('published_at'))
                    .format(displayDateFormat) : '',
                $pubDateEl = this.$('.post-setting-date');

            // Only change the date if it's different
            if (pubDate && $pubDateEl.val() !== pubDate) {
                $pubDateEl.val(pubDate);
            }
        },

        editDate: _.debounce(function (e) {
            e.preventDefault();
            var self = this,
                errMessage = '',
                pubDate = self.model.get('published_at') ? moment(self.model.get('published_at'))
                    .format(displayDateFormat) : '',
                pubDateEl = e.currentTarget,
                newPubDate = pubDateEl.value,
                pubDateMoment,
                newPubDateMoment;

            // if there is no new pub date do nothing
            if (!newPubDate) {
                return;
            }

            // Check for missing time stamp on new data
            // If no time specified, add a 12:00
            if (newPubDate && !newPubDate.slice(-5).match(/\d+:\d\d/)) {
                newPubDate += " 12:00";
            }

            newPubDateMoment = moment(newPubDate, parseDateFormats);

            // If there was a published date already set
            if (pubDate) {
                 // Check for missing time stamp on current model
                // If no time specified, add a 12:00
                if (!pubDate.slice(-5).match(/\d+:\d\d/)) {
                    pubDate += " 12:00";
                }

                pubDateMoment = moment(pubDate, parseDateFormats);

                 // Ensure the published date has changed
                if (newPubDate.length === 0 || pubDateMoment.isSame(newPubDateMoment)) {
                    // If it wasn't, reset it and return
                    pubDateEl.value = pubDateMoment.format(displayDateFormat);
                    return;
                }
            }

            // Validate new Published date
            if (!newPubDateMoment.isValid()) {
                errMessage = 'Published Date must be a valid date with format: DD MMM YY @ HH:mm (e.g. 6 Dec 14 @ 15:00)';
            }

            if (newPubDateMoment.diff(new Date(), 'h') > 0) {
                errMessage = 'Published Date cannot currently be in the future.';
            }

            if (errMessage.length) {
                // Show error message
                Ghost.notifications.addItem({
                    type: 'error',
                    message: errMessage,
                    status: 'passive'
                });

                // Reset back to original value and return
                pubDateEl.value = pubDateMoment ? pubDateMoment.format(displayDateFormat) : '';
                return;
            }

            // If the model doesn't currently
            // exist on the server (aka has no id)
            // then just update the model's value
            if (self.model.id === undefined) {
                this.model.set({
                    published_at: newPubDateMoment.toDate()
                });
                return;
            }

            // Save new 'Published' date
            this.model.save({
                published_at: newPubDateMoment.toDate()
            }, {
                success : function (model) {
                    pubDateEl.value = moment(model.get('published_at')).format(displayDateFormat);
                    Ghost.notifications.addItem({
                        type: 'success',
                        message: 'Publish date successfully changed to <strong>' + pubDateEl.value + '</strong>.',
                        status: 'passive'
                    });
                },
                error : function (model, xhr) {
                    /*jshint unused:false*/
                    //  Reset back to original value
                    pubDateEl.value = pubDateMoment ? pubDateMoment.format(displayDateFormat) : '';
                    Ghost.notifications.addItem({
                        type: 'error',
                        message: Ghost.Views.Utils.getRequestErrorMessage(xhr),
                        status: 'passive'
                    });
                }
            });

        }, 500),

        toggleStaticPage: _.debounce(function (e) {
            var pageEl = $(e.currentTarget),
                page = pageEl.prop('checked');

            // Don't try to save
            // if the model doesn't currently
            // exist on the server
            if (this.model.id === undefined) {
                this.model.set({
                    page: page
                });
                return;
            }

            this.model.save({
                page: page
            }, {
                success : function (model, response, options) {
                    /*jshint unused:false*/
                    pageEl.prop('checked', page);
                    Ghost.notifications.addItem({
                        type: 'success',
                        message: "Successfully converted " + (page ? "to static page" : "to post") + '.',
                        status: 'passive'
                    });
                },
                error : function (model, xhr) {
                    /*jshint unused:false*/
                    pageEl.prop('checked', model.previous('page'));
                    Ghost.notifications.addItem({
                        type: 'error',
                        message: Ghost.Views.Utils.getRequestErrorMessage(xhr),
                        status: 'passive'
                    });
                }
            });
        }, 500),

        deletePost: function (e) {
            e.preventDefault();
            var self = this;
            // You can't delete a post
            // that hasn't yet been saved
            if (this.model.id === undefined) {
                return;
            }
            this.addSubview(new Ghost.Views.Modal({
                model: {
                    options: {
                        close: false,
                        confirm: {
                            accept: {
                                func: function () {
                                    self.model.destroy({
                                        wait: true
                                    }).then(function () {
                                        // Redirect to content screen if deleting post from editor.
                                        if (window.location.pathname.indexOf('editor') > -1) {
                                            window.location = Ghost.paths.subdir + '/ghost/content/';
                                        }
                                        Ghost.notifications.addItem({
                                            type: 'success',
                                            message: 'Your post has been deleted.',
                                            status: 'passive'
                                        });
                                    }, function () {
                                        Ghost.notifications.addItem({
                                            type: 'error',
                                            message: 'Your post could not be deleted. Please try again.',
                                            status: 'passive'
                                        });
                                    });
                                },
                                text: "Delete",
                                buttonClass: "button-delete"
                            },
                            reject: {
                                func: function () {
                                    return true;
                                },
                                text: "Cancel",
                                buttonClass: "button"
                            }
                        },
                        type: "action",
                        style: ["wide", "centered"],
                        animation: 'fade'
                    },
                    content: {
                        template: 'blank',
                        title: 'Are you sure you want to delete this post?',
                        text: '<p>This is permanent! No backups, no restores, no magic undo button. <br /> We warned you, ok?</p>'
                    }
                }
            }));
        }

    });

}());

/*global document, Ghost, $, _, Countable, validator */
(function () {
    "use strict";

    var Settings = {};

    // Base view
    // ----------
    Ghost.Views.Settings = Ghost.View.extend({
        initialize: function (options) {
            $(".settings-content").removeClass('active');

            this.sidebar = new Settings.Sidebar({
                el: '.settings-sidebar',
                pane: options.pane,
                model: this.model
            });

            this.addSubview(this.sidebar);

            this.listenTo(Ghost.router, 'route:settings', this.changePane);
        },

        changePane: function (pane) {
            if (!pane) {
                // Can happen when trying to load /settings with no pane specified
                // let the router navigate itself to /settings/general
                return;
            }

            this.sidebar.showContent(pane);
        }
    });

    // Sidebar (tabs)
    // ---------------
    Settings.Sidebar = Ghost.View.extend({
        initialize: function (options) {
            this.render();
            this.menu = this.$('.settings-menu');
            // Hides apps UI unless config.js says otherwise
            // This will stay until apps UI is ready to ship
            if ($(this.el).attr('data-apps') !== "true") {
                this.menu.find('.apps').hide();
            }
            this.showContent(options.pane);
        },

        models: {},

        events: {
            'click .settings-menu li' : 'switchPane'
        },

        switchPane: function (e) {
            e.preventDefault();
            var item = $(e.currentTarget),
                id = item.find('a').attr('href').substring(1);

            this.showContent(id);
        },

        showContent: function (id) {
            var self = this,
                model;

            Ghost.router.navigate('/settings/' + id + '/');
            Ghost.trigger('urlchange');
            if (this.pane && id === this.pane.id) {
                return;
            }
            _.result(this.pane, 'destroy');
            this.setActive(id);
            this.pane = new Settings[id]({ el: '.settings-content'});

            if (!this.models.hasOwnProperty(this.pane.options.modelType)) {
                model = this.models[this.pane.options.modelType] = new Ghost.Models[this.pane.options.modelType]();
                model.fetch().then(function () {
                    self.renderPane(model);
                });
            } else {
                model = this.models[this.pane.options.modelType];
                self.renderPane(model);
            }
        },

        renderPane: function (model) {
            this.pane.model = model;
            this.pane.render();
        },

        setActive: function (id) {
            this.menu.find('li').removeClass('active');
            this.menu.find('a[href=#' + id + ']').parent().addClass('active');
        },

        templateName: 'settings/sidebar'
    });

    // Content panes
    // --------------
    Settings.Pane = Ghost.View.extend({
        options: {
            modelType: 'Settings'
        },
        destroy: function () {
            this.$el.removeClass('active');
            this.undelegateEvents();
        },
        render: function () {
            this.$el.hide();
            Ghost.View.prototype.render.call(this);
            this.$el.fadeIn(300);
        },
        afterRender: function () {
            this.$el.attr('id', this.id);
            this.$el.addClass('active');
        },
        saveSuccess: function (model, response, options) {
            /*jshint unused:false*/
            Ghost.notifications.clearEverything();
            Ghost.notifications.addItem({
                type: 'success',
                message: 'Saved',
                status: 'passive'
            });
        },
        saveError: function (model, xhr) {
            /*jshint unused:false*/
            Ghost.notifications.clearEverything();
            Ghost.notifications.addItem({
                type: 'error',
                message: Ghost.Views.Utils.getRequestErrorMessage(xhr),
                status: 'passive'
            });
        },
        validationError: function (message) {
            Ghost.notifications.clearEverything();
            Ghost.notifications.addItem({
                type: 'error',
                message: message,
                status: 'passive'
            });
        }
    });

    // ### General settings
    Settings.general = Settings.Pane.extend({
        id: "general",

        events: {
            'click .button-save': 'saveSettings',
            'click .js-modal-logo': 'showLogo',
            'click .js-modal-cover': 'showCover'
        },

        saveSettings: function () {
            var self = this,
                title = this.$('#blog-title').val(),
                description = this.$('#blog-description').val(),
                email = this.$('#email-address').val(),
                postsPerPage = this.$('#postsPerPage').val(),
                permalinks = this.$('#permalinks').is(':checked') ? '/:year/:month/:day/:slug/' : '/:slug/',
                validationErrors = [];

            if (!validator.isLength(title, 0, 150)) {
                validationErrors.push({message: "Title is too long", el: $('#blog-title')});
            }

            if (!validator.isLength(description, 0, 200)) {
                validationErrors.push({message: "Description is too long", el: $('#blog-description')});
            }

            if (!validator.isEmail(email) || !validator.isLength(email, 0, 254)) {
                validationErrors.push({message: "Please supply a valid email address", el: $('#email-address')});
            }

            if (!validator.isInt(postsPerPage) || postsPerPage > 1000) {
                validationErrors.push({message: "Please use a number less than 1000", el: $('postsPerPage')});
            }

            if (!validator.isInt(postsPerPage) || postsPerPage < 0) {
                validationErrors.push({message: "Please use a number greater than 0", el: $('postsPerPage')});
            }


            if (validationErrors.length) {
                validator.handleErrors(validationErrors);
            } else {
                this.model.save({
                    title: title,
                    description: description,
                    email: email,
                    postsPerPage: postsPerPage,
                    activeTheme: this.$('#activeTheme').val(),
                    permalinks: permalinks
                }, {
                    success: this.saveSuccess,
                    error: this.saveError
                }).then(function () { self.render(); });
            }
        },
        showLogo: function (e) {
            e.preventDefault();
            var settings = this.model.toJSON();
            this.showUpload('logo', settings.logo);
        },
        showCover: function (e) {
            e.preventDefault();
            var settings = this.model.toJSON();
            this.showUpload('cover', settings.cover);
        },
        showUpload: function (key, src) {
            var self = this,
                upload = new Ghost.Models.uploadModal({'key': key, 'src': src, 'id': this.id, 'accept': {
                    func: function () { // The function called on acceptance
                        var data = {};
                        if (this.$('.js-upload-url').val()) {
                            data[key] = this.$('.js-upload-url').val();
                        } else {
                            data[key] = this.$('.js-upload-target').attr('src');
                        }
                        self.model.set(data);
                        self.saveSettings();
                        return true;
                    },
                    buttonClass: "button-save right",
                    text: "Save" // The accept button text
                }});

            this.addSubview(new Ghost.Views.Modal({
                model: upload
            }));
        },
        templateName: 'settings/general',

        afterRender: function () {
            var self = this;

            this.$('#permalinks').prop('checked', this.model.get('permalinks') !== '/:slug/');
            this.$('.js-drop-zone').upload();

            Countable.live(document.getElementById('blog-description'), function (counter) {
                var descriptionContainer = self.$('.description-container .word-count');
                if (counter.all > 180) {
                    descriptionContainer.css({color: "#e25440"});
                } else {
                    descriptionContainer.css({color: "#9E9D95"});
                }

                descriptionContainer.text(200 - counter.all);

            });

            Settings.Pane.prototype.afterRender.call(this);
        }
    });

    // ### User profile
    Settings.user = Settings.Pane.extend({
        templateName: 'settings/user-profile',

        id: 'user',

        options: {
            modelType: 'User'
        },

        events: {
            'click .button-save': 'saveUser',
            'click .button-change-password': 'changePassword',
            'click .js-modal-cover': 'showCover',
            'click .js-modal-image': 'showImage',
            'keyup .user-profile': 'handleEnterKeyOnForm'
        },
        showCover: function (e) {
            e.preventDefault();
            var user = this.model.toJSON();
            this.showUpload('cover', user.cover);
        },
        showImage: function (e) {
            e.preventDefault();
            var user = this.model.toJSON();
            this.showUpload('image', user.image);
        },
        showUpload: function (key, src) {
            var self = this, upload = new Ghost.Models.uploadModal({'key': key, 'src': src, 'id': this.id, 'accept': {
                func: function () { // The function called on acceptance
                    var data = {};
                    if (this.$('.js-upload-url').val()) {
                        data[key] = this.$('.js-upload-url').val();
                    } else {
                        data[key] = this.$('.js-upload-target').attr('src');
                    }
                    self.model.set(data);
                    self.saveUser(data);
                    return true;
                },
                buttonClass: "button-save right",
                text: "Save" // The accept button text
            }});

            this.addSubview(new Ghost.Views.Modal({
                model: upload
            }));
        },

        handleEnterKeyOnForm: function (ev) {
            // Don't worry about it unless it's an enter key
            if (ev.which !== 13) {
                return;
            }

            var $target = $(ev.target);

            if ($target.is("textarea")) {
                // Allow enter key on user bio text area.
                return;
            }

            if ($target.is('input[type=password]')) {
                // Change password if on a password input
                return this.changePassword(ev);
            }

            // Simulate clicking save otherwise
            ev.preventDefault();

            this.saveUser(ev);

            return false;
        },

        saveUser: function () {
            var self = this,
                userName = this.$('#user-name').val(),
                userEmail = this.$('#user-email').val(),
                userLocation = this.$('#user-location').val(),
                userWebsite = this.$('#user-website').val(),
                userBio = this.$('#user-bio').val(),
                validationErrors = [];

            if (!validator.isLength(userName, 0, 150)) {
                validationErrors.push({message: "Name is too long", el: $('#user-name')});
            }

            if (!validator.isLength(userBio, 0, 200)) {
                validationErrors.push({message: "Bio is too long", el: $('#user-bio')});
            }

            if (!validator.isEmail(userEmail)) {
                validationErrors.push({message: "Please supply a valid email address", el: $('#user-email')});
            }

            if (!validator.isLength(userLocation, 0, 150)) {
                validationErrors.push({message: "Location is too long", el: $('#user-location')});
            }

            if (userWebsite.length) {
                if (!validator.isURL(userWebsite) || !validator.isLength(userWebsite, 0, 2000)) {
                    validationErrors.push({message: "Please use a valid url", el: $('#user-website')});
                }
            }

            if (validationErrors.length) {
                validator.handleErrors(validationErrors);
            } else {

                this.model.save({
                    'name':             userName,
                    'email':            userEmail,
                    'location':         userLocation,
                    'website':          userWebsite,
                    'bio':              userBio
                }, {
                    success: this.saveSuccess,
                    error: this.saveError
                }).then(function () {
                    self.render();
                });
            }
        },

        changePassword: function (event) {
            event.preventDefault();
            var self = this,
                oldPassword = this.$('#user-password-old').val(),
                newPassword = this.$('#user-password-new').val(),
                ne2Password = this.$('#user-new-password-verification').val(),
                validationErrors = [];

            if (!validator.equals(newPassword, ne2Password)) {
                validationErrors.push("Your new passwords do not match");
            }

            if (!validator.isLength(newPassword, 8)) {
                validationErrors.push("Your password is not long enough. It must be at least 8 characters long.");
            }

            if (validationErrors.length) {
                validator.handleErrors(validationErrors);
            } else {
                $.ajax({
                    url: Ghost.paths.subdir + '/ghost/changepw/',
                    type: 'POST',
                    headers: {
                        'X-CSRF-Token': $("meta[name='csrf-param']").attr('content')
                    },
                    data: {
                        password: oldPassword,
                        newpassword: newPassword,
                        ne2password: ne2Password
                    },
                    success: function (msg) {
                        Ghost.notifications.addItem({
                            type: 'success',
                            message: msg.msg,
                            status: 'passive',
                            id: 'success-98'
                        });
                        self.$('#user-password-old, #user-password-new, #user-new-password-verification').val('');
                    },
                    error: function (xhr) {
                        Ghost.notifications.addItem({
                            type: 'error',
                            message: Ghost.Views.Utils.getRequestErrorMessage(xhr),
                            status: 'passive'
                        });
                    }
                }).then(function () {
                    self.render();
                });
            }
        },

        afterRender: function () {
            var self = this;

            Countable.live(document.getElementById('user-bio'), function (counter) {
                var bioContainer = self.$('.bio-container .word-count');
                if (counter.all > 180) {
                    bioContainer.css({color: "#e25440"});
                } else {
                    bioContainer.css({color: "#9E9D95"});
                }

                bioContainer.text(200 - counter.all);

            });

            Settings.Pane.prototype.afterRender.call(this);
        }
    });

    // ### Apps page
    Settings.apps = Settings.Pane.extend({
        id: "apps",

        events: {
            'click .js-button-activate': 'activateApp',
            'click .js-button-deactivate': 'deactivateApp'
        },

        beforeRender: function () {
            this.availableApps = this.model.toJSON().availableApps;
        },

        activateApp: function (event) {
            var button = $(event.currentTarget);

            button.removeClass('button-add').addClass('button js-button-active').text('Working');

            this.saveStates();
        },

        deactivateApp: function (event) {
            var button = $(event.currentTarget);

            button.removeClass('button-delete js-button-active').addClass('button').text('Working');

            this.saveStates();
        },

        saveStates: function () {
            var activeButtons = this.$el.find('.js-apps .js-button-active'),
                toSave = [],
                self = this;

            _.each(activeButtons, function (app) {
                toSave.push($(app).data('app'));
            });

            this.model.save({
                activeApps: JSON.stringify(toSave)
            }, {
                success: this.saveSuccess,
                error: this.saveError
            }).then(function () { self.render(); });
        },

        saveSuccess: function () {
            Ghost.notifications.addItem({
                type: 'success',
                message: 'Active applications updated.',
                status: 'passive',
                id: 'success-1100'
            });
        },

        saveError: function (xhr) {
            Ghost.notifications.addItem({
                type: 'error',
                message: Ghost.Views.Utils.getRequestErrorMessage(xhr),
                status: 'passive'
            });
        },

        templateName: 'settings/apps'
    });

}());

/*global Ghost, Backbone, NProgress */
(function () {
    "use strict";

    Ghost.Router = Backbone.Router.extend({

        routes: {
            ''                 : 'blog',
            'content/'         : 'blog',
            'settings(/:pane)/' : 'settings',
            'editor(/:id)/'     : 'editor',
            'debug/'           : 'debug',
            'register/'        : 'register',
            'signup/'          : 'signup',
            'signin/'          : 'login',
            'forgotten/'       : 'forgotten',
            'reset/:token/'     : 'reset'
        },

        signup: function () {
            Ghost.currentView = new Ghost.Views.Signup({ el: '.js-signup-box' });
        },

        login: function () {
            Ghost.currentView = new Ghost.Views.Login({ el: '.js-login-box' });
        },

        forgotten: function () {
            Ghost.currentView = new Ghost.Views.Forgotten({ el: '.js-forgotten-box' });
        },

        reset: function (token) {
            Ghost.currentView = new Ghost.Views.ResetPassword({ el: '.js-reset-box', token: token });
        },

        blog: function () {
            var posts = new Ghost.Collections.Posts();
            NProgress.start();
            posts.fetch({ data: { status: 'all', staticPages: 'all', include: 'author'} }).then(function () {
                Ghost.currentView = new Ghost.Views.Blog({ el: '#main', collection: posts });
                NProgress.done();
            });
        },

        settings: function (pane) {
            if (!pane) {
                // Redirect to settings/general if no pane supplied
                this.navigate('/settings/general/', {
                    trigger: true,
                    replace: true
                });
                return;
            }

            // only update the currentView if we don't already have a Settings view
            if (!Ghost.currentView || !(Ghost.currentView instanceof Ghost.Views.Settings)) {
                Ghost.currentView = new Ghost.Views.Settings({ el: '#main', pane: pane });
            }
        },

        editor: function (id) {
            var post = new Ghost.Models.Post();
            post.urlRoot = Ghost.paths.apiRoot + '/posts';
            if (id) {
                post.id = id;
                post.fetch({ data: {status: 'all', include: 'tags'}}).then(function () {
                    Ghost.currentView = new Ghost.Views.Editor({ el: '#main', model: post });
                });
            } else {
                Ghost.currentView = new Ghost.Views.Editor({ el: '#main', model: post });
            }
        },

        debug: function () {
            Ghost.currentView = new Ghost.Views.Debug({ el: "#main" });
        }
    });
}());
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
console.log('fghj')

$(function () {

    'use strict';

    const PLUGIN_KEY = 'jquery.streaming.vef';

    const DEFAULTS = {audio: true, video: true};

    function Plugin($element, options) {
        this.$element = $element;
        this.constraints = $.extend(DEFAULTS, options);

        this.init();
    }

    Plugin.prototype = {
        init: function() {
            // some version's of the supported browsers do not implement mediaDevices, append empty object to the navigator interface
            if (navigator.mediaDevices === undefined) {
                navigator.mediaDevices = {};
            }

            // append to the user's connected devices found by the browser
            if (navigator.mediaDevices.getUserMedia === undefined) {
                navigator.mediaDevices.getUserMedia = getUserMedia;
            }

            console.log('pre init');

            this.initialized = true;

            // Prefer camera resolution nearest to 1280x720.
            // var constraints = {audio: true, video: {width: 1280, height: 720}}

            var that = this;
            navigator.mediaDevices.getUserMedia(this.constraints)
                .then(function (handle) {
                    var element = that.$element[0];

                    // var video = document.querySelector('video');
                    element.src = window.URL.createObjectURL(handle);
                    element.onloadedmetadata = function (e) {
                        var key = PLUGIN_KEY + '.state';

                        that.$element.data(key, true);
                        element.play();

                        element.onkeydown = function(e) {
                            if (e.keyCode == 32) {
                                var state = !that.$element.data(key);

                                if (state) {
                                    element.play();
                                } else {
                                    element.pause();
                                }

                                that.$element.data(key, state);
                            }
                        }
                    };

                    // TODO capture closing event (e.g. webcam disconnect or external camera has insufficient battry level
                    element.onabort = element.onclose = function(e) {
                        that.stop();
                    };
                })
                .catch(function (err) {
                    console.log(err.name + ": " + err.message);
                });
        },

        start: function() {
            if (this.initialized !== undefined && this.initialized) {

            }
        },

        pause: function() {
            if (this.initialized !== undefined && this.initialized) {

            }
        },

        stop: function() {
            if (this.initialized !== undefined && this.initialized) {
                // quit streaming

                console.log("quit stream");

            }
        }
    };

    var getUserMedia = function(constraints) {

        // get the user media(e.g. cam or usb camera) by browser. supported for: IE 10, webkit and firefox;
        var userMedia = (navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia);

        // catch for older browsers, or browser that do not implement getUserMedia in the navigator interface
        if (!userMedia) {
            return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
        }

        // return self
        return new Promise(function (resolve, reject) {
            userMedia.call(navigator, constraints, resolve, reject);
        });
    };

    $.fn.stream = function(options) {
        var plugin = null;

        var $this = $(this);

        if ($this !== undefined && $this != null && $this.length == 1) {
            var tag = $this[0].tagName.toLowerCase();

            if (tag == "video") {
                var data = $this.data(PLUGIN_KEY);

                if (data === undefined || data == null) {
                    $this.data(PLUGIN_KEY, new Plugin($this, options));
                }

                plugin = $this.data(PLUGIN_KEY);
            }
        }

        return plugin;
    }

    window.stream = $(document.getElementById('stream')).stream();
});
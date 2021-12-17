(function() {
    var root = (typeof self == 'object' && self.self == self && self) ||
        (typeof global == 'object' && global.global == global && global) ||
        this || {};

    // 兼容处理
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || // Webkit中此取消方法的名字变了
            window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16.7 - (currTime - lastTime));
            var id = window.setTimeout(function() {
                callback(currTime + timeToCall);
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }
    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    }

    var util = {
        extend: function(target) {
            for (var i = 1, len = arguments.length; i < len; i++) {
                for (var prop in arguments[i]) {
                    if (arguments[i].hasOwnProperty(prop)) {
                        target[prop] = arguments[i][prop]
                    }
                }
            }

            return target
        },
        getViewPortSizeHeight: function() {
            var w = window;
            if (w.innerWidth != null) return w.innerHeight;
            var d = w.document;
            // 表明是标准模式
            if (document.compatMode == "CSS1Compat") {
                return d.documentElement.clientHeight;
            }
            // 怪异模式
            return d.body.clientHeight;
        },
        getScrollOffsetsTop: function() {
            var w = window;
            if (w.pageXOffset != null) return w.pageYOffset;
            var d = w.document;
            // 表明是标准模式
            if (document.compatMode == "CSS1Compat") {
                return d.documentElement.scrollTop;
            }
            // 怪异模式
            return d.body.scrollTop;
        },
        addEvent: function(element, type, fn) {
            if (document.addEventListener) {
                element.addEventListener(type, fn, false);
                return fn;
            } else if (document.attachEvent) {
                var bound = function() {
                    return fn.apply(element, arguments)
                }
                element.attachEvent('on' + type, bound);
                return bound;
            }
        },
        isValidListener: function(listener) {
            if (typeof listener === 'function') {
                return true
            } else if (listener && typeof listener === 'object') {
                return util.isValidListener(listener.listener)
            } else {
                return false
            }
        },
        indexOf: function(array, item) {
            if (array.indexOf) {
                return array.indexOf(item);
            }
            else {
                var result = -1;
                for (var i = 0, len = array.length; i < len; i++) {
                    if (array[i] === item) {
                        result = i;
                        break;
                    }
                }
                return result;
            }
        },
        includes: function(array, item) {
            if (array.some) {
                return array.some(function (v) {
                    return v.listener === item.listener && v.once === item.once;
                })
            }

            var result = false
            for (var i = 0, len = array.length; i < len; i++) {
                if (array[i].listener === item.listener && array[i].once === item.once) {
                    result = true;
                    break;
                }
            }
            return result;
        }
    };

    function EventEmitter() {
        this.__events = {}
    }

    EventEmitter.prototype.on = function(eventName, listener) {
        if (!eventName || !listener) return;

        if (!util.isValidListener(listener)) {
            throw new TypeError('listener must be a function');
        }

        var events = this.__events;
        var listeners = events[eventName] = events[eventName] || [];
        var listenerIsWrapped = typeof listener === 'object';

        // 不重复添加事件
        if (!util.includes(listeners, listener)) {
            listeners.push(listenerIsWrapped ? listener : {
                listener: listener,
                once: false
            });
        }

        return this;
    };
    EventEmitter.prototype.once = function(eventName, listener) {
        return this.on(eventName, {
            listener: listener,
            once: true
        })
    };
    EventEmitter.prototype.off = function(eventName, listener) {
        var listeners = this.__events[eventName];
        if (!listeners) return;

        var index;
        for (var i = 0, len = listeners.length; i < len; i++) {
            if (listeners[i] && listeners[i].listener === listener) {
                index = i;
                break;
            }
        }

        if (typeof index !== 'undefined') {
            listeners.splice(index, 1, null)
        }

        return this;
    };
    EventEmitter.prototype.emit = function(eventName, args) {
        var listeners = this.__events[eventName];
        if (!listeners) return;

        for (var i = 0; i < listeners.length; i++) {
            var listener = listeners[i];
            if (listener) {
                listener.listener.apply(this, args || []);
                if (listener.once) {
                    this.off(eventName, listener.listener)
                }
            }

        }

        return this;

    };

    function ProgressIndicator(options) {

        this.options = util.extend({}, this.constructor.defaultOptions, options)

        this.handlers = {};

        this.init();
    }

    ProgressIndicator.VERSION = '1.0.0';

    ProgressIndicator.defaultOptions = {
        color: "#0A74DA"
    }

    var proto = ProgressIndicator.prototype = new EventEmitter();

    proto.constructor = ProgressIndicator;

    proto.init = function() {
        this.createIndicator();
        var width = this.calculateWidthPrecent();
        this.setWidth(width);
        this.bindScrollEvent();

    }

    proto.createIndicator = function() {
        var div = document.createElement("div")

        div.id = "progress-indicator";
        div.className = "progress-indicator";

        div.style.position = "fixed"
        div.style.top = 0;
        div.style.left = 0;
        div.style.height = '3px';

        div.style.backgroundColor = this.options.color;

        this.element = div;

        document.body.appendChild(div);
    }

    proto.calculateWidthPrecent = function() {
        // 文档高度
        this.docHeight = Math.max(document.documentElement.scrollHeight, document.documentElement.clientHeight)

        // 视口高度
        this.viewPortHeight = util.getViewPortSizeHeight();
        // 差值
        this.sHeight = Math.max(this.docHeight - this.viewPortHeight, 0);
        // 滚动条垂直偏移量
        var scrollTop = util.getScrollOffsetsTop();

        return this.sHeight ? scrollTop / this.sHeight : 0;
    }

    proto.setWidth = function(perc) {
        this.element.style.width = perc * 100 + "%";
    }

    proto.bindScrollEvent = function() {
        var self = this;
        var prev;

        util.addEvent(window, "scroll", function() {
            window.requestAnimationFrame(function() {
                var perc = Math.min(util.getScrollOffsetsTop() / self.sHeight, 1);
                // 火狐中有可能连续计算为 1，导致 end 事件被触发两次
                if (perc == prev) return;
                // 在达到 100% 的时候，刷新页面不 emit end 事件
                if (prev && perc == 1) {
                    self.emit("end")
                }

                prev = perc;
                self.setWidth(perc);
            });
        })
    }

    if (typeof exports != 'undefined' && !exports.nodeType) {
        if (typeof module != 'undefined' && !module.nodeType && module.exports) {
            exports = module.exports = ProgressIndicator;
        }
        exports.ProgressIndicator = ProgressIndicator;
    } else {
        root.ProgressIndicator = ProgressIndicator;
    }

}());

/**
 * Created by Lian on 2015/8/19.
 */
(function () {
    function tinyScrollBar(elem, options) {
        //默认设置
        var setting = {
            speed: 15, //滚动条滚动的速度
            minScrollBarHeight: 100, //滚动条最小高度
            addClass: '' //包裹类,用来修饰滚动条的样式
        };
        if (!elem) return;
        options = options || {};
        for (var item in setting) {
            if (options[item] != undefined) {
                setting[item] = options[item];
            }
        }

        return new ScrollBar(elem, setting).init();
    }

    function ScrollBar(elem, setting) {
        this.elem = elem;
        this.setting = setting;
    }

    ScrollBar.prototype = {
        init: function () {
            this.createWrapper(this.elem);
            this.update();
            return this;
        },
        /**
         * 将要滚动的内容包裹进来
         * @param elem
         */
        createWrapper: function (elem) {
            var $parent = elem.parentNode,
                html;

            this.$viewport = document.createElement("div");
            this.$viewport.className = "viewport " + this.setting.addClass;
            this.$viewport.id = "J_ViewPort";
            this.$viewport.style.display = 'none';
            html = ['<div class="scrolltool J_scrollTool" style="display: none;">',
                '<div class="scrolltrack">',
                '<div class="scrollbar J_scrollBar"></div>',
                '</div>',
                '</div>',
                '<div class="wholearea J_wholeArea"></div>'].join('');

            this.$viewport.innerHTML = html;
            $parent.appendChild(this.$viewport);

            this.$wholearea = Util.getElem(this.$viewport, ".J_wholeArea");
            this.$wholearea.appendChild(elem);

            this.$viewport.style.display = '';

            this.$scrolltool = Util.getElem(this.$viewport, ".J_scrollTool");
            this.$scrollbar = Util.getElem(this.$viewport, ".J_scrollBar");
        },
        /*更新滚动条的高度*/
        update: function () {
            this.rate = this.$viewport.offsetHeight / this.$wholearea.offsetHeight;
            if (this.rate < 1) {
                this.$scrollbar.style.height = (this.$viewport.offsetHeight * this.rate < this.setting.minScrollBarHeight ? this.setting.minScrollBarHeight : this.$viewport.offsetHeight * this.rate) + "px";
                this.$scrolltool.style.display = '';
                this.bind();
            } else {
                this.$scrolltool.style.display = 'none';
            }
        },
        bind: function () {
            var _this = this;

            var mouseWheel = function (event) {
                event = Util.eventCompact(event);
                var delta = event.delta,
                    distance = delta * _this.setting.speed;

                _this.doScroll(distance);
                //禁止将滚动事件传给页面
                event.preventDefault();
            };

            var mousedown = function (event) {
                event = Util.eventCompact(event);
                //禁止选中文本
                Util.addEvent(document.body, 'selectstart', selectstart);

                _this.originY = event.pageY || event.clientY;
                _this.originScrollTop = parseInt(_this.$scrollbar.style.top) || 0;
                Util.addEvent(document.body, 'mousemove', mousemove);
                Util.addEvent(document.body, 'mouseup', mouseup);
            };

            var mousemove = function (event) {
                event = Util.eventCompact(event);
                _this.curY = event.pageY || event.clientY;
                var distance = _this.curY - _this.originY,
                    curTop = _this.originScrollTop + distance,
                    maxDistance = _this.$scrolltool.offsetHeight - _this.$scrollbar.offsetHeight;
                distance = Math.min(maxDistance, Math.max(0, curTop)) - (parseInt(_this.$scrollbar.style.top) || 0);
                _this.doScroll(distance);
            };

            var mouseup = function () {
                Util.removeEvent(document.body, 'mousemove', mousemove);
                Util.removeEvent(document.body, 'mouseup', mouseup);
                Util.removeEvent(document.body, 'selectstart', selectstart);
            };

            var selectstart = function (event) {
                event = Util.eventCompact(event);
                event = Util.eventCompact(event);
                event.preventDefault();
            };

            Util.addEvent(this.$viewport, 'mousewheel', mouseWheel);
            Util.addEvent(this.$scrollbar, 'mousedown', mousedown);
        },
        doScroll: function (distance) {
            var _this = this;
            var scrollbartop = parseInt(_this.$scrollbar.style.top) || 0,
                wholeareatop = parseInt(_this.$wholearea.style.top) || 0,
                curscrollbartop = scrollbartop + distance,
                maxscrollbartop = _this.$scrolltool.offsetHeight - _this.$scrollbar.offsetHeight,
                curwholeareatop = wholeareatop - (distance / maxscrollbartop) * _this.$wholearea.offsetHeight,
                minwholeareatop = _this.$viewport.offsetHeight - _this.$wholearea.offsetHeight;

            curscrollbartop = Math.min(Math.max(0, curscrollbartop), maxscrollbartop);
            curwholeareatop = Math.min(Math.max(minwholeareatop, curwholeareatop), 0);

            _this.$scrollbar.style.top = curscrollbartop + 'px';
            _this.$wholearea.style.top = curwholeareatop + 'px';
        }
    };

    /*工具类*/
    var Util = {
        /**
         * 通过id获得元素
         * @param id
         * @returns {HTMLElement}
         */
        getElem: function (elem, selector) {
            return elem.querySelector(selector);
        },
        /**
         *  事件兼容处理
         * @param event
         * @returns {*|Event}
         */
        eventCompact: function (event) {
            event = event || window.event;
            var type = event.type;
            //修正滚轮事件
            if (type === 'mousewheel' || type === 'DoMMouseScroll') {
                event.delta = event.wheelDelta ? event.wheelDelta / -120 : event.detail / 3;
            }

            //修正事件的目标对象
            if (event.srcElement && !event.target) {
                event.target = event.srcElement;
            }

            //修正阻止默认事件方法
            if (!event.preventDefault) {
                event.preventDefault = function () {
                    event.returnValue = false;
                }
            }

            return event;
        },
        /**
         * 添加事件
         * @param el
         * @param type
         * @param fn
         * @param capture
         */
        addEvent: function (el, type, fn, capture) {
            var _this = this;
            if (el.addEventListener) {
                //滚轮事件type统一使用mousewheel
                if (type === "mousewheel" && document.mozHidden !== undefined) {
                    type = "DOMMouseScroll";
                }
                el.addEventListener(type, fn, capture || false);
            } else {
                el.attachEvent('on' + type, fn);
            }
        },
        /**
         * 删除事件
         * @param el
         * @param type
         * @param fn
         */
        removeEvent: function (el, type, fn) {
            if (el.removeEventListener) {
                el.removeEventListener(type, fn, false);
            } else if (el.detachEvent) {
                el.detachEvent('on' + type, fn);
            } else {
                el['on' + type] = null;
            }
        }

    };

    window.tinyScrollBar = tinyScrollBar;
}());

# 用途
自定义滚动条样式 模仿滚动条的交互


![image](https://github.com/BabyLian/tinyScrollBar/blob/master/screenshot.png)

#配置参数
speed: 15, //滚动条滚动的速度
minScrollBarHeight: 100, //滚动条最小高度
addClass: '' //包裹类,用来修饰滚动条的样式


#如何使用
```
###在页面中引入js文件
 <script type="text/javascript" src="index.js"></script>
 
 ###调用插件方法
 <script type="text/javascript">
    var cnt1 = document.getElementById("J_Cnt1"),
        scroll1 = tinyScrollBar(cnt1, {addClass: 'song', minScrollBarHeight: 80}) ;
 </script>
```

#疑难杂症
###阻止div的滚动事件传递给body：在滚动事件中添加  event.preventDefault();
```
 var mouseWheel = function (event) {
    event = Util.eventCompact(event);
    var delta = event.delta,
        distance = delta * _this.setting.speed;

    _this.doScroll(distance);
    //禁止将滚动事件传给页面
    event.preventDefault();
  };
```

###鼠标超出了div，滚动条就不能再移动了：起初计算每次鼠标移动的间距，然后将当前的滚动条scrollTop加上这个间距使滚动条滚动，但是这种方法，会出现鼠标不在div的高度范围中(比如在div上面),移动鼠标也会使滚动条移动,这显然是不合理的。解决方法就是要计算开始拖动鼠标时的Y坐标与停止拖动鼠标时的Y坐标以及鼠标开始拖动时滚动条的scrollTop这三者的关系。
```
var mousemove = function (event) {
    event = Util.eventCompact(event);
    _this.curY = event.pageY || event.clientY;
    var distance = _this.curY - _this.originY,
        curTop = _this.originScrollTop + distance,
        maxDistance = _this.$scrolltool.offsetHeight - _this.$scrollbar.offsetHeight;
    distance = Math.min(maxDistance, Math.max(0, curTop)) - (parseInt(_this.$scrollbar.style.top) || 0);
    _this.doScroll(distance);
};
```

###每个滚动条都有自己得滚动事件：开始的时候纯粹用对象包含属性和方法的方式去声明函数，这种方法导致只有最后创建滚动条的div才能响应滚动事件，这是因为事件接收对象被覆盖了，所以要采用函数构造器的方法，这样每个实例都有自己的事件接收对象（即包含它的div）
```
function tinyScrollBar(elem, options) {
    ...
    return new ScrollBar(elem, setting).init();
}

function ScrollBar(elem, setting) {
    this.elem = elem;
    this.setting = setting;
}

ScrollBar.prototype = {...}
```

 

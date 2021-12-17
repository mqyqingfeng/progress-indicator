# progress-indicator

仿阮一峰老师的《ECMAScript 6 入门》的顶部进度条

## 介绍

原生 JavaScript 实现的顶部进度条，兼容到 IE7+。

效果演示：[https://mqyqingfeng.github.io/progress-indicator/](https://mqyqingfeng.github.io/progress-indicator/)

## 兼容性

IE7+

## 下载

```js
git clone git@github.com:mqyqingfeng/progress-indicator.git
```

## 使用

```html
<script src="path/progress-indicator.js"></script>
```

或者

```js
import ProgressIndicator from 'path/progress-indicator.js'
```

## 示例

直接使用：

```js
new ProgressIndicator();
```

绑定事件：

```js
var progressBar = new ProgressIndicator();

progressBar.once("end", function(){
    alert('恭喜您已经阅读完毕')
})
```

## API

### 初始化

```js
var progressBar = new ProgressIndicator(options);
```

### options

**1. color**

默认值为 "#0A74DA"

示例：

```js
var progressBar = new ProgressIndicator({
    color: "#e74c3c"
});
```

### 事件

**1. end 事件**

进度到达 100% 时触发 end 事件。

使用 on 可绑定 end 事件的监听函数。

```js
progressBar.on("end", function(){
    alert('恭喜您已经阅读完毕')
})
```

使用 once ，监听函数只被触发一次。

```js
progressBar.once("end", function(){
    alert('恭喜您已经阅读完毕')
})
```

移除进度条

```js
progressBar.removeProgress(function() {
    console.log('移除成功')
})
```

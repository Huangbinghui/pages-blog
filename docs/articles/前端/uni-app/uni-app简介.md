# 目录结构

一个uni-app工程，默认包含如下目录及文件：

```
┌─uniCloud              云空间目录，阿里云为uniCloud-aliyun,腾讯云为uniCloud-tcb（详见uniCloud）
│─components            符合vue组件规范的uni-app组件目录
│  └─comp-a.vue         可复用的a组件
├─utssdk                存放uts文件
├─pages                 业务页面文件存放的目录
│  ├─index
│  │  └─index.vue       index页面
│  └─list
│     └─list.vue        list页面
├─static                存放应用引用的本地静态资源（如图片、视频等）的目录，注意：静态资源只能存放于此
├─uni_modules           存放[uni_module](/uni_modules)。
├─platforms             存放各平台专用页面的目录，详见
├─nativeplugins         App原生语言插件 详见
├─nativeResources       App端原生资源目录
│  └─android            Android原生资源目录 详见
├─hybrid                App端存放本地html文件的目录，详见
├─wxcomponents          存放小程序组件的目录，详见
├─unpackage             非工程代码，一般存放运行或发行的编译结果
├─AndroidManifest.xml   Android原生应用清单文件 详见
├─main.js               Vue初始化入口文件
├─App.vue               应用配置，用来配置App全局样式以及监听 应用生命周期
├─manifest.json         配置应用名称、appid、logo、版本等打包信息，详见
├─pages.json            配置页面路由、导航条、选项卡等页面类信息，详见
└─uni.scss              这里是uni-app内置的常用样式变量
```

`static目录` 使用注意

* 编译到任意平台时，`static` 目录下除不满足[条件编译](https://uniapp.dcloud.net.cn/tutorial/platform.html#static-目录的条件编译)的文件，会直接复制到最终的打包目录，不会打包编译。非 `static` 目录下的文件（vue、js、css 等）只有被引用时，才会被打包编译。
* `css`、`less/scss` 等资源不要放在 `static` 目录下，建议这些公用的资源放在自建的 `common` 目录下。

**Tips**

* HbuilderX 1.9.0+ 支持在根目录创建 `ext.json`、`sitemap.json` 等小程序需要的文件。

# 页面

## 页面简介

uni-app项目中，一个页面就是一个符合`Vue SFC规范`的`.vue`文件或`.nvue`文件。

`.vue`页面和`.nvue`页面，均全平台支持，差异在于当uni-app发行到App平台时，`.vue`文件会使用webview进行渲染，`.nvue`会使用原生进行渲染，

## 新建页面

`uni-app`中的页面，通常会保存在工程根目录下的`pages`目录下。

每次新建页面，均需在`pages.json`中配置`pages`列表；未在`pages.json -> pages` 中配置的页面，`uni-app`会在编译阶段进行忽略。pages.json的完整配置参考：[全局文件](https://uniapp.dcloud.net.cn/collocation/pages)。

## 应用首页

`uni-app`会选择在`pages.json`中配置`pages`列表第一项作为首页。

## 页面生命周期回调

| 函数名                              | 说明                                                         | 平台差异说明                                                 | 最低版本 |
| :---------------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- | :------- |
| onInit                              | 监听页面初始化，其参数同 onLoad 参数，为上个页面传递的数据，参数类型为 Object（用于页面传参），触发时机早于 onLoad | 百度小程序                                                   | 3.1.0+   |
| onLoad                              | 监听页面加载，其参数为上个页面传递的数据，参数类型为 Object（用于页面传参），参考[示例](https://uniapp.dcloud.net.cn/api/router#navigateto) |                                                              |          |
| onShow                              | 监听页面显示。页面每次出现在屏幕上都触发，包括从下级页面点返回露出当前页面 |                                                              |          |
| onReady                             | 监听页面初次渲染完成。注意如果渲染速度快，会在页面进入动画完成前触发 |                                                              |          |
| onHide                              | 监听页面隐藏                                                 |                                                              |          |
| onUnload                            | 监听页面卸载                                                 |                                                              |          |
| onResize                            | 监听窗口尺寸变化                                             | App、微信小程序、快手小程序                                  |          |
| onPullDownRefresh                   | 监听用户下拉动作，一般用于下拉刷新，参考[示例](https://uniapp.dcloud.net.cn/api/ui/pulldown) |                                                              |          |
| onReachBottom                       | 页面滚动到底部的事件（不是scroll-view滚到底），常用于下拉下一页数据。具体见下方注意事项 |                                                              |          |
| onTabItemTap                        | 点击 tab 时触发，参数为Object，具体见下方注意事项            | 微信小程序、QQ小程序、支付宝小程序、百度小程序、H5、App、快手小程序、京东小程序 |          |
| onShareAppMessage                   | 用户点击右上角分享                                           | 微信小程序、QQ小程序、支付宝小程序、字节小程序、飞书小程序、快手小程序、京东小程序 |          |
| onPageScroll                        | 监听页面滚动，参数为Object                                   | nvue暂不支持                                                 |          |
| onNavigationBarButtonTap            | 监听原生标题栏按钮点击事件，参数为Object                     | App、H5                                                      |          |
| onBackPress                         | 监听页面返回，返回 event = {from:backbutton、 navigateBack} ，backbutton 表示来源是左上角返回按钮或 android 返回键；navigateBack表示来源是 uni.navigateBack ；详细说明及使用：[onBackPress 详解](http://ask.dcloud.net.cn/article/35120)。支付宝小程序只有真机能触发，只能监听非navigateBack引起的返回，不可阻止默认行为。 | app、H5、支付宝小程序                                        |          |
| onNavigationBarSearchInputChanged   | 监听原生标题栏搜索输入框输入内容变化事件                     | App、H5                                                      | 1.6.0    |
| onNavigationBarSearchInputConfirmed | 监听原生标题栏搜索输入框搜索事件，用户点击软键盘上的“搜索”按钮时触发。 | App、H5                                                      | 1.6.0    |
| onNavigationBarSearchInputClicked   | 监听原生标题栏搜索输入框点击事件（pages.json 中的 searchInput 配置 disabled 为 true 时才会触发） | App、H5                                                      | 1.6.0    |
| onShareTimeline                     | 监听用户点击右上角转发到朋友圈                               | 微信小程序                                                   | 2.8.1+   |
| onAddToFavorites                    | 监听用户点击右上角收藏                                       | 微信小程序、QQ小程序                                         | 2.8.1+   |
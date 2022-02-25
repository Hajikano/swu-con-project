# 化院一点通小程序

- 已将请求域名等敏感数据去除。
- 本项目开发时期技术尚未成熟，很多地方略显幼稚，代码放在此处仅供参考。



## 项目结构

- apis

  存放项目的所有API接口，`index.js`中定义了请求域名和拦截方法。

- components

  存放项目用到的UI组件。

- pages

  存放项目的所有页面。

- public

  存放项目的公共静态资源。

- tools

  存放项目用到的工具类。

- utils

  存放项目用到的开发用封装类，其中：

  - `DC_Component`是封装的组件类，将页面抽象为各个组件，使得各组件的Data和Method分离在各组件对象中而不是集中在Page传入的对象里，便于维护。注意，单个页面的Component的`_name`属性不得重复。
  - `DC_Page`是封装的页面类，每个页面各有一个类实例。页面的组件将注册在该页面对象上，使得各组件的Data和Method得以映射到原生微信小程序的Page对象中。
  - `DC_PublicFunc`封装了常用的工具函数，包括判断用户是否授权（该函数在最新版本小程序中因为政策原因已失效）、小程序胶囊属性和设备信息及时间转换器等。
  - `DC_Request`基于`Promise`对`wx.request`进行了简易的封装（现在微信已经提供了`wx.request`的`Promise`用法，开发时封装的是早期版本），包括全局请求域名设置，请求拦截和响应拦截等。
  - `DC_Router`配合`DC_Page`记录了小程序页面栈信息，`DC_Store`封装了一个全局对象用于共享全局资源。`MD_Wxss`引入了`materialicons`以供小程序使用。

  
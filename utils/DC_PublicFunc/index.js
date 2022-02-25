// 判断是否对小程序授权
function DC_IsAuthorize(callback) {
  wx.getSetting({
    success(res) {
      let isAuthorize = res.authSetting['scope.userInfo']
      callback(isAuthorize)
    }
  })
}

// 获取胶囊和设备信息
function DC_SystemInfo() {
  //小程序右上角胶囊高度
  this.navButton = (() => {
    let menuButtonInfo = wx.getMenuButtonBoundingClientRect()
    let navButton = {
      top: menuButtonInfo.top,
      left: menuButtonInfo.left,
      height: menuButtonInfo.height,
      width: menuButtonInfo.width
    }
    return navButton
  })()
  //系统相关信息
  this.system = (() => {
    let info = wx.getSystemInfoSync()
    let system = {
      isIOS: info.system.search('iOS') === 0,
      width: info.screenWidth,
      height: info.screenHeight
    }
    return system
  })()
}

// 封装后的路由跳转类
// 暂时仅支持扁平化的页面路由
// 每个页面的各文件名均须为index
function DC_NavigateTo() {
  // 把路径与参数对象转为完整路径
  this.params2FullPath = (url, params = {}) => {
    let paramKeyNames = Object.getOwnPropertyNames(params)
    if (paramKeyNames.length > 0) {
      url = `${url}?`
    }
    for (let i of paramKeyNames) {
      if (i !== 'length') {
        url += `${i}=${params[i]}&`
      }
    }
    return url
  }
  // 替换当前页面
  this.replace = (path, params = {}) => {
    let url = `/pages/${path}/index`
    url = this.params2FullPath(url, params)
    wx.redirectTo({
      url: url
    })
  }
  // 推进新页面
  this.push = (path, params = {}) => {
    let url = `/pages/${path}/index`
    url = this.params2FullPath(url, params)
    wx.navigateTo({
      url: url
    })
  }
  // 推出当前页
  this.pop = (index = 1) => {
    if (this.getIndex() > index) {
      wx.navigateBack({
        delta: index
      })
    } else if (this.getIndex() > 1) {
      this.backToTop()
    }
  }
  //获取当前页面栈层数
  this.getIndex = () => {
    return getCurrentPages().length
  }
  //出栈至首页
  this.backToTop = () => {
    this.pop(getCurrentPages().length - 1)
  }
  //获取当前栈名
  this.getCurrentPageName = () => {
    let length = getCurrentPages().length
    return getCurrentPages()[length - 1]
  }
}

// 加载toast
function DC_Loading() {
  this.show = (title = '加载中', callback = () => {}) => {
    wx.showLoading({
      title: title,
      mask: true
    })
    callback()
  }
  this.clear = (callback = () => {}) => {
    wx.hideLoading()
    callback()
  }
}

// 设定顶部文字颜色
function DC_SetNavBarColor(mode = '#000000') {
  wx.setNavigationBarColor({
    frontColor: mode,
    backgroundColor: mode
  })
}

// 获取随机字符串
function getRandomStr(length) {
  const charSets = 'ABCDEFGHJKMNOPQRSTUVWXYZ023456789'
  let randomStr = ''
  for (let i = 0; i < length; i++) {
    const random = Math.random()
    const randomIndex = Math.ceil(random * (charSets.length - 1))
    randomStr += charSets[randomIndex]
  }
  return randomStr
}

// 时间转换器
function timeago(dateObj) {
  let date = dateObj
  let publishTime = dateObj.getTime() / 1000
  let Y = date.getFullYear()
  let M = date.getMonth() + 1
  let D = date.getDate()
  let H = date.getHours()
  let m = date.getMinutes()
  let s = date.getSeconds()
  // 对 月 日 时 分 秒 小于10时, 加0显示 例如: 09-09 09:01
  if (M < 10) {
    M = '0' + M
  }
  if (D < 10) {
    D = '0' + D
  }
  if (H < 10) {
    H = '0' + H
  }
  if (m < 10) {
    m = '0' + m
  }
  if (s < 10) {
    s = '0' + s
  }
  let nowTime = new Date().getTime() / 1000, //获取此时此刻日期的秒数
    diffValue = nowTime - publishTime, // 获取此时 秒数 与 要处理的日期秒数 之间的差值
    diff_days = parseInt(diffValue / 86400), // 一天86400秒 获取相差的天数 取整
    diff_hours = parseInt(diffValue / 3600), // 一时3600秒
    diff_minutes = parseInt(diffValue / 60),
    diff_secodes = parseInt(diffValue)
  if (diff_days > 0 && diff_days < 3) {
    //相差天数 0 < diff_days < 3 时, 直接返出
    return diff_days + '天前'
  } else if (diff_days <= 0 && diff_hours > 0) {
    return diff_hours + '小时前'
  } else if (diff_hours <= 0 && diff_minutes > 0) {
    return diff_minutes + '分钟前'
  } else if (diff_secodes < 60) {
    if (diff_secodes <= 0) {
      return '刚刚'
    } else {
      return diff_secodes + '秒前'
    }
  } else if (diff_days >= 3 && diff_days < 30) {
    return M + '-' + D + ' ' + H + ':' + m
  } else if (diff_days >= 30) {
    return Y + '-' + M + '-' + D + ' ' + H + ':' + m
  }
}

module.exports = {
  DC_IsAuthorize,
  DC_SystemInfo,
  DC_NavigateTo,
  DC_Loading,
  DC_SetNavBarColor,
  getRandomStr,
  timeago
}

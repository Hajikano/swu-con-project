// 欢迎页

const app = getApp()
const DC_Component = app.DC_Utils.DC_Component

const PageObj = new app.DC_Utils.DC_Page({
  onLoad() {
    this.forWard()
  },
  onShow() {
    this.forWard()
  },
  forWard() {
    if (app.iDC_Store.state.token !== null) {
      app.iDC_NavigateTo.replace('loading')
    }
  }
})

const mainHeight = app.iDC_SystemInfo.system.height - app.publicData.navBarHeight
const Main = new DC_Component({
  _name: 'Main',
  data: {
    isLoading: true,
    title: app.publicData.name
  },
  style: {
    // 公用样式
    _: {
      'text-align': 'center'
    },
    navbarSpace: {
      height: `${app.publicData.navBarHeight}px`
    },
    headerHeight: {
      height: `${mainHeight * 0.6}px`
    },
    middleSpaceHeight: {
      height: `${mainHeight * 0.3}px`
    },
    footerHeight: {
      height: `${mainHeight * 0.1}px`
    },
    label: {
      color: app.publicData.ColorSet.$subTitle,
      'font-size': app.publicData.SizeMap.$Subhead
    }
  },
  methods: {}
})
PageObj.use(Main)

const iconWidth = app.iDC_SystemInfo.system.width * 0.5
const Header = new DC_Component({
  _name: 'Header',
  data: {
    iconWidth: iconWidth,
    iconHeight: iconWidth
  },
  style: {
    icon: {
      width: '100%'
    },
    title: {
      'margin-top': '20px',
      color: app.publicData.ColorSet.$title,
      'font-size': app.publicData.SizeMap.$LargeTitle
    },
    label: {
      'margin-top': '20px'
    }
  },
  methods: {}
})
PageObj.use(Header)

const ActionArea = new DC_Component({
  _name: 'ActionArea',
  data: {},
  style: {
    action: {
      width: '60%',
      margin: 'auto'
    },
    marginTop: {
      'margin-top': '20px'
    },
    link: {
      margin: '0 20px',
      color: '#1989fa',
      'font-size': app.publicData.SizeMap.$Fontnote
    }
  },
  methods: {
    // 点击账号登录时
    onClick() {
      app.iDC_NavigateTo.push('login')
    },
    // 点击获取账户时
    onGetAccount() {
      wx.showToast({
        title: '请联系相关管理员',
        icon: 'none'
      })
    },
    // 点击游客访问时
    onTourist() {
      wx.showLoading({
        title: '登录中',
        mask: true
      })
      wx.setStorageSync('token', 'token')
      wx.setStorageSync('role', app.publicData.roles.tourist)
      app.iDC_Store.setState('token', 'token')
      app.iDC_Store.setState('role', app.publicData.roles.tourist)
      app.iDC_NavigateTo.replace('loading')
      wx.hideLoading()
    }
  }
})
PageObj.use(ActionArea)

const Footer = new DC_Component({
  _name: 'Footer',
  data: {},
  style: {
    label: {
      'font-size': app.publicData.SizeMap.$Fontnote
    }
  },
  methods: {}
})
PageObj.use(Footer)

Page(PageObj)

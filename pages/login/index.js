// 登录页面

import { login } from '../../apis/account'

const app = getApp()
const DC_Component = app.DC_Utils.DC_Component

const PageObj = new app.DC_Utils.DC_Page({
  onLoad() {}
})

const DC_Layout = new DC_Component({
  _name: 'DC_Layout',
  data: {
    title: '登录'
  },
  style: {},
  methods: {
    onBack() {
      app.iDC_NavigateTo.pop()
    }
  }
})
PageObj.use(DC_Layout)

const MainHeight = app.iDC_SystemInfo.system.height - app.publicData.navBarHeight
const MainWidth = app.iDC_SystemInfo.system.width
const Main = new DC_Component({
  _name: 'Main',
  data: {
    width: MainWidth
  },
  style: {
    _: {
      width: '100%',
      height: `${MainHeight}px`,
      'overflow-y': 'scroll',
      'padding-bottom': '50px',
      'box-sizing': 'border-box'
    }
  },
  methods: {}
})
PageObj.use(Main)

const Action = new DC_Component({
  _name: 'Action',
  data: {
    username: '',
    password: '',
    isPasswordShow: false
  },
  style: {
    marginTop: {
      'margin-top': '20px'
    },
    action: {
      width: '95%',
      margin: 'auto'
    },
    link: {
      color: '#1989fa',
      'font-size': app.publicData.SizeMap.$Fontnote,
      'text-align': 'center'
    },
    headerText: {
      display: 'inline'
    },
    headerTitle: {
      color: app.publicData.ColorSet.$title,
      'font-size': app.publicData.SizeMap.$Title2,
      'font-weight': 'bold'
    },
    headerTitle2: {
      color: app.publicData.ColorSet.$title,
      'font-size': app.publicData.SizeMap.$Headline,
      'font-weight': 'bold'
    }
  },
  methods: {
    // 用户忘记密码时
    onPasswordForget() {
      wx.showToast({
        title: '请联系相关管理员',
        icon: 'none'
      })
    },
    // 用户名修改时
    onUsernameChange(e) {
      this.setData({
        username: e.detail
      })
    },
    // 密码修改时
    onPasswordChange(e) {
      this.setData({
        password: e.detail
      })
    },
    // 改变密码可见性时
    onPasswordVisiableToggle() {
      const { isPasswordShow } = this.getData()
      this.setData({
        isPasswordShow: !isPasswordShow
      })
    },
    // 点击登录时
    async onLogin() {
      wx.showLoading({
        title: '登录中',
        mask: true
      })
      const { username, password } = this.getData()
      if (username.length > 0 && password.length > 0) {
        const res = await login({ username, password })
        const { user_id, userType, token } = res
        app.iDC_Store.setState('token', token)
        app.iDC_Store.setState('user_id', user_id)
        app.iDC_Store.setState('role', userType)
        wx.setStorageSync('token', token)
        wx.setStorageSync('user_id', user_id)
        wx.setStorageSync('role', userType)
        app.iDC_NavigateTo.backToTop()
        wx.hideLoading()
      } else {
        wx.hideLoading()
        wx.showToast({
          title: '输入框不能为空',
          icon: 'none'
        })
      }
    }
  }
})
PageObj.use(Action)

Page(PageObj)

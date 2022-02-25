// 密码修改页

import { changePassword } from '../../apis/account'

const app = getApp()
const DC_Component = app.DC_Utils.DC_Component

const PageObj = new app.DC_Utils.DC_Page({
  onLoad() {}
})

const DC_Layout = new DC_Component({
  _name: 'DC_Layout',
  data: {
    title: '密码修改'
  },
  style: {},
  methods: {
    onBack() {
      app.iDC_NavigateTo.pop()
    }
  }
})
PageObj.use(DC_Layout)

const MainHeight =
  app.iDC_SystemInfo.system.height - app.iDC_SystemInfo.navButton.top - app.iDC_SystemInfo.navButton.height - 10 - 50
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
    oldPassword: '',
    newPassword: '',
    isOldPasswordShow: false,
    isNewPasswordShow: false
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
    // 点击修改密码时
    async onChangePassword() {
      wx.showLoading({
        title: '修改中',
        mask: true
      })
      const { oldPassword, newPassword } = this.getData()
      if (oldPassword.length > 0 && newPassword.length > 0) {
        await changePassword({ oldPassword, newPassword })
        wx.hideLoading()
        wx.showToast({
          title: '密码修改成功',
          icon: 'none'
        })
        setTimeout(() => {
          app.iDC_NavigateTo.pop()
        }, 1000)
      } else {
        wx.hideLoading()
        wx.showToast({
          title: '输入框不能为空',
          icon: 'none'
        })
      }
    },
    // 原密码修改时
    onOldPasswordChange(e) {
      this.setData({
        oldPassword: e.detail
      })
    },
    // 新密码修改时
    onNewPasswordChange(e) {
      this.setData({
        newPassword: e.detail
      })
    },
    // 改变原密码可见性时
    onOldPasswordVisiableToggle() {
      const { isOldPasswordShow } = this.getData()
      this.setData({
        isOldPasswordShow: !isOldPasswordShow
      })
    },
    // 改变新密码可见性时
    onNewPasswordVisiableToggle() {
      const { isNewPasswordShow } = this.getData()
      this.setData({
        isNewPasswordShow: !isNewPasswordShow
      })
    }
  }
})
PageObj.use(Action)

Page(PageObj)

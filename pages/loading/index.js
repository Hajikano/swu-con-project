// loading页面

const app = getApp()
const DC_Component = app.DC_Utils.DC_Component

const PageObj = new app.DC_Utils.DC_Page({
  onShow() {
    this.forward()
  },
  // 根据存储数据跳转至相应页面
  forward() {
    const localToken = wx.getStorageSync('token')
    if (localToken) {
      const user_id = wx.getStorageSync('user_id')
      const localRole = wx.getStorageSync('role')
      app.iDC_Store.setState('token', localToken)
      app.iDC_Store.setState('user_id', user_id)
      app.iDC_Store.setState('role', localRole)
      app.iDC_NavigateTo.replace('home')
    } else {
      wx.removeStorageSync('token')
      wx.removeStorageSync('role')
      wx.removeStorageSync('user_id')
      app.iDC_Store.setState('token', null)
      app.iDC_Store.setState('role', null)
      app.iDC_Store.setState('user_id', null)
      app.iDC_NavigateTo.replace('welcome')
    }
  }
})

const Main = new DC_Component({
  _name: 'Main',
  data: {},
  style: {
    _: {
      height: '100%',
      width: '100%'
    }
  },
  methods: {}
}).HStack('center', 'center')
PageObj.use(Main)

Page(PageObj)

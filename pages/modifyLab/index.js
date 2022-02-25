// 实验信息编辑页

import { postLab, modifyLab } from '../../apis/lab'

const app = getApp()
const DC_Component = app.DC_Utils.DC_Component

const PageObj = new app.DC_Utils.DC_Page({
  onLoad(options) {
    const { lab_id, course_id, name, startTime, endTime } = options
    if (lab_id === undefined) {
      DC_Layout.setData({
        title: '添加实验',
        course_id: parseInt(course_id)
      })
    } else {
      DC_Layout.setData({
        title: '修改实验',
        course_id: parseInt(course_id),
        lab_id: parseInt(lab_id)
      })
      Action.setData({
        labName: name,
        startTime: parseInt(startTime),
        endTime: parseInt(endTime)
      })
    }
  }
})

const DC_Layout = new DC_Component({
  _name: 'DC_Layout',
  data: {
    title: '添加实验',
    course_id: null,
    lab_id: null
  },
  style: {},
  methods: {
    // 点击退出时
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
    labName: '',
    popStatus: 0, // 0-hide 1-startTime 2-endTime
    startTime: new Date().getTime(),
    endTime: new Date().getTime() + 4 * 60 * 60 * 1000,
    minDate: new Date().getTime()
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
    // 用户名修改时
    onLabNameChange(e) {
      this.setData({
        labName: e.detail
      })
    },
    // 提交表单时
    async onSubmit() {
      const { lab_id } = DC_Layout.getData()
      if (lab_id === null) {
        this.onAdd()
      } else {
        this.onModify()
      }
    },
    // 点击修改时
    async onModify() {
      wx.showLoading({
        title: '添加中',
        mask: true
      })
      const { lab_id } = DC_Layout.getData()
      const { labName, startTime, endTime } = this.getData()
      if (labName.length > 0) {
        const res = await modifyLab({ lab_id, labName, startTime, endTime })
        wx.hideLoading()
        wx.showToast({
          title: res.message,
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
    // 点击添加时
    async onAdd() {
      wx.showLoading({
        title: '添加中',
        mask: true
      })
      const { course_id } = DC_Layout.getData()
      const { labName, startTime, endTime } = this.getData()
      if (labName.length > 0) {
        const res = await postLab({ course_id, labName, startTime, endTime })
        wx.hideLoading()
        wx.showToast({
          title: res.message,
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
    // 关闭弹出层时
    onPopClose() {
      this.setData({
        popStatus: 0
      })
    },
    // 点击修改日期时间时
    onDateCellClick(e) {
      const { status } = e.currentTarget.dataset
      this.setData({
        popStatus: status
      })
    },
    // 日期时间修改时
    onDateInput(e) {
      const { popStatus } = this.getData()
      if (popStatus === 1) {
        this.setData({
          startTime: e.detail
        })
      } else if (popStatus === 2) {
        this.setData({
          endTime: e.detail
        })
      }
    }
  }
})
PageObj.use(Action)

Page(PageObj)

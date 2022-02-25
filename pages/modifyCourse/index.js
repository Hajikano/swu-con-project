// 课程信息编辑页

import { postCourse, modifyCourse } from '../../apis/course'

const app = getApp()
const DC_Component = app.DC_Utils.DC_Component

const PageObj = new app.DC_Utils.DC_Page({
  onLoad(options) {
    const { course_id, courseName } = options
    if (course_id !== undefined) {
      DC_Layout.setData({
        title: '修改课程',
        course_id: parseInt(course_id)
      })
      Action.setData({
        courseName: courseName !== undefined ? courseName : ''
      })
    }
  }
})

const DC_Layout = new DC_Component({
  _name: 'DC_Layout',
  data: {
    title: '添加课程',
    course_id: null // 若没有course_id 则为添加课程模式
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
    },
    fieldContainer: {
      'box-sizing': 'border-box',
      padding: '20px',
      'background-color': '#ffffff'
    }
  },
  methods: {}
})
PageObj.use(Main)

const Action = new DC_Component({
  _name: 'Action',
  data: {
    courseName: ''
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
    onCourseNameChange(e) {
      this.setData({
        courseName: e.detail
      })
    },
    // 提交表单时
    async onSubmit() {
      const { course_id } = DC_Layout.getData()
      if (course_id !== null) {
        this.onModify()
      } else {
        this.onAdd()
      }
    },
    // 点击登录时
    async onModify() {
      wx.showLoading({
        title: '添加中',
        mask: true
      })
      const { course_id } = DC_Layout.getData()
      const { courseName } = this.getData()
      if (courseName.length > 0) {
        const res = await modifyCourse({ course_id, courseName })
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
    // 提交修改时
    async onAdd() {
      wx.showLoading({
        title: '添加中',
        mask: true
      })
      const { courseName } = this.getData()
      if (courseName.length > 0) {
        const res = await postCourse({ courseName })
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
    }
  }
})
PageObj.use(Action)

Page(PageObj)

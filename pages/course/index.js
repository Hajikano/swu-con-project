// 课程页

import Dialog from '../../components/@vant/weapp/dialog/dialog'
import { takeCourse, deleteCourse, getCourseList } from '../../apis/course'
import { getLabList, deleteLab } from '../../apis/lab'

const app = getApp()
const DC_Component = app.DC_Utils.DC_Component

const PageObj = new app.DC_Utils.DC_Page({
  onLoad(options) {
    const { active } = options
    this.init(active)
  },
  onShow() {
    CourseList.init()
  },
  init(active) {
    DC_Layout.init()
    CourseList.init()
    Tab.init(active)
  }
})

const DC_Layout = new DC_Component({
  _name: 'DC_Layout',
  data: {
    title: '课程',
    role: app.iDC_Store.state.role,
    role_teacher: app.publicData.roles.teacher,
    role_student: app.publicData.roles.student
  },
  style: {},
  methods: {
    init() {
      this.setData({
        role: app.iDC_Store.state.role
      })
    },
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
      height: `${MainHeight}px`
    }
  },
  methods: {}
})
PageObj.use(Main)

const Tab = new DC_Component({
  _name: 'Tab',
  data: {
    active: 0
  },
  style: {
    _: {
      width: '100%',
      'background-color': '#FFFFFF',
      display: 'flex',
      'align-items': 'center'
    },
    tab: {
      width: '70%'
    },
    action: {
      width: '25%',
      'text-align': 'right',
      'margin-top': '5px'
    },
    action_icon: {
      'font-size': '22px',
      color: '#409EFF'
    }
  },
  methods: {
    init(active) {
      if (active === '1') {
        this.setData({
          active: parseInt(active)
        })
      }
    },
    // 标签页切换时
    onChange(e) {
      const active = e.detail.index
      this.setData({
        active
      })
      const { courseLists, hasCourseNameSearch } = CourseList.getData()
      if (courseLists[active].list.length === 0 || hasCourseNameSearch) {
        CourseList.init()
        CourseList.setData({
          hasCourseNameSearch: false
        })
      }
      CourseCard.init()
    },
    // 点击添加按钮时
    onAddCourse() {
      app.iDC_NavigateTo.push('modifyCourse')
    }
  }
})
PageObj.use(Tab)

const INIT_PAGENUM = 1
const INIT_PAGESIZE = 10
const CourseList = new DC_Component({
  _name: 'CourseList',
  data: {
    isRefresh: false, // 顶部下拉刷新状态
    statusOfBottomLoading: 0, // 底部加载状态 0-未触发 1-加载中 2-全部加载
    courseLists: [
      {
        pageNum: INIT_PAGENUM,
        pageSize: INIT_PAGESIZE,
        list: []
      },
      {
        pageNum: INIT_PAGENUM,
        pageSize: INIT_PAGESIZE,
        list: []
      }
    ], // 存储课程列表
    topPosition: 0,
    courseName: '', // 搜索课程的名称
    hasCourseNameSearch: false
  },
  style: {
    _: {
      width: '100%',
      height: `${MainHeight - 44 - 54}px`
    }
  },
  methods: {
    // 初始化函数
    init() {
      this.setData({
        isRefresh: true,
        statusOfBottomLoading: 0
      })
    },
    // 设定课程列表
    // isAdding 是否续接原列表
    async setCourseList(isAdding = true) {
      const { courseLists, courseName } = this.getData()
      const { active } = Tab.getData()
      const { pageNum } = courseLists[active]
      const { pageSize } = courseLists[active]
      const oldList = courseLists[active].list
      const res = await getCourseList({ courseName, pageNum, pageSize, isPersonal: active })
      const { courseList } = res.data
      this.setData({
        [`courseLists[${active}].list`]: isAdding ? [...oldList, ...courseList] : courseList
      })
      return courseList.length
    },
    // 点击下拉刷新时
    async onRefresh() {
      const { active } = Tab.getData()
      this.setData({
        topPosition: 0,
        [`courseLists[${active}].pageNum`]: INIT_PAGENUM
      })
      await this.setCourseList(false) // 需要替换原列表
      this.setData({
        isRefresh: false,
        statusOfBottomLoading: 0
      })
      CourseCard.onShow()
    },
    // 滑动到底部时
    async onToLower() {
      const { statusOfBottomLoading } = this.getData()
      if (statusOfBottomLoading === 0) {
        const { active } = Tab.getData()
        const { courseLists } = this.getData()
        const oldPageNum = courseLists[active].pageNum
        this.setData({
          [`courseLists[${active}].pageNum`]: oldPageNum + 1, // 暂时加一用于查询
          statusOfBottomLoading: 1 // 置标记为加载中，防止重复查询
        })
        const newLength = await this.setCourseList()
        this.setData({
          [`courseLists[${active}].pageNum`]: newLength > 0 ? oldPageNum + 1 : oldPageNum, // 若新查询的列表长度大于0，则分页加1，否则保持原分页
          statusOfBottomLoading: newLength < INIT_PAGESIZE ? 2 : 0 // 若新返回的列表数量小于分页数量，则置标记为全部加载
        })
      }
    },
    // 搜索内容改变时
    onChange(e) {
      this.setData({
        courseName: e.detail
      })
    },
    // 点击搜索时
    onSearch() {
      this.setData({
        hasCourseNameSearch: true
      })
      this.init()
      CourseCard.init()
    }
  }
})
PageObj.use(CourseList)

const CourseCard = new DC_Component({
  _name: 'CourseCard',
  data: {
    colors: ['#E6A23C', '#67C23A', '#409EFF', '#F56C6C'],

    active_index: null, // 当前选中的课程列表索引
    active_course_id: null, // 当前选中的课程列表id
    isSheetShow: false,
    sheetActions: (() => {
      const studentsActions = [
        {
          motive: 'join',
          name: '加入课程'
        }
      ]
      const teachersActions = [
        {
          motive: 'modify',
          name: '修改课程'
        },
        {
          motive: 'delete',
          name: '删除课程'
        }
      ]
      return {
        [app.publicData.roles.teacher]: teachersActions,
        [app.publicData.roles.student]: studentsActions
      }
    })(),

    isDetailShow: false,
    isDetailComplete: false,
    labList: [],

    active_lab_index: null, // 当前选中的实验列表索引
    active_lab_id: null, // 当前选中的实验列表id
    isLabSheetShow: false,
    labSheetActions: (() => {
      const studentsActions = [
        {
          motive: 'detail',
          name: '实验详情'
        }
      ]
      const teachersActions = [
        {
          motive: 'modify',
          name: '修改实验'
        },
        {
          motive: 'delete',
          name: '删除实验'
        }
      ]
      return {
        [app.publicData.roles.teacher]: teachersActions,
        [app.publicData.roles.student]: studentsActions
      }
    })()
  },
  style: {
    _: {
      width: '95%',
      'background-color': '#FFFFFF',
      margin: 'auto',
      'margin-top': '20px',
      'box-shadow': '0px 0px 10px 5px rgba(99, 99, 172, 0.1)',
      overflow: 'hidden',
      'border-radius': '10px'
    },
    header: {
      'background-color': '#409EFF'
    },
    header_cell_title: {
      color: '#F7F7F7',
      'font-size': app.publicData.SizeMap.$Title2,
      'font-weight': 'bold',
      '-webkit-line-clamp': '1'
    },
    content: {
      'background-color': '#FFFFFF'
      // 'box-sizing': 'border-box',
      // padding: '10px 0',
    },
    content_cell_title: {
      'font-size': app.publicData.SizeMap.$Headline,
      'font-weight': 'bold',
      '-webkit-line-clamp': '1'
      // margin: '20px 0 5px 0',
    },
    content_cell_label: {
      'font-size': app.publicData.SizeMap.$Caption1,
      '-webkit-line-clamp': '1'
      // margin: '5px 0 20px 0',
    },
    detail: {
      width: '100%',
      'box-sizing': 'border-box',
      padding: '10px'
    }
  },
  methods: {
    // 初始化方法
    init() {
      this.setData({
        active_index: null, // 当前选中的课程列表索引
        active_course_id: null, // 当前选中的课程列表id
        isSheetShow: false,
        isDetailShow: false,
        isDetailComplete: false,
        labList: []
      })
    },
    // 配合页面onShow
    async onShow() {
      const { active_course_id } = this.getData()
      if (active_course_id !== null) {
        this.setData({
          isDetailComplete: false
        })
        this.setDetail()
      }
    },
    // 点击详情时
    async onClick(e) {
      const active_course_id_new = e.currentTarget.dataset.id
      const active_index = e.currentTarget.dataset.index
      const active_has = e.currentTarget.dataset.has
      const { active_course_id } = this.getData()
      if (active_has !== 1 || active_course_id === active_course_id_new) {
        this.init()
      } else {
        this.setData({
          active_index,
          active_course_id: active_course_id_new,
          isDetailComplete: false,
          isDetailShow: true
        })
        await this.setDetail()
      }
    },
    // 获取课程详情
    async setDetail() {
      const { active_course_id } = this.getData()
      const res = await getLabList({ course_id: active_course_id })
      const { labList } = res.data
      let newLabList = []
      for (let i of labList) {
        newLabList.push({
          id: i.id,
          name: i.name,
          status: this.getLabStatusByTimestamp(i.startTime, i.endTime),
          startTime: i.startTime,
          endTime: i.endTime
        })
      }
      this.setData({
        labList: newLabList,
        isDetailComplete: true
      })
    },
    // 通过时间戳获取实验进行状态
    getLabStatusByTimestamp(startTime, endTime) {
      const nowTime = new Date().getTime()
      let status = null
      if (nowTime < startTime) {
        status = ['即将开始', '#409EFF']
      } else if (nowTime >= startTime && nowTime < endTime) {
        status = ['进行中', '#67C23A']
      } else {
        status = ['已结束', '#909399']
      }
      return status
    },
    // 开启Sheet时
    onSheetShow(e) {
      const active_course_id = e.currentTarget.dataset.id
      const active_index = e.currentTarget.dataset.index
      this.init()
      this.setData({ active_index, active_course_id, isSheetShow: true })
    },
    // 关闭Sheet时
    onSheetClose() {
      this.init()
    },
    // 选择Sheet选项时
    onSheetSelect(e) {
      const { motive } = e.detail
      const { active_course_id } = this.getData()
      if (motive === 'join') {
        // 加入课程
        this.onTake(active_course_id)
      } else if (motive === 'modify') {
        // 修改课程
        const { active_index } = this.getData()
        const { courseLists } = CourseList.getData()
        const { active } = Tab.getData()
        app.iDC_NavigateTo.push('modifyCourse', {
          course_id: active_course_id,
          courseName: courseLists[active].list[active_index].name
        })
      } else if (motive === 'delete') {
        // 删除课程
        this.onDelete(active_course_id)
      }
    },
    // 删除课程时
    onDelete(course_id) {
      Dialog.confirm({
        title: '是否删除该课程',
        message: '课程删除后，所有该课程相关数据将会被移除，请谨慎操作'
      })
        .then(() => {
          wx.showLoading({
            title: '删除中',
            mask: true
          })
          deleteCourse({ course_id })
            .then((res) => {
              CourseList.setData({
                isRefresh: true
              })
              wx.hideLoading()
              wx.showToast({
                title: res.message,
                icon: 'none'
              })
            })
            .catch((e) => {})
        })
        .catch(() => {})
    },
    // 加入课程时
    onTake(course_id) {
      Dialog.confirm({
        title: '是否加入该课程'
      })
        .then(() => {
          wx.showLoading({
            title: '请求中',
            mask: true
          })
          takeCourse({ course_id })
            .then((res) => {
              CourseList.setData({
                isRefresh: true
              })
              wx.hideLoading()
              wx.showToast({
                title: res.message,
                icon: 'none'
              })
            })
            .catch((e) => {})
        })
        .catch(() => {})
    },
    // 添加实验时
    onAddLab(e) {
      const { id } = e.currentTarget.dataset
      app.iDC_NavigateTo.push('modifyLab', {
        course_id: id,
        launchPram: 'add'
      })
    },
    // 开启实验Sheet时
    onLabSheetShow(e) {
      const active_lab_id = e.currentTarget.dataset.id
      const active_lab_index = e.currentTarget.dataset.index
      this.setData({ active_lab_id, active_lab_index, isLabSheetShow: true })
    },
    // 关闭实验Sheet时
    onLabSheetClose() {
      this.setData({ isLabSheetShow: false })
    },
    // 选择实验Sheet选项时
    onLabSheetSelect(e) {
      const { motive } = e.detail
      const { labList, active_course_id, active_lab_id, active_lab_index } = this.getData()
      if (motive === 'detail') {
        // 实验详情
        const { endTime } = labList[active_lab_index]
        if (Date.now() > endTime) {
          wx.showToast({
            title: '实验已结束',
            icon: 'none'
          })
        } else {
          app.iDC_NavigateTo.push('lab', {
            lab_id: active_lab_id
          })
        }
      } else if (motive === 'modify') {
        // 修改实验
        const lab = labList[active_lab_index]
        const { name, startTime, endTime } = lab
        app.iDC_NavigateTo.push('modifyLab', {
          lab_id: active_lab_id,
          course_id: active_course_id,
          name,
          startTime,
          endTime
        })
      } else if (motive === 'delete') {
        // 删除实验
        this.onDeleteLab()
      }
    },
    // 添加实验时
    async onDeleteLab() {
      Dialog.confirm({
        title: '是否删除该实验',
        message: '实验删除后，所有该实验相关数据将会被移除，请谨慎操作'
      })
        .then(() => {
          wx.showLoading({
            title: '删除中',
            mask: true
          })
          const { active_lab_id } = this.getData()
          deleteLab({ lab_id: active_lab_id })
            .then((res) => {
              CourseList.setData({
                isRefresh: true
              })
              wx.hideLoading()
              wx.showToast({
                title: res.message,
                icon: 'none'
              })
            })
            .catch((e) => {})
        })
        .catch(() => {})
    }
  }
})
PageObj.use(CourseCard)

Page(PageObj)

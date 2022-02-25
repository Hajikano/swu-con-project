// 首页

import Dialog from '../../components/@vant/weapp/dialog/dialog'
import { getUserInfo } from '../../apis/account'
import { getVideoUrlList } from '../../apis/video'
const app = getApp()
const DC_Component = app.DC_Utils.DC_Component

const PageObj = new app.DC_Utils.DC_Page({
  onLoad() {
    this.init()
  },
  onShow() {
    RecordCard.init()
  },
  // 初始化函数
  init() {
    DC_Tabbar.init()
    DC_Layout.init()
    Mine.init()
    Videos.init()
  }
})

const DC_Layout = new DC_Component({
  _name: 'DC_Layout',
  data: {
    role: app.publicData.roles.tourist,
    role_tourist: app.publicData.roles.tourist,
    role_teacher: app.publicData.roles.teacher,
    role_student: app.publicData.roles.student
  },
  style: {},
  methods: {
    init() {
      this.setData({
        role: app.iDC_Store.state.role
      })
    }
  }
})
PageObj.use(DC_Layout)

const MainHeight =
  app.iDC_SystemInfo.system.height - app.iDC_SystemInfo.navButton.top - app.iDC_SystemInfo.navButton.height - 10 - 50
const Main = new DC_Component({
  _name: 'Main',
  data: {},
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

const Home = new DC_Component({
  _name: 'Home',
  data: {},
  style: {
    gridContent: {
      display: 'flex',
      'box-sizing': 'border-box',
      padding: '5px'
    },
    gridContentIcon: {
      'font-size': app.publicData.SizeMap.$LargeTitle,
      display: 'block',
      height: '100%',
      width: '22%',
      overflow: 'hidden'
    },
    gridContentInfo: {
      width: '78%'
    },
    gridContentTitle: {
      'font-weight': 'bold',
      'font-size': app.publicData.SizeMap.$Headline
    },
    gridContentLabel: {
      'font-size': app.publicData.SizeMap.$Caption1,
      'margin-top': '10px',
      color: app.publicData.ColorSet.$subTitle
    }
  },
  methods: {
    // 点击实验按钮时
    onLabClick() {
      app.iDC_NavigateTo.push('course', {
        active: 1
      })
    },
    // 点击标准曲线法时
    onCalculate() {
      const { isComplete, fileList } = RecordCard.getData()
      if (isComplete && fileList.length < app.publicData.maxRecordsNum) {
        wx.showLoading({
          title: '加载中',
          mask: true
        })
        const iFileManager = app.iFileManager
        const newDirName = iFileManager.createExperimentLocalDir(`未命名实验记录${fileList.length + 1}`)
        iFileManager.createExperimentJSON(
          iFileManager.ROOT_PATH + iFileManager.EXPERIMENTS_DIRNAME + iFileManager.LOCAL_DIRNAME + newDirName
        )
        wx.hideLoading()
        app.iDC_NavigateTo.push('experiment', {
          fileDir:
            iFileManager.ROOT_PATH + iFileManager.EXPERIMENTS_DIRNAME + iFileManager.LOCAL_DIRNAME + `${newDirName}`
        })
      } else if (isComplete) {
        wx.showToast({
          title: '实验记录数已达上限',
          icon: 'none'
        })
      }
    }
  }
})
PageObj.use(Home)

const RecordCard = new DC_Component({
  _name: 'RecordCard',
  data: {
    isComplete: false,
    fileList: []
  },
  style: {
    _: {
      width: '95%',
      'box-sizing': 'border-box',
      padding: '5px',
      'background-color': '#FFFFFF',
      margin: 'auto',
      'margin-top': '10px',
      'box-shadow': '0px 0px 10px 5px rgba(99, 99, 172, 0.05)',
      overflow: 'hidden',
      'border-radius': '10px'
    },
    headerTitle: {
      'font-weight': 'bold',
      'font-size': app.publicData.SizeMap.$Headline
    },
    cellIcon: {
      'font-size': app.publicData.SizeMap.$LargeTitle,
      'margin-right': '20px'
    },
    cellTitle: {
      'font-weight': 'bold',
      'font-size': app.publicData.SizeMap.$Subhead
    },
    cellLabel: {
      'font-size': app.publicData.SizeMap.$Caption1
    }
  },
  methods: {
    // 初始化函数
    init() {
      const iFileManager = app.iFileManager
      const localDirArr = iFileManager.FS.readdirSync(
        iFileManager.ROOT_PATH + iFileManager.EXPERIMENTS_DIRNAME + iFileManager.LOCAL_DIRNAME
      )
      if (localDirArr.length > 0) {
        const dateReg = /^(\d*)_/
        const nameReg = /^.*_.*_(.*)$/
        let fileList = []
        for (let i of localDirArr) {
          const date = new Date(parseInt(i.match(dateReg)[1]))
          const recordName = i.match(nameReg)[1]
          fileList.push({
            dirName: i,
            recordName,
            time: new Date(date).getTime(),
            timeago: app.timeago(date)
          })
        }
        fileList.sort((a, b) => {
          return b.time - a.time
        })
        this.setData({
          fileList
        })
      } else {
        this.setData({
          fileList: []
        })
      }
      this.setData({
        isComplete: true
      })
    },
    // 点击时
    onClick(e) {
      const { dirname } = e.currentTarget.dataset
      const iFileManager = app.iFileManager
      app.iDC_NavigateTo.push('experiment', {
        fileDir: iFileManager.ROOT_PATH + iFileManager.EXPERIMENTS_DIRNAME + iFileManager.LOCAL_DIRNAME + `/${dirname}`
      })
    }
  }
})
PageObj.use(RecordCard)

const Items = new DC_Component({
  _name: 'Items',
  data: {
    items: [],
    maxItemsNum: app.publicData.maxItemsNum
  },
  style: {
    leftArea: {
      'margin-left': '10px'
    },
    title: {
      color: app.publicData.ColorSet.$title,
      'font-weight': 'bold',
      'font-size': app.publicData.SizeMap.$Title3
    },
    label: {
      'margin-top': '7px',
      color: app.publicData.ColorSet.$body,
      'font-size': app.publicData.SizeMap.$Caption1
    }
  },
  methods: {
    onClick(e) {
      const itemID = e.currentTarget.dataset.id
      app.iDC_NavigateTo.push('edit', [
        {
          key: 'itemID',
          value: itemID
        }
      ])
    },
    onAdd() {
      app.iDC_NavigateTo.push('edit', [
        {
          key: 'isAdd',
          value: true
        }
      ])
    },
    onRun() {
      const { items } = this.getData()
      let isComplete = true
      items.forEach((item) => {
        if (item.rgbkAvarage.value.length === 0) {
          isComplete = false
        }
      })
      if (isComplete) {
        app.iDC_NavigateTo.push('run')
      } else {
        Dialog.alert({
          title: '预测失败',
          message: '存在未完成项目，请完成后重试'
        }).then(() => {})
      }
    }
  }
})
PageObj.use(Items)

const INIT_PAGENUM = 1
const INIT_PAGESIZE = 10
const Videos = new DC_Component({
  _name: 'Videos',
  data: {
    isOK: 0,
    isRefresh: false, // 顶部下拉刷新状态
    statusOfBottomLoading: 0, // 底部加载状态 0-未触发 1-加载中 2-全部加载
    pageNum: INIT_PAGENUM,
    pageSize: INIT_PAGESIZE,
    videoUrlList: []
  },
  style: {
    _: {
      width: '100%',
      height: `${MainHeight}px`
    },
    cell_container: {
      width: '95%',
      margin: 'auto',
      'margin-top': '10px',
      'box-shadow': '0px 0px 10px 5px rgba(99, 99, 172, 0.05)',
      'box-sizing': 'border-box',
      padding: '5px',
      'background-color': '#FFFFFF'
    },
    cell_title: {
      color: app.publicData.ColorSet.$title,
      'font-size': app.publicData.SizeMap.$Headline,
      'font-weight': 'bold',
      '-webkit-line-clamp': '2',
      'margin-bottom': '10px'
    },
    cell_label: {
      color: app.publicData.ColorSet.$body,
      'font-size': app.publicData.SizeMap.$Fontnote,
      '-webkit-line-clamp': '2'
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
    // 设定视频列表
    // isAdding 是否续接原列表
    async setVideoUrlList(isAdding = true) {
      const { pageSize, pageNum } = this.getData()
      const oldList = this.getData().videoUrlList
      try {
        const res = await getVideoUrlList({
          pageSize,
          pageNum
        })
        let videoUrlList = []
        for (let i of res.videoUrlList) {
          videoUrlList.push({
            id: i.id,
            bvid: i.bvid,
            name: i.name,
            label: i.label
          })
        }
        this.setData({
          videoUrlList: isAdding ? [...oldList, ...videoUrlList] : videoUrlList,
          isOK: 1
        })
        return videoUrlList.length
      } catch (e) {
        this.setData({ isOK: 2 })
      }
    },
    // 点击视频链接时
    onAddressClick(e) {
      const { bvid } = e.currentTarget.dataset
      wx.navigateToMiniProgram({
        appId: 'wx7564fd5313d24844',
        path: `pages/video/video?bvid=${bvid}`
      })
    },
    // 点击下拉刷新时
    async onRefresh() {
      this.setData({
        pageNum: INIT_PAGENUM
      })
      await this.setVideoUrlList(false) // 需要替换原列表
      this.setData({
        isRefresh: false,
        statusOfBottomLoading: 0
      })
    },
    // 滑动到底部时
    async onToLower() {
      const { pageNum, statusOfBottomLoading } = this.getData()
      if (statusOfBottomLoading === 0) {
        const oldPageNum = pageNum
        this.setData({
          pageNum: oldPageNum + 1, // 暂时加一用于查询
          statusOfBottomLoading: 1 // 置标记为加载中，防止重复查询
        })
        const newLength = await this.setVideoUrlList()
        this.setData({
          pageNum: newLength > 0 ? oldPageNum + 1 : oldPageNum, // 若新查询的列表长度大于0，则分页加1，否则保持原分页
          statusOfBottomLoading: newLength < INIT_PAGESIZE ? 2 : 0 // 若新返回的列表数量小于分页数量，则置标记为全部加载
        })
      }
    }
  }
})
PageObj.use(Videos)

const Mine = new DC_Component({
  _name: 'Mine',
  data: {
    name: '',
    schoolName: ''
  },
  style: {
    _: {},
    avatarTitle: {
      'font-weight': 'bold',
      'font-size': app.publicData.SizeMap.$Title3
    },
    avatarLabel: {
      'font-size': app.publicData.SizeMap.$Caption1
    },
    gridContent: {
      height: '60px',
      display: 'flex'
    },
    gridItemIcon: {
      'font-size': app.publicData.SizeMap.$Title2,
      display: 'block',
      height: '100%',
      width: '22%'
    },
    gridItemTitle: {
      'font-weight': 'bold',
      'font-size': app.publicData.SizeMap.$Headline
    },
    gridItemLabel: {
      'font-size': app.publicData.SizeMap.$Caption1,
      'margin-top': '10px',
      color: '#969799'
    }
  },
  methods: {
    // 初始化函数
    init() {
      const roleNames = {
        '-1': '游客',
        1: '教师用户',
        2: '学生用户'
      }
      const schoolNames = {
        '-1': '登录后可查看学校',
        1: '未知学校',
        2: '未知学校'
      }
      this.setData({
        name: roleNames[app.iDC_Store.state.role],
        schoolName: schoolNames[app.iDC_Store.state.role]
      })
      if (app.iDC_Store.state.role !== app.publicData.roles.tourist) {
        this.setUserInfo()
      }
    },
    // 设定视频列表
    async setUserInfo() {
      const res = await getUserInfo()
      const { name, schoolName } = res
      this.setData({ name, schoolName })
    },
    // 点击退出登录时
    onLogout() {
      Dialog.confirm({
        title: '是否退出登录'
      })
        .then(() => {
          wx.showLoading({
            title: '退出中',
            mask: true
          })
          this.accountRestore()
          wx.hideLoading()
        })
        .catch(() => {})
    },
    // 清除登录信息 回到欢迎页
    accountRestore() {
      wx.removeStorageSync('token')
      wx.removeStorageSync('role')
      wx.removeStorageSync('user_id')
      app.iDC_Store.setState('token', null)
      app.iDC_Store.setState('role', null)
      app.iDC_Store.setState('user_id', null)
      app.iDC_NavigateTo.replace('loading')
    },
    // 点击课程时
    onCourseClick() {
      app.iDC_NavigateTo.push('course')
    },
    // 点击关于时
    onInfoClick() {
      wx.showToast({
        title: `系统版本${app.publicData.systemInfo}`,
        icon: 'none'
      })
    },
    // 点击安全时
    onSecureClick() {
      app.iDC_NavigateTo.push('password')
    }
  }
})
PageObj.use(Mine)

const DC_Tabbar = new DC_Component({
  _name: 'DC_Tabbar',
  data: {
    active: 'home',
    navBarColor: '#ffffff',
    title: app.publicData.name
  },
  style: {},
  methods: {
    //  初始化函数
    init() {
      this.onChange({ detail: DC_Tabbar.getData().active })
    },
    // 切换底部路由时
    onChange(e) {
      let setObj = {
        active: e.detail
      }
      switch (e.detail) {
        case 'mine':
          {
            setObj = { ...this.onMineShow(), ...setObj }
          }
          break
        default:
          {
            setObj.title = app.publicData.name
            setObj.navBarColor = '#ffffff'
          }
          break
      }
      this.setData(setObj)
    },
    // 切换到我的页面时
    onMineShow() {
      return {
        title: '我的',
        navBarColor: 'rgba(0,0,0,0)'
      }
    }
  }
})
PageObj.use(DC_Tabbar)

Page(PageObj)

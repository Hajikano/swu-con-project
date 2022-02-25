// 实验详情页

import Dialog from '../../components/@vant/weapp/dialog/dialog'
import { queryLabStatus, takeLab } from '../../apis/lab'

const app = getApp()
const DC_Component = app.DC_Utils.DC_Component

const PageObj = new app.DC_Utils.DC_Page({
  onLoad(options) {
    const { lab_id } = options
    this.init(lab_id)
  },
  onShow() {
    Steps.init()
  },
  // 初始化函数
  init(lab_id) {
    DC_Layout.init(lab_id)
  }
})

const DC_Layout = new DC_Component({
  _name: 'DC_Layout',
  data: {
    title: '实验详情',
    lab_id: null
  },
  style: {},
  methods: {
    // 初始化函数
    init(lab_id) {
      this.setData({
        lab_id: parseInt(lab_id)
      })
    },
    // 返回上一页
    onBack() {
      app.iDC_NavigateTo.pop()
    }
  }
})
PageObj.use(DC_Layout)

const MainHeight = app.iDC_SystemInfo.system.height - app.publicData.navBarHeight
const Main = new DC_Component({
  _name: 'Main',
  data: {
    isRefresh: false
  },
  style: {
    _: {
      width: '100%',
      height: `${MainHeight}px`
    }
  },
  methods: {
    // 下拉刷新时
    async onRefresh() {
      await Steps.setStatus()
      this.setData({
        isRefresh: false
      })
    }
  }
})
PageObj.use(Main)

const Steps = new DC_Component({
  _name: 'Steps',
  data: {
    steps: [],
    status: -1,
    activeColor: '#409EFF'
  },
  style: {
    _: {
      width: '95%',
      margin: 'auto',
      'margin-top': '20px',
      'box-sizing': 'border-box',
      'background-color': '#ffffff',
      padding: '20px',
      'box-shadow': '0px 0px 10px 5px rgba(99, 99, 172, 0.1)'
    },
    title: {
      'font-size': app.publicData.SizeMap.$Title2,
      'font-weight': 'bold',
      'margin-bottom': '10px'
    }
  },
  methods: {
    // 初始化函数
    init() {
      this.setStatus()
    },
    // 设定实验阶段显示内容
    setSteps() {
      let { status } = this.getData()
      let activeColor = '#409EFF'
      let stepsTemplete = [
        {
          text: '预习答题',
          desc: '未完成'
        },
        {
          text: '标准曲线',
          desc: '未完成'
        },
        {
          text: '实验提交',
          desc: '未完成'
        }
      ]
      for (let i = 0; i < stepsTemplete.length; i++) {
        if (status >= 2) {
          status = 2
          stepsTemplete[status].desc = '已提交'
          activeColor = '#67C23A'
        }
        if (i < status) {
          stepsTemplete[i].desc = '已完成'
        } else if (i === status && status < 2) {
          stepsTemplete[i].desc = '进行中'
        }
      }
      this.setData({
        steps: stepsTemplete,
        status: status,
        activeColor: activeColor
      })
    },
    // 设定实验状态
    async setStatus() {
      const { lab_id } = DC_Layout.getData()
      try {
        const res = await queryLabStatus({ lab_id })
        this.setData({
          status: res.data.status
        })
        this.setSteps()
      } catch (e) {
        await takeLab({ lab_id })
        this.setData({
          status: 0
        })
        this.setSteps()
      }
    }
  }
})
PageObj.use(Steps)

const Contents = new DC_Component({
  _name: 'Contents',
  data: {},
  style: {
    _: {
      width: '95%',
      margin: 'auto',
      'margin-top': '20px',
      'background-color': '#ffffff',
      'box-shadow': '0px 0px 10px 5px rgba(99, 99, 172, 0.1)'
    }
  },
  methods: {
    // 点击答题时
    onQuestion() {
      const { lab_id } = DC_Layout.getData()
      app.iDC_NavigateTo.push('question', { lab_id })
    },
    // 点击标准曲线法时
    onCalculate() {
      const { lab_id } = DC_Layout.getData()
      const iFileManager = app.iFileManager
      const onlineDirArr = iFileManager.FS.readdirSync(
        iFileManager.ROOT_PATH + iFileManager.EXPERIMENTS_DIRNAME + iFileManager.ONLINE_DIRNAME
      )
      if (onlineDirArr.length > 0) {
        const labIdReg = /^.*_(.*)_.*$/
        const dirName = onlineDirArr[0]
        const lab_id_save = parseInt(dirName.match(labIdReg)[1])
        if (lab_id_save === lab_id) {
          app.iDC_NavigateTo.push('experiment', {
            fileDir:
              iFileManager.ROOT_PATH + iFileManager.EXPERIMENTS_DIRNAME + iFileManager.ONLINE_DIRNAME + `/${dirName}`
          })
        } else {
          Dialog.confirm({
            title: '是否开启新实验记录',
            message: '新实验记录将会覆盖上次未完成的实验记录，请谨慎操作'
          })
            .then(() => {
              wx.showLoading({
                title: '加载中',
                mask: true
              })
              iFileManager.deleteDir(
                iFileManager.ROOT_PATH + iFileManager.EXPERIMENTS_DIRNAME + iFileManager.ONLINE_DIRNAME + `/${dirName}`,
                true
              )
              const newDirName = iFileManager.createExperimentOnlineDir(lab_id)
              iFileManager.createExperimentJSON(
                iFileManager.ROOT_PATH + iFileManager.EXPERIMENTS_DIRNAME + iFileManager.ONLINE_DIRNAME + newDirName
              )
              app.iDC_NavigateTo.push('experiment', {
                fileDir:
                  iFileManager.ROOT_PATH +
                  iFileManager.EXPERIMENTS_DIRNAME +
                  iFileManager.ONLINE_DIRNAME +
                  `${newDirName}`
              })
              wx.hideLoading()
            })
            .catch((e) => {})
        }
      } else {
        const newDirName = iFileManager.createExperimentOnlineDir(lab_id)
        iFileManager.createExperimentJSON(
          iFileManager.ROOT_PATH + iFileManager.EXPERIMENTS_DIRNAME + iFileManager.ONLINE_DIRNAME + newDirName
        )
        app.iDC_NavigateTo.push('experiment', {
          fileDir:
            iFileManager.ROOT_PATH + iFileManager.EXPERIMENTS_DIRNAME + iFileManager.ONLINE_DIRNAME + `${newDirName}`
        })
      }
    }
  }
})
PageObj.use(Contents)

Page(PageObj)

// 实验记录页

import Dialog from '../../components/@vant/weapp/dialog/dialog'

const app = getApp()
const DC_Component = app.DC_Utils.DC_Component

const MainHeight = app.iDC_SystemInfo.system.height - app.publicData.navBarHeight - 40 // 主区域高度
const MainWidth = app.iDC_SystemInfo.system.width // 主区域宽度

const PageObj = new app.DC_Utils.DC_Page({
  onLoad(options) {
    const { fileDir } = options
    this.init(fileDir)
  },
  onShow() {
    DC_Layout.init()
  },
  // 初始化
  init(fileDir) {
    DC_Layout.setData({
      fileDir
    })
  }
})

const DC_Layout = new DC_Component({
  _name: 'DC_Layout',
  data: {
    title: '实验记录',
    fileDir: ''
  },
  style: {},
  methods: {
    // 初始化函数
    init() {
      const iFileManager = app.iFileManager
      iFileManager.init()
      const { fileDir } = this.getData()
      const json = iFileManager.loadJSON(fileDir + iFileManager.RECORD_FILENAME)
      let jsonObj = JSON.parse(json)
      const { sampleList, guideSampleList, densityRemark } = jsonObj
      Sample.setData({ sampleList, guideSampleList })
      Settings.setData({ densityRemark })

      Settings.init()
    },
    // 点击返回图标时
    onBack() {
      app.iDC_NavigateTo.pop()
    }
  }
})
PageObj.use(DC_Layout)

const Main = new DC_Component({
  _name: 'Main',
  data: {},
  style: {
    _: {
      width: '100%',
      height: `${MainHeight}px`
    },
    header: {
      'box-sizing': 'border-box',
      padding: '0 10px',
      position: 'relative'
    },
    headerText: {
      display: 'inline'
    },
    headerTitle: {
      color: app.publicData.ColorSet.$title,
      'font-size': app.publicData.SizeMap.$Title2,
      'font-weight': 'bold'
    },
    headerLabel: {
      color: app.publicData.ColorSet.$body,
      'font-size': app.publicData.SizeMap.$Subhead
    },
    headerValue: {
      position: 'absolute',
      right: '10px',
      bottom: '5px'
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
  style: {},
  methods: {
    // 标签页切换时
    onChange(e) {
      const active = e.detail.index
      this.setData({ active })
    }
  }
})
PageObj.use(Tab)

const Settings = new DC_Component({
  _name: 'Settings',
  data: {
    recordName: '',
    densityRemark: ''
  },
  style: {
    title: {
      color: app.publicData.ColorSet.$title,
      'font-size': app.publicData.SizeMap.$Subhead,
      'font-weight': 'bold'
    }
  },
  methods: {
    // 初始化函数
    init() {
      const { fileDir } = DC_Layout.getData()
      const nameReg = /^.*_.*_(.*)$/
      if (fileDir.match(nameReg) !== null) {
        this.setData({
          recordName: fileDir.match(nameReg)[1]
        })
      }
      Sample.setData({
        isComplete: true
      })
    },
    // 修改实验记录名时
    onNameChange(e) {
      this.setData({
        recordName: e.detail
      })
    },
    // 重命名实验记录
    rename() {
      let { recordName } = this.getData()
      const { fileDir } = DC_Layout.getData()
      const nameReg = /^(.*_.*_)(.*)$/
      if (!recordName.length) {
        recordName = '未命名实验记录'
        this.setData({
          recordName
        })
      }
      const iFileManager = app.iFileManager
      const newPath = fileDir.replace(nameReg, `$1${recordName}`) // 替换名字
      iFileManager.FS.renameSync(fileDir, newPath)
      DC_Layout.setData({
        fileDir: newPath
      })
      this.updateTime()
    },
    // 修改densityRemark时
    onDensityChange(e) {
      this.setData({
        densityRemark: e.detail
      })
    },
    // 重命名densityRemark
    renameDensityRemark() {
      let { densityRemark } = this.getData()
      if (!densityRemark.length) {
        densityRemark = '无'
        this.setData({
          densityRemark
        })
      }
      Sample.saveInFile()
    },
    // 修改实验记录时间
    updateTime() {
      const iFileManager = app.iFileManager
      const { fileDir } = DC_Layout.getData()

      const dateReg = /^(.*\/)(\d*)(_.*)$/

      const newPath = fileDir.replace(dateReg, `$1${new Date().getTime()}$3`) // 替换时

      iFileManager.FS.renameSync(fileDir, newPath)
      DC_Layout.setData({
        fileDir: newPath
      })
    }
  }
})
PageObj.use(Settings)

// 样本实例
const SampleCardHeight = 160
const SampleCardWidth = MainWidth * 0.95
const SampleCardColorWidth = 13
const imageHeight = SampleCardHeight
const imageWidth = SampleCardHeight * 0.8
const Sample = new DC_Component({
  _name: 'Sample',
  data: {
    imageHeight: imageHeight,
    imageWidth: imageWidth,
    minGuideSampleNum: app.publicData.minGuideSampleNum, // 最小标样数量
    maxGuideSampleNum: app.publicData.maxGuideSampleNum, // 最大标样数量
    minSampleNum: app.publicData.minSampleNum, // 最小样本数量
    maxSampleNum: app.publicData.maxSampleNum, // 最大样本数量

    sampleList: [],
    guideSampleList: [],
    isComplete: false
  },
  style: {
    _: {
      width: `${SampleCardWidth}px`,
      margin: 'auto',
      'margin-top': '10px',
      'box-shadow': '0px 0px 10px 5px rgba(99, 99, 172, 0.1)',
      overflow: 'hidden'
    },
    content: {
      height: `${MainHeight - 44}px`,
      'overflow-y': 'scroll',
      'box-sizing': 'border-box',
      'padding-bottom': '150px'
    },
    container: {
      width: '100%',
      display: 'flex',
      position: 'relative'
    },
    height: {
      height: `${SampleCardHeight}px`
    },
    image: {
      overflow: 'hidden'
    },
    info: {
      width: `${SampleCardWidth - imageWidth - SampleCardColorWidth}px`,
      'box-sizing': `border-box`,
      padding: '10px 20px',
      display: 'flex',
      'flex-direction': 'column',
      'justify-content': 'space-between'
    },
    title: {
      color: app.publicData.ColorSet.$title,
      'font-size': app.publicData.SizeMap.$Headline,
      'font-weight': 'bold'
    },
    label: {
      color: app.publicData.ColorSet.$body,
      'font-size': app.publicData.SizeMap.$Fontnote
    },
    color: {
      width: `${SampleCardColorWidth}px`
    },
    deleteContainer: {
      height: '100%',
      width: '65px',
      'background-color': '#E84855',
      color: '#FFFFFF',
      display: 'flex',
      'justify-content': 'center',
      'align-items': 'center'
    }
  },
  methods: {
    // 点击添加按钮时
    onAdd() {
      Settings.updateTime()
      const { active } = Tab.getData()
      const { fileDir } = DC_Layout.getData()
      app.iDC_NavigateTo.push('edit', {
        editIndex: -1,
        fileDir,
        listName: active === 0 ? 'guideSampleList' : 'sampleList'
      })
    },
    // 点击预测时
    onCalculate() {
      Settings.updateTime()
      const { fileDir } = DC_Layout.getData()
      app.iDC_NavigateTo.push('run', {
        fileDir
      })
    },
    // 点击删除样本时
    onDeleteSample(e) {
      const { index } = e.currentTarget.dataset
      const { active } = Tab.getData()
      const listName = active === 0 ? 'guideSampleList' : 'sampleList'
      let list = this.getData()[listName]
      list.splice(index, 1)
      this.setData({ [listName]: list })
      this.saveInFile()
    },
    // 保存至本地文件
    saveInFile() {
      const { sampleList, guideSampleList } = this.getData()
      const { densityRemark } = Settings.getData()
      const iFileManager = app.iFileManager
      const { fileDir } = DC_Layout.getData()
      const json = iFileManager.loadJSON(fileDir + iFileManager.RECORD_FILENAME)
      let jsonObj = JSON.parse(json)
      jsonObj.sampleList = sampleList
      jsonObj.guideSampleList = guideSampleList
      jsonObj.densityRemark = densityRemark
      app.iFileManager.saveJSON(fileDir + iFileManager.RECORD_FILENAME, JSON.stringify(jsonObj))
      Settings.updateTime()
    },
    // 点击样本时
    onClick(e) {
      Settings.updateTime()
      const { index } = e.currentTarget.dataset
      const { active } = Tab.getData()
      const { fileDir } = DC_Layout.getData()
      app.iDC_NavigateTo.push('edit', {
        editIndex: index,
        fileDir,
        listName: active === 0 ? 'guideSampleList' : 'sampleList'
      })
    },
    // 点击清空时
    onClear() {
      Dialog.confirm({
        title: '是否清空实验数据',
        message: '该操作不可逆'
      })
        .then(() => {
          wx.showLoading({
            title: '删除中',
            mask: true
          })

          this.setData({
            sampleList: [],
            guideSampleList: []
          })
          this.saveInFile()

          wx.hideLoading()
          wx.showToast({
            title: '清空成功',
            icon: 'none'
          })
        })
        .catch(() => {})
    },
    // 点击删除实验记录时
    onDeleteRecord() {
      Dialog.confirm({
        title: '是否删除实验记录',
        message: '该操作不可逆'
      })
        .then(() => {
          wx.showLoading({
            title: '删除中',
            mask: true
          })
          const { fileDir } = DC_Layout.getData()
          const iFileManager = app.iFileManager
          iFileManager.deleteDir(fileDir)
          wx.hideLoading()
          app.iDC_NavigateTo.pop()
        })
        .catch(() => {})
    }
  }
})
PageObj.use(Sample)

Page(PageObj)

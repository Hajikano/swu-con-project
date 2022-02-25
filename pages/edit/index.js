// 编辑页

import Dialog from '../../components/@vant/weapp/dialog/dialog'

const app = getApp()
const DC_Component = app.DC_Utils.DC_Component

const DPR = wx.getSystemInfoSync().pixelRatio
const MainHeight = app.iDC_SystemInfo.system.height - app.publicData.navBarHeight // 主区域高度
const MainWidth = app.iDC_SystemInfo.system.width // 主区域宽度
const CanvasWidth = MainWidth * DPR // 画布的宽度 需要像素转换
const CanvasMaxHeight = MainHeight * 0.7 * DPR // 画布的最大高度 需要像素转换

const DOTSIZE = 5 * DPR // 点半径
const SELECT_MAX_RANGE = DOTSIZE * 3 // 选取点的最大范围
const DOTCOLOR = '#F56C6C' // 点填充色
const DOTCOLORACTIVE = '#67C23A' // 点激活填充色
const MAXTARGETNUM = app.publicData.maxTargetsNum // 最大取点数

const PageObj = new app.DC_Utils.DC_Page({
  onLoad(options) {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    let { editIndex, fileDir, listName } = options
    DC_Layout.setData({ editIndex: parseInt(editIndex), fileDir, listName })
  },
  async onReady() {
    await Canvas_Basic.init()
    await Canvas_Sample.init()
    await this.init()
    wx.hideLoading()

    const { targetPosX, path } = Canvas_Basic.getData()
    if (path) {
      Canvas_Basic.moveAllTargetPoint(targetPosX, 0)
    }
  },
  // 本地模式初始化
  async init() {
    const { editIndex, fileDir, listName } = DC_Layout.getData()
    try {
      const json = app.iFileManager.loadJSON(fileDir + app.iFileManager.RECORD_FILENAME)
      const jsonObj = JSON.parse(json)
      if (editIndex !== -1) {
        // 获取本地样本信息
        const sample = jsonObj[listName][editIndex]
        const { avarage, density, path, pointSet, posX, width, height, subjectName } = sample
        // 将样本信息装载
        SamplePointSet.setData({
          avarage,
          density,
          pointSet,
          posX
        })
        ImageUploaded.setData({
          path,
          width,
          height
        })
        ConsoleBoard.setData({ subjectName })

        // 绘制信息到canvas
        const { canvas, ctx } = Canvas_Basic.getData()
        const { ctx_sample } = Canvas_Sample.getData()
        const newCanvasHeight = await ImageUploaded.drawImageFull(width, height, path, canvas, ctx)

        // 修改样本canvas的高度
        Canvas_Sample.updateHeight(newCanvasHeight) // 高度的修改会清空画布
        SamplePointSet.draw2Canvas(ctx_sample) // 必须先修改高度再绘制

        // 初始化设置状态
        ImageUploaded.setData({ isUploaded: true })
        ConsoleBoard.resetting()
      }
    } catch (e) {
      wx.showToast({
        title: '本地存储读取错误',
        icon: 'none'
      })
    }
  }
})

const DC_Layout = new DC_Component({
  _name: 'DC_Layout',
  data: {
    title: '编辑',
    editIndex: -1,
    fileDir: ''
  },
  style: {},
  methods: {
    // 点击返回时
    onBack() {
      app.iDC_NavigateTo.pop()
    }
  }
})
PageObj.use(DC_Layout)

const Main = new DC_Component({
  _name: 'Main',
  data: {
    scrollable: true
  },
  style: {
    _: {
      width: '100%',
      height: `${MainHeight}px`,
      position: 'relative'
    },
    canvas_container: {
      maxHeight: '70%',
      position: 'relative',
      'touch-action': 'none'
    }
  },
  methods: {
    // 切换移动状态
    scrollableToggle(status) {
      this.setData({
        scrollable: status
      })
    }
  }
})
PageObj.use(Main)

// 绘制一点到画布
function drawDot(ctx, posX, posY, size = DOTSIZE, color = DOTCOLOR) {
  ctx.beginPath()
  ctx.arc(posX, posY, size, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.strokeStyle = 'rgba(1,1,1,0)'
  ctx.fill()
  ctx.stroke()
}

// 底片canvas实例 用于绘制上传的图片
const Canvas_Basic = new DC_Component({
  _name: 'Canvas_Basic',
  data: {
    canvasID: 'calculateCanvas',
    canvasHeightWxml: 0, // wxml中画布元素的高度 无需像素转换
    ctx: null,
    canvas: null
  },
  style: {
    _: {
      width: '100%'
    }
  },
  methods: {
    // 初始化画布
    init() {
      return new Promise((resolve) => {
        const query = wx.createSelectorQuery()
        query
          .select(`#${this.getData().canvasID}`)
          .fields({ node: true, size: true })
          .exec((res) => {
            const canvas = res[0].node
            canvas.width = CanvasWidth
            canvas.height = CanvasMaxHeight
            const ctx = canvas.getContext('2d')
            this.setData({ canvas, ctx })
            resolve()
          })
      })
    },
    // 修改画布高度
    updateHeight(height) {
      const { canvas } = this.getData()
      canvas.height = height
    },
    // 将canvas_off的内容覆盖主canvas
    drawByCanvas(canvas_off) {
      const { ctx } = this.getData()
      const offImageObj = canvas_off.createImage()
      offImageObj.src = canvas_off.toDataURL('image/png') // 先转base64
      return new Promise((resolve, reject) => {
        offImageObj.onload = () => {
          ctx.drawImage(offImageObj, 0, 0)
          resolve()
        }
        offImageObj.onerror = (e) => {
          reject(e)
        }
      })
    },
    // 获取一段区域内的数据
    getAreaData(x, y, width = 1, height = 1) {
      const { ctx } = this.getData()
      return ctx.getImageData(x, y, width, height)
    },
    // 获取某一个像素的颜色值
    getPixelRgba(x, y) {
      const pixelData = this.getAreaData(x, y)
      return pixelData.data
    },
    // 刷新图像
    onRefresh() {
      const { width, height, path } = ImageUploaded.getData()
      const { canvas, ctx } = this.getData()
      ImageUploaded.drawImageFull(width, height, path, canvas, ctx)
      wx.showToast({
        title: '重载成功',
        icon: 'none'
      })
    },
    // 获取格式化rgbk字符串
    pointRgbkFormat(rgba) {
      const k = this.getKFromRgba(rgba)
      return `${rgba[0]} ${rgba[1]} ${rgba[2]}, ${k}`
    },
    // 通过rgba计算k值
    getKFromRgba(rgba) {
      let newC = 255 - rgba[0]
      let newM = 255 - rgba[1]
      let newY = 255 - rgba[2]
      let K = Math.min(newC, newM, newY)
      K = Math.floor((K / 255) * 100)
      return K
    },
    // 获取rgbk均值
    getRgbkAvarage() {
      const { targets } = this.getData()
      let rgbk = [0, 0, 0, 0]
      targets.forEach((item) => {
        rgbk[0] += item.rgba[0]
        rgbk[1] += item.rgba[1]
        rgbk[2] += item.rgba[2]
        rgbk[3] += this.getKFromRgba(item.rgba)
      })
      rgbk[0] = (rgbk[0] / 4).toFixed(0)
      rgbk[1] = (rgbk[1] / 4).toFixed(0)
      rgbk[2] = (rgbk[2] / 4).toFixed(0)
      rgbk[3] = (rgbk[3] / 4).toFixed(0)
      if (isNaN(rgbk[0]) || isNaN(rgbk[1]) || isNaN(rgbk[2]) || isNaN(rgbk[3])) {
        return {
          arr: [0, 0, 0, 0],
          value: ''
        }
      } else {
        return {
          arr: rgbk,
          value: `${rgbk[0]} ${rgbk[1]} ${rgbk[2]} ${rgbk[3]}`
        }
      }
    }
  }
})
PageObj.use(Canvas_Basic)

// 采样点canvas实例 用于绘制采样点
const Canvas_Sample = new DC_Component({
  _name: 'Canvas_Sample',
  data: {
    canvas_sample: null,
    ctx_sample: null,
    status: 'Adding'
  },
  style: {
    _: {
      height: '30%',
      width: '100%',
      position: 'absolute',
      top: '0px'
    }
  },
  methods: {
    // 初始化画布
    init() {
      return new Promise((resolve) => {
        const query = wx.createSelectorQuery()
        query
          .select(`#${Canvas_Basic.getData().canvasID}_sample`)
          .fields({ node: true, size: true })
          .exec((res) => {
            const canvas_sample = res[0].node
            canvas_sample.width = CanvasWidth
            canvas_sample.height = CanvasMaxHeight
            const ctx_sample = canvas_sample.getContext('2d')
            this.setData({ canvas_sample, ctx_sample })
            resolve()
          })
      })
    },
    // 重置组件状态
    resetting() {
      this.setData({
        status: 'Adding'
      })
    },
    // 修改画布高度 顺便同步另外两个从画布的高度
    updateHeight(height) {
      const { canvas_sample } = this.getData()
      canvas_sample.height = height
    },
    // 清空画布
    clear() {
      const { canvas_sample, ctx_sample } = this.getData()
      ctx_sample.clearRect(0, 0, canvas_sample.width, canvas_sample.height)
    },
    // 将canvas_off的内容覆盖主canvas
    drawByCanvas(canvas_off) {
      const { ctx_sample } = this.getData()
      const offImageObj = canvas_off.createImage()
      offImageObj.src = canvas_off.toDataURL('image/png') // 先转base64
      return new Promise((resolve, reject) => {
        offImageObj.onload = () => {
          this.clear()
          ctx_sample.drawImage(offImageObj, 0, 0)
          resolve()
        }
        offImageObj.onerror = (e) => {
          reject(e)
        }
      })
    },
    // 绘制一个样本点
    drawPoint(posX, posY) {
      const { ctx_sample } = this.getData()
      drawDot(ctx_sample, posX, posY)
    },
    // 修改当前画布状态
    changeStatus(status) {
      switch (status) {
        case 'Adding':
          {
            this.setData({
              status
            })
          }
          break
        case 'MovingVertical':
          {
            this.setData({
              status
            })
          }
          break
        default:
          {
            this.setData({
              status: 'Done'
            })
          }
          break
      }
    },
    // 判断是否可以进行触摸程序
    canRunTouchProcess() {
      // 只有popup隐藏或采样点未锁定时才能运行触摸程序
      const { isSamplePointLock } = ConsoleBoard.getData()
      return !isSamplePointLock
    },
    // 开始点击画布时
    onTouchstart(e) {
      if (!this.canRunTouchProcess()) return

      Main.scrollableToggle(false)
      const { x, y } = e.changedTouches[0]
      const posX = x * DPR
      const posY = y * DPR

      if (this.getData().status === 'Adding') {
        const addRes = SamplePointSet.addPoint(posX, posY, [])
        const { pointSet } = SamplePointSet.getData()
        ConsoleBoard.onTagClick({
          currentTarget: { dataset: { index: pointSet.length - 1 } }
        })
        if (!addRes) {
          // 样本点数目达最大值
          this.changeStatus('Done')
        }
      }

      // 必须获取最新的status
      if (this.getData().status === 'Done') {
        SamplePointSet.demotivatePoint()
        SamplePointSet.motivateNearestPoint(posX, posY)
        if (SamplePointSet.motivateNearestPoint(posX, posY)) {
          // 如果成功选中了一个较近点
          wx.vibrateShort({ type: 'heavy' })
          this.changeStatus('MovingVertical')
          SamplePointSet.changeActivePointPosY(posY)
        }
      }

      // 绘制到画布
      this.clear()
      const { ctx_sample } = this.getData()
      SamplePointSet.draw2Canvas(ctx_sample)
      SamplePointSet.updateSetRGBA()
    },
    // 在画布上移动时
    onTouchMove(e) {
      if (!this.canRunTouchProcess()) return

      const { x, y } = e.changedTouches[0]
      const posX = x * DPR
      const posY = y * DPR

      const { ctx_sample, status } = this.getData()

      if (status === 'Done') {
        // 水平移动所有点
        this.clear()
        SamplePointSet.draw2Canvas(ctx_sample, posX)
      } else if (status === 'MovingVertical') {
        // 垂直移动一个点
        this.clear()
        SamplePointSet.changeActivePointPosY(posY)
        SamplePointSet.draw2Canvas(ctx_sample)
      }
    },
    // 在画布上移动结束时
    onTouchMoveEnd(e) {
      if (!this.canRunTouchProcess()) return

      Main.scrollableToggle(true)
      const { x, y } = e.changedTouches[0]
      const posX = x * DPR
      const posY = y * DPR

      const { ctx_sample, status } = this.getData()

      if (status === 'Done') {
        // 水平移动所有点
        SamplePointSet.changePosX(posX)
      } else if (status === 'MovingVertical') {
        // 垂直移动单个点
        SamplePointSet.changeActivePointPosY(posY)
        SamplePointSet.demotivatePoint()
        this.changeStatus('Done')
      }

      // 绘制到画布
      this.clear()
      SamplePointSet.draw2Canvas(ctx_sample)
      SamplePointSet.updateSetRGBA()
      SamplePointSet.updateSetAvarage()

      // 保存结果到本地
      ConsoleBoard.saveToFile()
    }
  }
})
PageObj.use(Canvas_Sample)

// 离屏canvas实例 用于双重缓冲
const Canvas_Off = new DC_Component({
  _name: 'Canvas_Off',
  data: {
    canvas_off: null,
    ctx_off: null
  },
  style: {},
  methods: {
    // 初始化画布
    init() {
      const query = wx.createSelectorQuery()
      query
        .select(`#${Canvas_Basic.getData().canvasID}_off`)
        .fields({ node: true, size: true })
        .exec((res) => {
          const canvas_off = res[0].node
          canvas_off.width = CanvasWidth
          canvas_off.height = CanvasMaxHeight
          const ctx_off = canvas_off.getContext('2d')
          this.setData({ canvas_off, ctx_off })
        })
    },
    // 修改画布高度 顺便同步另外两个从画布的高度
    updateHeight(height) {
      const { canvas_off } = this.getData()
      canvas_off.height = height
    },
    // 清空画布
    clear() {
      const { canvas_off, ctx_off } = this.getData()
      ctx_off.clearRect(0, 0, canvas_off.width, canvas_off.height)
    }
  }
})
PageObj.use(Canvas_Off)

// 样本点集合组件
const SamplePointSet = new DC_Component({
  _name: 'SamplePointSet',
  data: {
    pointSet: [],
    posX: -1,
    activeIndex: -1, // 被激活的点的索引
    avarage: {
      rgbk: [255, 255, 255, 0],
      colorStr: '#ffffff'
    },
    density: '0.00'
  },
  style: {},
  methods: {
    // 重置组件状态
    resetting() {
      this.setData({
        pointSet: [],
        posX: -1, // 初始化为-1可方便进行逻辑运算
        activeIndex: -1,
        avarage: {
          rgbk: [255, 255, 255, 0],
          colorStr: '#ffffff'
        },
        density: '0.00'
      })
    },
    // 创建一个样本点
    createPoint(posY, rgba) {
      let point = {}
      point.posY = posY
      point.isActive = false
      point.rgba = [...rgba]
      point.k = this.getKFromRGB([...rgba])
      point.colorStr = '#ffffff'
      return point
    },
    // 修改样本集合横坐标
    changePosX(newPosX) {
      this.setData({
        posX: newPosX
      })
    },
    // 修改激活的点的纵坐标
    changeActivePointPosY(newPosY) {
      try {
        const { pointSet, activeIndex } = this.getData()
        pointSet[activeIndex].posY = newPosY
        this.setData({
          pointSet
        })
        return true
      } catch (e) {
        return false
      }
    },
    // 添加一个样本点 若PosX属性尚未写入，则替换为改点的横坐标
    addPoint(newPosX, posY, rgba) {
      let { pointSet, posX } = this.getData()
      if (pointSet.length < MAXTARGETNUM) {
        let finalPosX = posX > 0 ? posX : newPosX
        pointSet.push(this.createPoint(posY, rgba))
        this.setData({
          pointSet,
          posX: finalPosX
        })
        return true
      } else {
        return false
      }
    },
    // 将样本集合内的点全部绘制到指定画布上
    draw2Canvas(ctx, newPosX) {
      const { pointSet, posX } = this.getData()
      for (let i of pointSet) {
        drawDot(ctx, newPosX === undefined ? posX : newPosX, i.posY, DOTSIZE, i.isActive ? DOTCOLORACTIVE : DOTCOLOR)
      }
    },
    // 获取一定范围内，集合内离给定点最近的点索引
    getNearestPoint(posXIn, posYIn) {
      const { posX, pointSet } = this.getData()
      let nearestPointIndex = -1 // 最近点的索引
      let nearestPointDistance = SELECT_MAX_RANGE // 距离最近点的距离
      if (Math.abs(posX - posXIn) < SELECT_MAX_RANGE) {
        for (let i = 0; i < pointSet.length; i++) {
          let distance = Math.abs(pointSet[i].posY - posYIn)
          if (distance < nearestPointDistance) {
            nearestPointIndex = i
            nearestPointDistance = distance
          }
        }
      }
      return nearestPointIndex
    },
    // 激活一定范围内，集合内离给定点最近的点
    motivateNearestPoint(posXIn, posYIn) {
      const index = this.getNearestPoint(posXIn, posYIn)
      const { pointSet } = this.getData()
      try {
        pointSet[index].isActive = true
        this.setData({
          pointSet,
          activeIndex: index
        })
        return true
      } catch (e) {
        return false
      }
    },
    // 取消已激活点的激活状态
    demotivatePoint() {
      const { pointSet, activeIndex } = this.getData()
      try {
        pointSet[activeIndex].isActive = false
        this.setData({
          pointSet,
          activeIndex: -1
        })
        return true
      } catch (e) {
        return false
      }
    },
    // 更新集合内所有样本点的rgba值
    updateSetRGBA() {
      const { pointSet, posX } = this.getData()
      for (let i of pointSet) {
        const rgba = Canvas_Basic.getPixelRgba(posX, i.posY)
        i.rgba = rgba
        i.k = this.getKFromRGB([...rgba])
        i.colorStr = this.getColorStr(rgba)
      }
      this.setData({
        pointSet
      })
    },
    // 更新集合的平均值对象
    updateSetAvarage() {
      const rgbk = [...this.getRGBAKvarageFromSet()]
      this.setData({
        avarage: {
          rgbk: rgbk,
          colorStr: this.getColorStr(rgbk)
        }
      })
    },
    // 获取集合的RGBAK均值
    getRGBAKvarageFromSet() {
      const { pointSet } = this.getData()
      const setSize = pointSet.length
      let totalR = 0
      let totalG = 0
      let totalB = 0
      let totalK = 0

      for (let i of pointSet) {
        totalR += i.rgba[0]
        totalG += i.rgba[1]
        totalB += i.rgba[2]
        totalK += i.k
      }
      const avarageR = Math.floor(totalR / setSize)
      const avarageG = Math.floor(totalG / setSize)
      const avarageB = Math.floor(totalB / setSize)
      const avarageK = Math.floor(totalK / setSize)
      return [avarageR, avarageG, avarageB, avarageK]
    },
    // 更新集合内所有样本点的rgba值
    getKFromRGB([R, G, B]) {
      const Key = Math.min(255 - R, 255 - G, 255 - B) / 255
      return Math.floor(Key * 100) // 范围转化为0-100
    },
    // 通过给定的rgb数组获取对应的颜色css字符串
    getColorStr(rgb) {
      return 'rgb(' + rgb[0].toString() + ',' + rgb[1].toString() + ',' + rgb[2].toString() + ')'
    }
  }
})
PageObj.use(SamplePointSet)

// 控制台组件
const ConsoleBoard = new DC_Component({
  _name: 'ConsoleBoard',
  data: {
    tabActive: 0, // 标签页激活索引
    tagActive: -1, // 样本标签激活索引
    isHiddenSample: false, // 是否隐藏采样点
    isSamplePointLock: false, // 是否锁定采样点

    subjectName: '未命名' // 目标名
  },
  style: {
    _: {
      width: '100%',
      'box-sizing': 'border-box',
      'padding-bottom': '50px'
    },
    ta0_denstitySettingContainer: {
      'min-height': '200px',
      width: '100%',
      'box-sizing': 'border-box',
      padding: '20px'
    },
    ta1_tagContainer: {
      'box-sizing': 'border-box',
      padding: '10px'
    },
    ta1_infoContainer: {
      width: '95%',
      margin: 'auto',
      'box-sizing': 'border-box',
      padding: '20px',
      'padding-top': '10px',
      'box-shadow': '0px 0px 10px 5px rgba(99, 99, 172, 0.05)',
      'border-radius': '10px',
      'background-color': '#ffffff'
    },
    ta1_colorBox: {
      width: '100%',
      height: '40px'
    }
  },
  methods: {
    // 重置组件状态
    resetting() {
      this.setData({
        tabActive: 0,
        tagActive: -1,
        isHiddenSample: false,
        isSamplePointLock: false
      })
    },
    // 点击隐藏采样点时
    onHiddenSample({ detail }) {
      this.setData({
        isHiddenSample: detail
      })
    },
    // 点击隐藏采样点时
    onLockSample({ detail }) {
      this.setData({
        isSamplePointLock: detail
      })
    },
    // 点击清空采样点时
    onClearSample() {
      Dialog.confirm({
        title: '是否清空采样点',
        message: '该操作不可逆'
      })
        .then(() => {
          wx.showLoading({
            title: '删除中',
            mask: true
          })
          Canvas_Sample.clear()
          Canvas_Sample.resetting()
          SamplePointSet.resetting()
          this.resetting()

          ConsoleBoard.saveToFile()
          wx.hideLoading()
          wx.showToast({
            title: '清空成功',
            icon: 'none'
          })
        })
        .catch(() => {})
    },
    //  点击采样点标签时
    onTagClick(e) {
      this.setData({
        tagActive: parseInt(e.currentTarget.dataset.index)
      })
    },
    // 保存数据至本地
    saveToFile() {
      const { path, width, height } = ImageUploaded.getData()
      const { pointSet, posX, avarage, density } = SamplePointSet.getData()
      const { fileDir, listName, editIndex } = DC_Layout.getData()
      const { subjectName } = this.getData()
      try {
        const json = app.iFileManager.loadJSON(fileDir + app.iFileManager.RECORD_FILENAME)
        let jsonObj = JSON.parse(json)
        if (jsonObj[listName]) {
          if (editIndex === -1) {
            // 新增模式，栈顶为当前实例的旧数据，需要舍弃
            jsonObj[listName].push({
              path,
              width,
              height,
              pointSet,
              posX,
              avarage,
              density
            })
            // 模式变为修改模式
            DC_Layout.setData({
              editIndex: jsonObj[listName].length - 1
            })
          } else {
            // 修改模式，替换索引处的信息即可
            jsonObj[listName][editIndex] = {
              path,
              width,
              height,
              pointSet,
              posX,
              avarage,
              density,
              subjectName
            }
          }
          app.iFileManager.saveJSON(fileDir + app.iFileManager.RECORD_FILENAME, JSON.stringify(jsonObj))
        } else {
          throw 'Wrong json'
        }
      } catch (e) {
        wx.showToast({
          title: '保存失败',
          icon: 'none'
        })
      }
    },
    // 当浓度值改变时
    onDensityChange(e) {
      SamplePointSet.setData({
        density: e.detail
      })
    },
    // 当浓度值输入框失焦时 矫正输入值为2位小数
    onDensityBlur(e) {
      const value = parseFloat(e.detail.value).toFixed(2)
      this.onDensityChange({ detail: value })
      this.saveToFile()
    },
    // 当浓度值改变时
    onSubjectNameChange(e) {
      this.setData({
        subjectName: e.detail
      })
    },
    // 当浓度值输入框失焦时
    onSubjectNameBlur(e) {
      let value = e.detail.value
      if (!value.length) {
        this.setData({
          subjectName: '未命名'
        })
      }
      this.saveToFile()
    }
  }
})
PageObj.use(ConsoleBoard)

// 图像上传组件
const ImageUploaded = new DC_Component({
  _name: 'ImageUploaded',
  data: {
    width: 0,
    height: 0,
    path: '',
    isUploaded: false // 是否已上传图片
  },
  style: {
    gridContainer: {
      'max-width': '50%',
      'min-width': '120px',
      'box-sizing': 'border-box',
      'padding-top': '20px',
      margin: 'auto'
    },
    gridContent: {
      display: 'flex',
      'box-sizing': 'border-box',
      padding: '5px',
      'justify-content': 'center'
    },
    gridItemIcon: {
      'font-size': app.publicData.SizeMap.$LargeTitle,
      display: 'block',
      height: '100%',
      'margin-right': '10px',
      overflow: 'hidden'
    },
    gridItemInfo: {
      display: 'flex',
      'align-items': 'center'
    },
    gridItemTitle: {
      'font-weight': 'bold',
      'font-size': app.publicData.SizeMap.$Headline
    }
  },
  methods: {
    // 点击上传图片时
    async onUploadImage() {
      try {
        let { width, height, path } = await this.uploadAndGetImageInfo() // 调起图片上传功能 并返回图片信息
        const oldPath = this.getData().path

        const pathRegRes = path.match(/^.*:.*\/(.*)$/)
        if (pathRegRes !== null) {
          const imageName = pathRegRes[1]
          path = this.saveImage(path, imageName)
          this.deleteImage(oldPath)
        } else {
          throw 'Unkown error'
        }

        wx.showLoading({
          title: '处理中',
          mask: true
        })
        this.setData({ width, height, path }) // 保存图像数据

        // 绘制图像到背景图canvas
        const { canvas, ctx } = Canvas_Basic.getData()
        const newCanvasHeight = await this.drawImageFull(width, height, path, canvas, ctx)

        // 修改样本canvas和离屏canvas的高度
        Canvas_Sample.updateHeight(newCanvasHeight)

        this.setData({ isUploaded: true })
        Canvas_Sample.resetting()
        SamplePointSet.resetting()
        ConsoleBoard.resetting()

        ConsoleBoard.saveToFile()

        wx.hideLoading()
      } catch (e) {
        // 图片未正常选择
        wx.hideLoading()
      }
    },
    // 给定图像信息，填充图像到给定的整个画布，并自动调节画布尺寸
    // 返回新画布的高度
    drawImageFull(width, height, path, canvas, ctx) {
      const imageObj = canvas.createImage() // 创建图片对象
      const radioImageHeight = CanvasWidth * (height / width) // 计算图像宽度完全显示情况下，应有的高度

      const newCanvasHeight = radioImageHeight > CanvasMaxHeight ? CanvasMaxHeight : radioImageHeight // 图像的高度若大于了画布高度最大值，则纵向剪裁图片

      imageObj.src = path // 为图像对象赋上本地上传的临时连接

      return new Promise((resolve, reject) => {
        imageObj.onload = () => {
          canvas.height = newCanvasHeight // 将画布的高调整成适配图片的高
          Canvas_Basic.setData({ canvasHeightWxml: newCanvasHeight / DPR }) // 更新视图层画布元素的高
          ctx.drawImage(imageObj, 0, 0, width, height, 0, 0, CanvasWidth, radioImageHeight) // 绘制图像到画布 高出画布最大值的部分会剪裁
          resolve(newCanvasHeight)
        }
        imageObj.onerror = (e) => {
          reject(e)
        }
      })
    },
    // 调起图片上传功能 并返回图片信息
    uploadAndGetImageInfo() {
      return new Promise((resolve, reject) => {
        wx.chooseImage({
          success: (res) => {
            wx.getImageInfo({
              src: res.tempFilePaths[0],
              success: (info_res) => {
                resolve(info_res)
              },
              fail: (info_err) => {
                reject(info_err)
              }
            })
          },
          fail: (err) => {
            reject(err)
          }
        })
      })
    },
    // 保存临时图片到本地
    saveImage(path, imageName) {
      const iFileManager = app.iFileManager
      return iFileManager.FS.saveFileSync(
        path,
        `${iFileManager.ROOT_PATH + iFileManager.EXPERIMENTS_DIRNAME + iFileManager.IMAGES_DIRNAME}/${imageName}`
      )
    },
    //  删除多余的本地图片
    deleteImage(path) {
      if (path.length > 0) {
        app.iFileManager.FS.unlinkSync(path)
      }
    }
  }
})
PageObj.use(ImageUploaded)

Page(PageObj)

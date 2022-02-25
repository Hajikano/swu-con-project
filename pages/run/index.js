// 预测页

import * as echarts from '../../components/ec-canvas/echarts'
import { LeastSquares } from '../../tools/LeastSquares'
import pcorr from 'compute-pcorr'

const app = getApp()
const DC_Component = app.DC_Utils.DC_Component

const MainHeight =
  app.iDC_SystemInfo.system.height - app.iDC_SystemInfo.navButton.top - app.iDC_SystemInfo.navButton.height - 10
const MainWidth = app.iDC_SystemInfo.system.width

const PageObj = new app.DC_Utils.DC_Page({
  onLoad(options) {
    const { fileDir } = options
    this.init(fileDir)
  },
  init(fileDir) {
    DC_Layout.setData({
      fileDir
    })
    DC_Layout.init()
  }
})

const DC_Layout = new DC_Component({
  _name: 'DC_Layout',
  data: {
    title: '预测页',
    fileDir: '',
    status: 0 // -1 error 0 loading 1 normal
  },
  style: {},
  methods: {
    // 初始化函数
    init() {
      wx.showLoading({
        title: '计算中',
        mask: true
      })
      try {
        const iFileManager = app.iFileManager
        const { fileDir } = this.getData()
        const json = iFileManager.loadJSON(fileDir + iFileManager.RECORD_FILENAME)
        const jsonObj = JSON.parse(json)
        if (
          jsonObj.guideSampleList &&
          jsonObj.guideSampleList.length >= app.publicData.minGuideSampleNum &&
          jsonObj.sampleList &&
          jsonObj.sampleList.length >= app.publicData.minSampleNum
        ) {
          // 格式化标样坐标点
          let redDots = []
          let greenDots = []
          let blueDots = []
          let keyDots = []

          const densityRemark = jsonObj.densityRemark
          for (let i of jsonObj.guideSampleList) {
            const density = parseFloat(i.density)
            redDots.push({
              name: i.subjectName,
              value: [density, i.avarage.rgbk[0]]
            })
            greenDots.push({
              name: i.subjectName,
              value: [density, i.avarage.rgbk[1]]
            })
            blueDots.push({
              name: i.subjectName,
              value: [density, i.avarage.rgbk[2]]
            })
            keyDots.push({
              name: i.subjectName,
              value: [density, i.avarage.rgbk[3]]
            })
          }
          const redLSFunc = Sample.getLeastSquares(redDots).lsFunc // 拟合曲线方程
          const redLineStr = Sample.getLeastSquares(redDots).lineStr // 拟合曲线方程表达式字符串
          const redPcorr = Sample.getPcorr(redDots)[0][1].toFixed(2) // 线性相关系数

          const greenLSFunc = Sample.getLeastSquares(greenDots).lsFunc // 拟合曲线方程
          const greenLineStr = Sample.getLeastSquares(greenDots).lineStr // 拟合曲线方程表达式字符串
          const greenPcorr = Sample.getPcorr(greenDots)[0][1].toFixed(2) // 线性相关系数

          const blueLSFunc = Sample.getLeastSquares(blueDots).lsFunc // 拟合曲线方程
          const blueLineStr = Sample.getLeastSquares(blueDots).lineStr // 拟合曲线方程表达式字符串
          const bluePcorr = Sample.getPcorr(blueDots)[0][1].toFixed(2) // 线性相关系数

          const keyLSFunc = Sample.getLeastSquares(keyDots).lsFunc // 拟合曲线方程
          const keyLineStr = Sample.getLeastSquares(keyDots).lineStr // 拟合曲线方程表达式字符串
          const keyPcorr = Sample.getPcorr(keyDots)[0][1].toFixed(2) // 线性相关系数

          // 格式化样本坐标点
          let redDotsSample = []
          let greenDotsSample = []
          let blueDotsSample = []
          let keyDotsSample = []
          for (let i of jsonObj.sampleList) {
            const density = parseFloat(i.density)
            redDotsSample.push({
              name: i.subjectName,
              value: [density, i.avarage.rgbk[0]],
              calculate: redLSFunc(density).toFixed(2)
            })
            greenDotsSample.push({
              name: i.subjectName,
              value: [density, i.avarage.rgbk[1]],
              calculate: greenLSFunc(density).toFixed(2)
            })
            blueDotsSample.push({
              name: i.subjectName,
              value: [density, i.avarage.rgbk[2]],
              calculate: blueLSFunc(density).toFixed(2)
            })
            keyDotsSample.push({
              name: i.subjectName,
              value: [density, i.avarage.rgbk[3]],
              calculate: keyLSFunc(density).toFixed(2)
            })
          }

          Sample.setData({
            redDots,
            redLSFunc,
            redLineStr,
            redPcorr,
            redDotsSample,

            greenDots,
            greenLSFunc,
            greenLineStr,
            greenPcorr,
            greenDotsSample,

            blueDots,
            blueLSFunc,
            blueLineStr,
            bluePcorr,
            blueDotsSample,

            keyDots,
            keyLSFunc,
            keyLineStr,
            keyPcorr,
            keyDotsSample,

            densityRemark
          })
          DC_Layout.setData({ status: 1 })
        } else {
          throw 'Wrong json'
        }
      } catch (e) {
        console.log(e)
        DC_Layout.setData({ status: -1 })
      }
      wx.hideLoading()
    },
    // 点击返回时
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
    }
  },
  methods: {}
})
PageObj.use(Main)

const Sample = new DC_Component({
  _name: 'Sample',
  data: {
    initCount: 0, // 记录完成绘制的实例数量
    densityCalculate: 0,

    redDots: [],
    redLSFunc: null,
    redLineStr: '',
    redDotsSample: [],
    redPcorr: '',

    greenDots: [],
    greenLSFunc: null,
    greenLineStr: '',
    greenDotsSample: [],
    greenPcorr: '',

    blueDots: [],
    blueLSFunc: null,
    blueLineStr: '',
    blueDotsSample: [],
    bluePcorr: '',

    keyDots: [],
    keyLSFunc: null,
    keyLineStr: '',
    keyDotsSample: [],
    keyPcorr: '',

    densityRemark: ''
  },
  style: {},
  methods: {
    // 给定点集 返回最小二乘法函数
    getLeastSquares(dots) {
      let X = []
      let Y = []
      let ret = {}
      for (let i of dots) {
        X.push(i.value[0])
        Y.push(i.value[1])
      }
      const lsFunc = LeastSquares(X, Y, ret)
      return {
        lsFunc,
        lineStr: `y = ${ret.m === 1 ? '' : ret.m.toFixed(0)}x${ret.b >= 0 ? '+' : ''}${ret.b.toFixed(2)}`
      }
    },
    // 给定点集 返回相关系数
    getPcorr(dots) {
      let X = []
      let Y = []
      for (let i of dots) {
        X.push(i.value[0])
        Y.push(i.value[1])
      }
      return pcorr(X, Y)
    },
    // 返回点集中最大的横坐标值
    getMaxPosX(dots) {
      let X = []
      for (let i of dots) {
        X.push(i.value[0])
      }
      return Math.max(...X)
    }
  }
})
PageObj.use(Sample)

const Loading = new DC_Component({
  _name: 'Loading',
  data: {},
  style: {
    _: {
      height: '80%',
      width: '100%'
    }
  },
  methods: {}
}).HStack('center', 'center')
PageObj.use(Loading)

const Tab = new DC_Component({
  _name: 'Tab',
  data: {
    active: 0
  },
  style: {
    _: {
      width: '100%',
      height: `${MainHeight - 44}px`,
      'box-sizing': 'border-box',
      padding: '10px',
      'overflow-y': 'scroll'
    }
  },
  methods: {
    // 标签页切换时
    onChange(e) {
      const active = e.detail.index
      this.setData({ active })
    }
  }
})
PageObj.use(Tab)

const EChartLength = MainWidth * 0.8
const EChart = new DC_Component({
  _name: 'EChart',
  data: {
    ec_red: {
      onInit(canvas, width, height, dpr) {
        const chart = echarts.init(canvas, null, {
          width: width,
          height: height,
          devicePixelRatio: dpr // 像素
        })
        canvas.setChart(chart)

        const option = EChart.getChartOption(0)

        chart.setOption(option)
        return chart
      }
    },
    ec_green: {
      onInit(canvas, width, height, dpr) {
        const chart = echarts.init(canvas, null, {
          width: width,
          height: height,
          devicePixelRatio: dpr // 像素
        })
        canvas.setChart(chart)

        const option = EChart.getChartOption(1)

        chart.setOption(option)
        return chart
      }
    },
    ec_blue: {
      onInit(canvas, width, height, dpr) {
        const chart = echarts.init(canvas, null, {
          width: width,
          height: height,
          devicePixelRatio: dpr // 像素
        })
        canvas.setChart(chart)

        const option = EChart.getChartOption(2)

        chart.setOption(option)
        return chart
      }
    },
    ec_key: {
      onInit(canvas, width, height, dpr) {
        const chart = echarts.init(canvas, null, {
          width: width,
          height: height,
          devicePixelRatio: dpr // 像素
        })
        canvas.setChart(chart)

        const option = EChart.getChartOption(3)

        chart.setOption(option)
        return chart
      }
    }
  },
  style: {
    _: {
      width: '100%'
    },
    card: {
      width: '100%',
      'box-sizing': 'border-box',
      padding: '10px 0',
      'background-color': '#ffffff',
      'box-shadow': '0px 0px 10px 5px rgba(99, 99, 172, 0.1)',
      'border-radius': '10px',
      'margin-bottom': '20px'
    },
    infoContainer: {
      width: '100%',
      display: 'flex',
      'justify-content': 'space-between'
    },
    header: {
      'box-sizing': 'border-box',
      padding: '0 10px',
      position: 'relative',
      'margin-bottom': '10px'
    },
    highLight: {
      color: '#F56C6C'
    },
    headerTextContainer: {
      display: 'flex',
      'justify-content': 'space-between',
      'align-items': 'center'
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
      'font-size': app.publicData.SizeMap.$Subhead
    },
    headerLabel: {
      color: app.publicData.ColorSet.$body,
      'font-size': app.publicData.SizeMap.$Fontnote
    },
    canvas: {
      width: `${EChartLength}px`,
      height: `${EChartLength * 1.3}px`,
      margin: 'auto',
      'touch-action': 'none'
    }
  },
  methods: {
    // 获取指定类型的格式化初始图标参数对象
    getChartOption(typeIndex) {
      const types = [
        {
          keyName: 'redDots',
          keyNameSample: 'redDotsSample',
          funcName: 'redLSFunc',
          title: 'R'
        },
        {
          keyName: 'greenDots',
          keyNameSample: 'greenDotsSample',
          funcName: 'greenLSFunc',
          title: 'G'
        },
        {
          keyName: 'blueDots',
          keyNameSample: 'blueDotsSample',
          funcName: 'blueLSFunc',
          title: 'B'
        },
        {
          keyName: 'keyDots',
          keyNameSample: 'keyDotsSample',
          funcName: 'keyLSFunc',
          title: 'K'
        }
      ]
      const typeDots = Sample.getData()[types[typeIndex].keyName]
      const typeDotsSample = Sample.getData()[types[typeIndex].keyNameSample]
      const typeFunc = Sample.getData()[types[typeIndex].funcName]
      const { densityRemark } = Sample.getData()

      const option = {
        grid: {
          bottom: '25%',
          right: '20%'
        },
        title: {
          bottom: '12%',
          left: 'center',
          subtext: `${densityRemark}`
        },
        legend: {
          data: ['标样', '样本', '拟合曲线'],
          left: 'right'
        },
        dataZoom: [
          {
            type: 'slider',
            xAxisIndex: 0,
            start: 0,
            end: 100,
            filterMode: 'none',
            brushSelect: false
          },
          {
            type: 'slider',
            yAxisIndex: 0,
            start: 0,
            end: 100,
            filterMode: 'none',
            brushSelect: false
          }
        ],
        tooltip: {
          formatter: '{b} : ({c})'
        },
        backgroundColor: '#ffffff'
      }

      let variableOptions = {}
      const lineStartDot = [0, parseFloat(typeFunc(0).toFixed(2))]

      const increaseRange = 1.1 // 横坐标扩大系数
      const endDotPosX = parseFloat((Sample.getMaxPosX([...typeDots, ...typeDotsSample]) * increaseRange).toFixed(2))
      const lineEndDot = [endDotPosX, parseFloat(typeFunc(endDotPosX).toFixed(2))]
      variableOptions = {
        xAxis: {},
        yAxis: {
          name: `${types[typeIndex].title}`
        },
        series: [
          {
            type: 'scatter',
            data: typeDots,
            name: '标样'
          },
          {
            type: 'scatter',
            data: typeDotsSample,
            name: '样本'
          },
          {
            type: 'line',
            data: [lineStartDot, lineEndDot],
            name: '拟合曲线'
          }
        ]
      }
      return { ...option, ...variableOptions }
    },
    // 保存图片时
    onSave(e) {
      wx.showLoading({
        title: '保存中',
        mask: true
      })
      const { id } = e.currentTarget.dataset // 要保存的canvas dom id
      const pageInstance = this._dcPageInstance._pageInstance
      const ecComponent = pageInstance.selectComponent(`#${id}`)

      // 先保存图片到临时的本地文件，然后存入系统相册
      ecComponent.canvasToTempFilePath({
        success: (res) => {
          // 存入系统相册
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath || '',
            success: () => {
              wx.hideLoading()
              wx.showToast({
                title: `保存成功`,
                icon: 'none'
              })
            },
            fail: () => {
              wx.showToast({
                title: `保存失败`,
                icon: 'none'
              })
            }
          })
        },
        fail: (res) => console.log(res)
      })
    }
  }
})
PageObj.use(EChart)

const ChartTab = new DC_Component({
  _name: 'ChartTab',
  data: {
    active: 0
  },
  style: {
    _: {
      'box-sizing': 'border-box',
      padding: '0 20px'
    }
  },
  methods: {
    // 标签页切换时
    onChange(e) {
      const active = e.detail.index
      this.setData({ active })
    }
  }
})
PageObj.use(ChartTab)

Page(PageObj)

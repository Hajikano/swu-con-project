// 预习答题页

import { getQuestionListRandom } from '../../apis/test'
import { postTestResult } from '../../apis/lab'
import Dialog from '../../components/@vant/weapp/dialog/dialog'

const app = getApp()
const DC_Component = app.DC_Utils.DC_Component

const PageObj = new app.DC_Utils.DC_Page({
  onLoad(options) {
    const { lab_id } = options
    this.init(lab_id)
  },
  // 初始化函数
  init(lab_id) {
    DC_Layout.init(lab_id)
    Questions.init()
  }
})

const DC_Layout = new DC_Component({
  _name: 'DC_Layout',
  data: {
    title: '预习答题',
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

const Questions = new DC_Component({
  _name: 'Questions',
  data: {
    current: 0,
    status: -1,
    ratio: '0', // 得分
    correctNumber: 0,
    questions: [],
    indexLabels: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  },
  style: {},
  methods: {
    // 初始化函数
    init() {
      this.setProblems()
    },
    // 设定题目列表
    async setProblems() {
      const res = await getQuestionListRandom()
      const { questionList } = res
      let questions = []
      for (let i of questionList) {
        questions.push({
          id: i.id,
          status: false,
          content: i.content,
          options: i.options,
          correctOption: i.correctOption,
          optionStatus: ((item) => {
            const length = item.options.length
            let arr = []
            for (let i = 0; i < length; i++) {
              arr.push(0)
            }
            for (let i of item.correctOption) {
              arr[i - 1] = 1
            }
            return arr
          })(i),
          actives: ((length) => {
            let arr = []
            for (let i = 0; i < length; i++) {
              arr.push(0)
            }
            return arr
          })(i.options.length)
        })
      }
      this.setData({ questions, status: 0, current: 0 })
    },
    // 答题结束时
    async onQuestionEnd() {
      Dialog.confirm({
        title: '确定结束答题？',
        message: '结果提交后将不可再进行修改'
      })
        .then(() => {
          wx.showLoading({
            title: '加载中',
            mask: true
          })
          const checkRes = this.check()
          let correctNumber = 0
          for (let i of checkRes[0]) {
            if (i === true) {
              correctNumber += 1
            }
          }
          const ratio = parseFloat((correctNumber / checkRes[1].length).toFixed(2))
          this.setData({
            current: 0,
            status: 1,
            correctNumber,
            ratio: ratio,
            questions: checkRes[1]
          })
          const { lab_id } = DC_Layout.getData()
          postTestResult({ lab_id, ratio })
            .then(() => {
              wx.hideLoading()
              wx.showToast({
                title: '提交成功',
                icon: 'none'
              })
            })
            .catch(() => {
              wx.hideLoading()
            })
        })
        .catch((e) => {
          console.log(e)
        })
    },
    // 重新答题时
    async onQuestionRestart() {
      wx.showLoading({
        title: '加载中',
        mask: true
      })
      await Questions.setProblems()
      wx.hideLoading()
    },
    // 检查答题结果
    check() {
      const { questions } = this.getData()
      let results = []
      questions.forEach((item) => {
        let choiceSet = new Set()
        item.actives.forEach((active_item, active_index) => {
          if (active_item === 1) {
            choiceSet.add(active_index + 1)
          }
        })
        let correctSet = new Set(item.correctOption)
        let maxSizeSet = choiceSet.size > correctSet.size ? choiceSet : correctSet
        let minSizeSet = choiceSet.size <= correctSet.size ? choiceSet : correctSet

        let difference = new Set([...maxSizeSet].filter((x) => !minSizeSet.has(x)))

        results.push(difference.size === 0)
        item.status = difference.size === 0
      })
      return [results, questions]
    },
    // 点击选项时
    onClickOption(e) {
      const { status } = this.getData()
      if (status === 1) return // 答题结束后不作反应
      const { current, questions } = this.getData()
      const { idarr } = e.currentTarget.dataset
      const questionIndex = idarr[0]
      const optionIndex = idarr[1]
      const optionStatus = questions[questionIndex].actives[optionIndex]

      let willNext = true // 是否自动跳到下一题

      if (questions[questionIndex].correctOption.length > 1) {
        // 是一个多选题
        willNext = false
      } else {
        // 是一个单选题
        let activesEmpty = []
        for (let i of questions[questionIndex].actives) {
          activesEmpty.push(0)
        }
        questions[questionIndex].actives = activesEmpty
      }

      if (optionStatus === 0) {
        questions[questionIndex].actives[optionIndex] = 1
      } else {
        questions[questionIndex].actives[optionIndex] = 0
        willNext = false
      }

      let setDataObj = {
        [`questions[${questionIndex}].actives`]: questions[questionIndex].actives
      }
      if (willNext) {
        setDataObj.current = current + 1
      }
      this.setData(setDataObj)
    },
    // 题目索引切换时
    onChangeIndex(e) {
      const { current } = e.detail
      this.setData({
        current: current
      })
    }
  }
})
PageObj.use(Questions)

const Main = new DC_Component({
  _name: 'Main',
  data: {},
  style: {},
  methods: {}
})
  .frame('100%', '100%')
  .overflow()
  .boxSizing()
  .padding('top', '30px')
  .padding('bottom', '30px')
  .VStack()
PageObj.use(Main)

const Card = new DC_Component({
  _name: 'Card',
  data: {},
  style: {
    content: {
      width: '100%',
      position: 'relative'
    },
    _: {
      filter: 'drop-shadow(0px 0px 10px rgba(122, 219, 255, 0.1))'
    }
  },
  methods: {}
})
  .frame('90%')
  .boxSizing()
  .margin('top', '20px')
  .padding(null, '20px')
  .backgroundColor()
PageObj.use(Card)

const Title = new DC_Component({
  _name: 'Title',
  data: {},
  style: {},
  methods: {}
})
  .fontSize('$Title3')
  .fontBold()
  .fontAlign('justify')
  .fontColor('$title')
PageObj.use(Title)

const ButtonContainer = new DC_Component({
  _name: 'ButtonContainer',
  data: {},
  style: {
    index: {
      'margin-right': '10px',
      color: app.publicData.ColorSet.$title,
      'font-size': app.publicData.SizeMap.$Headline,
      'font-weight': 'bold'
    },
    title: {
      color: app.publicData.ColorSet.$title,
      'font-size': app.publicData.SizeMap.$Headline,
      'font-weight': 'bold',
      '-webkit-line-clamp': '2',
      'margin-right': '5px'
    },
    icon: {
      'font-size': app.publicData.SizeMap.$Caption2
    }
  },
  methods: {}
})
  .frame('95%')
  .margin()
  .margin('top', '20px')
  .margin('bottom', '20px')
PageObj.use(ButtonContainer)

Page(PageObj)

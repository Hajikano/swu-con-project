const app = getApp()
const DC_Component = app.DC_Utils.DC_Component

const PageObj = new app.DC_Utils.DC_Page({
  _isCompontent: true,
  options: {
    multipleSlots: true
  },
  properties: {
    cardID: {
      type: String,
      value: ''
    },
    width: {
      type: String,
      value: '85%'
    },
    height: {
      type: String,
      value: '130px'
    }
  },
  methods: {
    onClick() {
      this.triggerEvent(
        'onClick',
        {
          cardID: this.data.cardID
        },
        {}
      )
    }
  }
})

const itemCard = new DC_Component({
  _name: 'itemCard'
})
  .margin('', 'auto')
  .padding('', '15px')
  .backgroundColor('#FFFFFF')
  .shadow()
  .radius(5)
  .overflow('hidden')
PageObj.use(itemCard)

Component(PageObj)

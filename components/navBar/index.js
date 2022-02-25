const app = getApp()
const DC_Component = app.DC_Utils.DC_Component

const PageObj = new app.DC_Utils.DC_Page({
  _isCompontent: true,
  options: {
    multipleSlots: false
  },
  properties: {
    bgColor: {
      type: String,
      value: '#FFFFFF'
    },
    zIndex: {
      type: Number,
      value: 1000
    }
  },
  methods: {}
})

const NavBar = new DC_Component({
  _name: 'NavBar',
  style: {
    _: {
      position: 'fixed',
      top: '0px'
    },
    topSpace: {
      width: '100%',
      height: `${app.iDC_SystemInfo.navButton.top}px`
    }
  }
})
  .frame('100%', `${app.publicData.navBarHeight}px`)
  .overflow('hidden')
PageObj.use(NavBar)

const NavBar_Container = new DC_Component({
  _name: 'NavBar_Container',
  style: {}
})
  .frame(`${app.iDC_SystemInfo.navButton.left}px`, `${app.iDC_SystemInfo.navButton.height}px`)
  .HStack()
  .overflow('hidden')
PageObj.use(NavBar_Container)

Component(PageObj)

import { DC_Page } from '/utils/DC_Page/index'
import { DC_Router } from '/utils/DC_Router/index'
import { DC_Component, SizeMap, ColorSet } from '/utils/DC_Component/index'
import { iDC_Request } from '/apis/index'
import { DC_Store } from '/utils/DC_Store/index'
import {
  DC_IsAuthorize,
  DC_SystemInfo,
  DC_NavigateTo,
  DC_Loading,
  DC_SetNavBarColor,
  timeago
} from '/utils/DC_PublicFunc/index'
import { FileManager } from '/tools/FileManager'

// 为页面构造函数原型绑定router实例
const iDC_Router = new DC_Router()
DC_Page.prototype._router = iDC_Router

const iDC_SystemInfo = new DC_SystemInfo()
const iDC_Store = new DC_Store()
const iDC_NavigateTo = new DC_NavigateTo()
const iDC_Loading = new DC_Loading()
const iFileManager = new FileManager()

iDC_Store.state = {
  token: null, // 登录凭证
  user_id: null, // 用户id
  role: -1 // 用户类型
}

App({
  onLaunch: function () {
    // iDC_NavigateTo.replace('loading')
    iFileManager.init()
    console.log(iFileManager.FS.readdirSync(iFileManager.ROOT_PATH))
    console.log(iFileManager.FS.readdirSync(iFileManager.ROOT_PATH + iFileManager.EXPERIMENTS_DIRNAME))
    console.log(
      iFileManager.FS.readdirSync(
        iFileManager.ROOT_PATH + iFileManager.EXPERIMENTS_DIRNAME + iFileManager.IMAGES_DIRNAME
      )
    )
    const localDirArr = iFileManager.FS.readdirSync(
      iFileManager.ROOT_PATH + iFileManager.EXPERIMENTS_DIRNAME + iFileManager.LOCAL_DIRNAME
    )
    console.log(localDirArr)
    const onlineDirArr = iFileManager.FS.readdirSync(
      iFileManager.ROOT_PATH + iFileManager.EXPERIMENTS_DIRNAME + iFileManager.ONLINE_DIRNAME
    )
    console.log(onlineDirArr)
  },
  publicData: {
    maxRecordsNum: 5, // 最大实验记录数量
    maxTargetsNum: 3, // 最大采样点数量
    minGuideSampleNum: 3, // 最小标样数量
    maxGuideSampleNum: 5, // 最大标样数量
    minSampleNum: 1, // 最小样本数量
    maxSampleNum: 3, // 最大样本数量

    inactiveColor: '#F56C6C',
    activeColor: '#67C23A',
    systemInfo: 'v0.3.1a',
    name: '化院一点通',
    roles: {
      tourist: -1,
      teacher: 1,
      student: 2
    },
    SizeMap: SizeMap,
    ColorSet: ColorSet,
    navBarHeight: iDC_SystemInfo.navButton.top + iDC_SystemInfo.navButton.height + 10
  },
  iDC_Request: iDC_Request,
  iDC_SystemInfo: iDC_SystemInfo,
  iDC_Store: iDC_Store,
  iDC_Router: iDC_Router,
  iDC_NavigateTo: iDC_NavigateTo,
  iDC_Loading: iDC_Loading,
  iFileManager: iFileManager,
  fDC_IsAuthorize: DC_IsAuthorize,
  fDC_setNavBarColor: DC_SetNavBarColor,
  timeago,
  DC_Utils: { DC_Component, DC_Page }
})

export { iDC_Store }

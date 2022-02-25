import { iDC_Request } from './index'

// 获取随机题目列表
export function getQuestionListRandom() {
  let url = `/test/getQuestionListRandom`
  return new Promise((resolve) => {
    iDC_Request.get({
      url: url,
      success: (res) => {
        resolve(res.data)
      },
      fail: (res) => {
        wx.showToast({
          title: res.message ? res.message : '服务器错误',
          icon: 'none'
        })
      }
    })
  })
}

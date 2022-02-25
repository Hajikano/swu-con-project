import { iDC_Request } from './index'

// 获取视频链接列表
export function getVideoUrlList(data = {}) {
  let url = `/video/getVideoUrlList`
  let { pageSize } = data // 分页大小
  let { pageNum } = data // 分页号
  if (pageSize === undefined) pageSize = 10
  if (pageNum === undefined) pageNum = 1
  return new Promise((resolve) => {
    iDC_Request.get({
      url: url,
      data: { pageSize, pageNum },
      success: (res) => {
        resolve({
          videoUrlList: res.data
        })
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

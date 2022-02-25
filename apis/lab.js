import { iDC_Request } from './index'

// 获取实验列表
export function getLabList(data) {
  const url = '/lab/getLabList'
  const { course_id } = data
  return new Promise((resolve) => {
    iDC_Request.get({
      url: url,
      data: { course_id },
      success: (res) => {
        resolve(res)
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

// 发布一个实验
export function postLab(data) {
  const url = '/lab/postLab'
  const { course_id, labName, startTime, endTime } = data
  return new Promise((resolve) => {
    iDC_Request.post({
      url: url,
      data: { course_id, name: labName, start_time: startTime, end_time: endTime },
      success: (res) => {
        resolve(res)
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

// 修改一个实验信息
export function modifyLab(data) {
  const url = '/lab/modifyLab'
  const { lab_id, labName, startTime, endTime } = data
  return new Promise((resolve) => {
    iDC_Request.post({
      url: url,
      data: { lab_id, name: labName, start_time: startTime, end_time: endTime },
      success: (res) => {
        resolve(res)
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

// 删除一个实验
export function deleteLab(data) {
  const url = '/lab/deleteLab'
  let { lab_id } = data
  return new Promise((resolve) => {
    iDC_Request.get({
      url: url,
      data: { lab_id },
      success: (res) => {
        resolve(res)
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

// 查询实验状态
export function queryLabStatus(data) {
  const url = '/lab/queryLabStatus'
  let { lab_id } = data
  return new Promise((resolve, reject) => {
    iDC_Request.get({
      url: url,
      data: { lab_id },
      success: (res) => {
        resolve(res)
      },
      fail: () => {
        reject()
      }
    })
  })
}

// 参与一门实验
export function takeLab(data) {
  const url = '/lab/takeLab'
  const { lab_id } = data
  return new Promise((resolve) => {
    iDC_Request.post({
      url: url,
      data: { lab_id },
      success: (res) => {
        resolve(res)
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

// 上传答题分数
export function postTestResult(data) {
  const url = '/lab/postTestResult'
  const { lab_id, ratio } = data
  return new Promise((resolve) => {
    iDC_Request.post({
      url: url,
      data: { lab_id, ratio },
      success: (res) => {
        resolve(res)
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

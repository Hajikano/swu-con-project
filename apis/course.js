import { iDC_Request } from './index'

// 发布新课程
export function postCourse(data) {
  const url = '/course/postCourse'
  const { courseName } = data
  return new Promise((resolve) => {
    iDC_Request.post({
      url: url,
      data: { name: courseName },
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

// 获取课程列表
export function getCourseList(data) {
  const url = '/course/getCourseList'
  let { pageSize, pageNum, courseName, isPersonal } = data
  if (pageSize === undefined) pageSize = 10
  if (pageNum === undefined) pageNum = 1
  if (isPersonal === undefined) isPersonal = 0
  let queryData = {
    pageSize,
    pageNum,
    isPersonal,
    name: courseName
  }
  if (isPersonal === 0) {
    delete queryData.isPersonal
  }
  if (!(courseName && courseName.length)) {
    delete queryData.name
  }
  return new Promise((resolve) => {
    iDC_Request.get({
      url: url,
      data: queryData,
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

// 修改一门课程信息
export function modifyCourse(data) {
  const url = '/course/modifyCourse'
  const { course_id, courseName } = data
  return new Promise((resolve) => {
    iDC_Request.post({
      url: url,
      data: { course_id, name: courseName },
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

// 删除一门课程
export function deleteCourse(data) {
  const url = '/course/deleteCourse'
  let { course_id } = data
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

// 参与一门课程
export function takeCourse(data) {
  const url = '/course/takeCourse'
  let { course_id } = data
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

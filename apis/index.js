import { DC_Request } from '../utils/DC_Request/index'
import { iDC_Store } from '../app'

const domain = 'https://xxx.xxx.xxx'
const iDC_Request = new DC_Request({
  domain: domain
})

// 添加请求拦截方法
iDC_Request.interceptors.requestFunction = (options) => {
  if (iDC_Store.state.token) {
    const { token, user_id } = iDC_Store.state
    options.header.authorization = `${user_id} ${token}`
  }
  return options
}
// 添加响应拦截方法
iDC_Request.interceptors.responseFunction = (res) => {
  if (res.data.status !== 200) {
    res.data.status = 500
    return res.data
  } else {
    return res.data
  }
}

export { iDC_Request }

import { iDC_Request } from './index'
import { JSEncrypt } from 'wxmp-rsa'

// 账号登录
export function login(data) {
  const url = '/account/login'
  const { username, password } = data
  return new Promise((resolve) => {
    iDC_Request.post({
      url: url,
      data: { username, password: trans2RSA(password) },
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

// 修改密码
export function changePassword(data) {
  const url = '/account/changePassword'
  const { oldPassword, newPassword } = data
  return new Promise((resolve) => {
    iDC_Request.post({
      url: url,
      data: { oldPassword: trans2RSA(oldPassword), newPassword: trans2RSA(newPassword) },
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

// 获取用户信息
export function getUserInfo() {
  const url = '/account/getUserInfo'
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

function trans2RSA(str) {
  const publicKey = `-----BEGIN PUBLIC KEY-----xxx-----END PUBLIC KEY-----`
  const myEncrypt = new JSEncrypt()
  myEncrypt.setPublicKey(publicKey)

  const cryptStr = myEncrypt.encryptLong(str)
  return cryptStr
}

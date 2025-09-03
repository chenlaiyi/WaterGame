/**
 * 微信小游戏API适配器
 * 处理微信小游戏平台特有的API和功能
 */
class WechatGameAdapter {
  constructor() {
    this.isWechatGame = typeof wx !== 'undefined'
    this.userInfo = null
    this.systemInfo = null
    this.networkType = 'unknown'
    
    this.initializeWechatAPIs()
  }

  // 初始化微信API
  initializeWechatAPIs() {
    if (!this.isWechatGame) {
      console.warn('当前环境不是微信小游戏')
      return
    }

    this.getSystemInfo()
    this.monitorNetworkStatus()
    this.setupShareInfo()
    this.initCloudDevelopment()
  }

  // 获取系统信息
  getSystemInfo() {
    try {
      this.systemInfo = wx.getSystemInfoSync()
      console.log('系统信息:', this.systemInfo)
    } catch (error) {
      console.error('获取系统信息失败:', error)
    }
  }

  // 监听网络状态
  monitorNetworkStatus() {
    wx.getNetworkType({
      success: (res) => {
        this.networkType = res.networkType
        console.log('当前网络类型:', this.networkType)
      }
    })

    wx.onNetworkStatusChange((res) => {
      this.networkType = res.networkType
      console.log('网络状态变化:', res)
      
      if (!res.isConnected) {
        this.showNetworkError()
      }
    })
  }

  // 显示网络错误
  showNetworkError() {
    wx.showModal({
      title: '网络连接异常',
      content: '请检查网络连接后重试',
      showCancel: false,
      confirmText: '重试',
      success: () => {
        this.monitorNetworkStatus()
      }
    })
  }

  // 设置分享信息
  setupShareInfo() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })

    wx.onShareAppMessage(() => {
      return {
        title: '点点够净水消消乐 - 保护家庭用水安全',
        desc: '体验净水器工作原理，学习水质知识，寓教于乐！',
        path: '/pages/index/index',
        imageUrl: '/assets/images/share_default.png'
      }
    })

    if (wx.onShareTimeline) {
      wx.onShareTimeline(() => {
        return {
          title: '点点够净水消消乐 - 边玩边学水质知识',
          imageUrl: '/assets/images/share_timeline.png'
        }
      })
    }
  }

  // 初始化云开发
  initCloudDevelopment() {
    if (wx.cloud) {
      wx.cloud.init({
        env: 'water-game-env',
        traceUser: true
      })
      console.log('云开发初始化成功')
    } else {
      console.warn('云开发不可用')
    }
  }

  // 用户授权和登录
  async getUserInfo() {
    return new Promise((resolve, reject) => {
      wx.getSetting({
        success: (res) => {
          if (res.authSetting['scope.userInfo']) {
            wx.getUserInfo({
              success: (userRes) => {
                this.userInfo = userRes.userInfo
                this.loginToServer(userRes.userInfo)
                resolve(userRes.userInfo)
              },
              fail: reject
            })
          } else {
            this.requestUserAuthorization()
              .then(resolve)
              .catch(reject)
          }
        },
        fail: reject
      })
    })
  }

  // 请求用户授权
  async requestUserAuthorization() {
    return new Promise((resolve, reject) => {
      wx.showModal({
        title: '用户授权',
        content: '为了更好的游戏体验，需要获取您的基本信息用于排行榜和成就系统',
        confirmText: '授权',
        cancelText: '暂不',
        success: (res) => {
          if (res.confirm) {
            this.createAuthButton()
              .then(resolve)
              .catch(reject)
          } else {
            resolve(this.getGuestUserInfo())
          }
        }
      })
    })
  }

  // 创建授权按钮
  createAuthButton() {
    return new Promise((resolve, reject) => {
      const button = wx.createUserInfoButton({
        type: 'text',
        text: '获取用户信息',
        style: {
          left: 0,
          top: 0,
          width: this.systemInfo.windowWidth,
          height: this.systemInfo.windowHeight,
          backgroundColor: 'rgba(0,0,0,0.5)',
          color: '#ffffff',
          fontSize: 20,
          borderRadius: 10
        }
      })

      button.onTap((res) => {
        button.destroy()
        if (res.userInfo) {
          this.userInfo = res.userInfo
          this.loginToServer(res.userInfo)
          resolve(res.userInfo)
        } else {
          reject(new Error('用户拒绝授权'))
        }
      })
    })
  }

  // 获取游客用户信息
  getGuestUserInfo() {
    return {
      nickName: '游客' + Math.random().toString(36).substr(2, 4),
      avatarUrl: '/assets/images/default_avatar.png',
      gender: 0,
      country: '',
      province: '',
      city: '',
      language: 'zh_CN'
    }
  }

  // 登录到服务器
  async loginToServer(userInfo) {
    try {
      const loginCode = await this.getWxLoginCode()
      
      if (wx.cloud) {
        const result = await wx.cloud.callFunction({
          name: 'userLogin',
          data: {
            userInfo: userInfo,
            code: loginCode
          }
        })
        
        console.log('登录成功:', result)
        return result
      }
    } catch (error) {
      console.error('登录失败:', error)
    }
  }

  // 获取微信登录凭证
  getWxLoginCode() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res.code) {
            resolve(res.code)
          } else {
            reject(new Error('获取登录凭证失败'))
          }
        },
        fail: reject
      })
    })
  }

  // 显示加载中
  showLoading(title = '加载中...') {
    wx.showLoading({
      title: title,
      mask: true
    })
  }

  // 隐藏加载中
  hideLoading() {
    wx.hideLoading()
  }

  // 显示成功提示
  showSuccess(title) {
    wx.showToast({
      title: title,
      icon: 'success',
      duration: 2000
    })
  }

  // 显示错误提示
  showError(title) {
    wx.showToast({
      title: title,
      icon: 'none',
      duration: 2000
    })
  }

  // 振动反馈
  vibrate(type = 'short') {
    if (type === 'long') {
      wx.vibrateLong()
    } else {
      wx.vibrateShort()
    }
  }

  // 设置屏幕亮度
  setScreenBrightness(brightness) {
    wx.setScreenBrightness({
      value: brightness
    })
  }

  // 获取电池信息
  getBatteryInfo() {
    return new Promise((resolve, reject) => {
      wx.getBatteryInfo({
        success: resolve,
        fail: reject
      })
    })
  }
}

module.exports = WechatGameAdapter
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

    // 获取系统信息
    this.getSystemInfo()
    
    // 监听网络状态
    this.monitorNetworkStatus()
    
    // 设置分享信息
    this.setupShareInfo()
    
    // 初始化云开发
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
    // 获取当前网络状态
    wx.getNetworkType({
      success: (res) => {
        this.networkType = res.networkType
        console.log('当前网络类型:', this.networkType)
      }
    })

    // 监听网络状态变化
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
        // 可以在这里重新检查网络状态
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

    // 设置被动分享信息
    wx.onShareAppMessage(() => {
      return {
        title: '点点够净水消消乐 - 保护家庭用水安全',
        desc: '体验净水器工作原理，学习水质知识，寓教于乐！',
        path: '/pages/index/index',
        imageUrl: '/assets/images/share_default.png'
      }
    })

    // 设置分享到朋友圈信息（如果支持）
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
        env: 'water-game-env', // 需要替换为实际的云开发环境ID
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
      // 先检查是否已授权
      wx.getSetting({
        success: (res) => {
          if (res.authSetting['scope.userInfo']) {
            // 已授权，直接获取用户信息
            wx.getUserInfo({
              success: (userRes) => {
                this.userInfo = userRes.userInfo
                this.loginToServer(userRes.userInfo)
                resolve(userRes.userInfo)
              },
              fail: reject
            })
          } else {
            // 未授权，引导用户授权
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
            // 创建授权按钮
            this.createAuthButton()
              .then(resolve)
              .catch(reject)
          } else {
            // 用户拒绝授权，使用游客模式
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
      nickName: '游客用户',
      avatarUrl: '/assets/images/default_avatar.png',
      gender: 0,
      city: '',
      province: '',
      country: '',
      isGuest: true
    }
  }

  // 登录到服务器
  async loginToServer(userInfo) {
    try {
      // 获取微信登录凭证
      const loginRes = await this.wxLogin()
      
      // 调用云函数进行登录
      if (wx.cloud && wx.cloud.callFunction) {
        const result = await wx.cloud.callFunction({
          name: 'userLogin',
          data: {
            code: loginRes.code,
            userInfo: userInfo
          }
        })
        
        console.log('登录成功:', result)
        
        // 保存用户数据到全局
        const app = getApp()
        app.globalData.userInfo = userInfo
        app.globalData.userGameData.openId = result.result.openId || ''
        app.globalData.userGameData.nickname = userInfo.nickName
        app.globalData.userGameData.avatar = userInfo.avatarUrl
        app.saveGameData()
        
        return result.result
      }
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    }
  }

  // 微信登录
  wxLogin() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: resolve,
        fail: reject
      })
    })
  }

  // 创建激励视频广告
  createRewardedVideoAd(adUnitId) {
    if (!wx.createRewardedVideoAd) {
      console.warn('当前环境不支持激励视频广告')
      return null
    }

    const videoAd = wx.createRewardedVideoAd({
      adUnitId: adUnitId
    })

    // 预加载广告
    videoAd.load()

    return {
      show: () => {
        return new Promise((resolve, reject) => {
          videoAd.onLoad(() => {
            console.log('激励视频广告加载成功')
          })

          videoAd.onError((err) => {
            console.error('激励视频广告错误:', err)
            reject(err)
          })

          videoAd.onClose((res) => {
            if (res && res.isEnded) {
              resolve({ success: true, watched: true })
            } else {
              resolve({ success: false, watched: false })
            }
          })

          videoAd.show().catch(reject)
        })
      },
      load: () => videoAd.load(),
      destroy: () => videoAd.destroy()
    }
  }

  // 创建插屏广告
  createInterstitialAd(adUnitId) {
    if (!wx.createInterstitialAd) {
      console.warn('当前环境不支持插屏广告')
      return null
    }

    const interstitialAd = wx.createInterstitialAd({
      adUnitId: adUnitId
    })

    return {
      show: () => {
        return new Promise((resolve, reject) => {
          interstitialAd.onLoad(() => {
            console.log('插屏广告加载成功')
            resolve({ success: true })
          })

          interstitialAd.onError((err) => {
            console.error('插屏广告错误:', err)
            reject(err)
          })

          interstitialAd.onClose(() => {
            console.log('插屏广告关闭')
          })

          interstitialAd.show().catch(reject)
        })
      },
      load: () => interstitialAd.load(),
      destroy: () => interstitialAd.destroy()
    }
  }

  // 振动反馈
  vibrate(type = 'short') {
    if (!wx.vibrateShort) return

    try {
      if (type === 'long') {
        wx.vibrateLong()
      } else {
        wx.vibrateShort({ type: 'heavy' })
      }
    } catch (error) {
      console.log('振动功能不可用:', error)
    }
  }

  // 保持屏幕常亮
  setKeepScreenOn(keepOn = true) {
    wx.setKeepScreenOn({
      keepScreenOn: keepOn,
      success: () => {
        console.log(`屏幕常亮设置: ${keepOn}`)
      },
      fail: (error) => {
        console.log('设置屏幕常亮失败:', error)
      }
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

  // 检查更新
  checkForUpdate() {
    if (!wx.getUpdateManager) return

    const updateManager = wx.getUpdateManager()

    updateManager.onCheckForUpdate((res) => {
      console.log('检查更新结果:', res.hasUpdate)
    })

    updateManager.onUpdateReady(() => {
      wx.showModal({
        title: '更新提示',
        content: '新版本已下载完成，是否重启应用？',
        success: (res) => {
          if (res.confirm) {
            updateManager.applyUpdate()
          }
        }
      })
    })

    updateManager.onUpdateFailed(() => {
      wx.showModal({
        title: '更新失败',
        content: '新版本下载失败，请检查网络后重试',
        showCancel: false
      })
    })
  }

  // 上报游戏数据
  reportGameData(action, data = {}) {
    if (!wx.reportAnalytics) return

    try {
      wx.reportAnalytics(action, {
        ...data,
        timestamp: Date.now(),
        userId: this.userInfo?.nickName || 'guest'
      })
    } catch (error) {
      console.log('数据上报失败:', error)
    }
  }

  // 设置状态栏样式
  setStatusBarStyle(style = 'dark') {
    if (wx.setStatusBarStyle) {
      wx.setStatusBarStyle({
        style: style // 'dark' | 'light'
      })
    }
  }

  // 获取设备性能等级
  getPerformanceLevel() {
    return new Promise((resolve) => {
      if (wx.getPerformance) {
        wx.getPerformance().then((res) => {
          resolve(res.level) // 0: 低端, 1: 中端, 2: 高端
        })
      } else {
        // 根据系统信息估算性能等级
        const model = this.systemInfo?.model || ''
        if (model.includes('iPhone')) {
          resolve(2) // iOS设备通常性能较好
        } else {
          resolve(1) // 默认中端
        }
      }
    })
  }

  // 预加载资源
  preloadAssets(assets) {
    return Promise.all(
      assets.map(asset => {
        return new Promise((resolve, reject) => {
          if (asset.endsWith('.mp3') || asset.endsWith('.wav')) {
            // 音频文件
            const audio = wx.createInnerAudioContext()
            audio.src = asset
            audio.onCanplay(resolve)
            audio.onError(reject)
          } else {
            // 图片文件
            wx.getImageInfo({
              src: asset,
              success: resolve,
              fail: reject
            })
          }
        })
      })
    )
  }

  // 显示Loading
  showLoading(title = '加载中...') {
    wx.showLoading({
      title: title,
      mask: true
    })
  }

  // 隐藏Loading
  hideLoading() {
    wx.hideLoading()
  }

  // 显示Toast
  showToast(title, icon = 'success', duration = 2000) {
    wx.showToast({
      title: title,
      icon: icon,
      duration: duration
    })
  }

  // 显示确认对话框
  showConfirm(title, content) {
    return new Promise((resolve) => {
      wx.showModal({
        title: title,
        content: content,
        success: (res) => {
          resolve(res.confirm)
        }
      })
    })
  }

  // 退出游戏
  exitGame() {
    wx.exitMiniProgram()
  }
}

// 创建全局实例
const wechatAdapter = new WechatGameAdapter()

module.exports = wechatAdapter
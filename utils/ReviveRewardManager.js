/**
 * 复活与奖励系统管理器
 * 处理看广告复活、分享复活、道具获取等功能
 */
class ReviveRewardManager {
  constructor() {
    this.reviveData = {
      usedCount: 0,
      maxPerGame: 2,
      methods: {
        watchAd: true,
        share: true
      }
    }
    
    this.powerUpData = {
      bombs: {
        count: 0,
        dailyEarned: 0,
        maxDaily: 5,
        lastResetDate: new Date().toDateString()
      }
    }
    
    this.adTracking = {
      totalWatched: 0,
      todayWatched: 0,
      lastAdTime: 0
    }
    
    this.shareTracking = {
      totalShares: 0,
      todayShares: 0,
      shareSuccess: 0
    }
    
    this.loadData()
  }

  // 加载本地存储数据
  loadData() {
    try {
      const savedReviveData = wx.getStorageSync('reviveRewardData')
      if (savedReviveData) {
        this.reviveData = { ...this.reviveData, ...savedReviveData.revive }
        this.powerUpData = { ...this.powerUpData, ...savedReviveData.powerUps }
        this.adTracking = { ...this.adTracking, ...savedReviveData.adTracking }
        this.shareTracking = { ...this.shareTracking, ...savedReviveData.shareTracking }
      }
    } catch (error) {
      console.log('加载复活奖励数据失败:', error)
    }
    
    this.checkDailyReset()
  }

  // 保存数据到本地存储
  saveData() {
    try {
      const dataToSave = {
        revive: this.reviveData,
        powerUps: this.powerUpData,
        adTracking: this.adTracking,
        shareTracking: this.shareTracking
      }
      wx.setStorageSync('reviveRewardData', dataToSave)
    } catch (error) {
      console.log('保存复活奖励数据失败:', error)
    }
  }

  // 检查每日重置
  checkDailyReset() {
    const today = new Date().toDateString()
    if (this.powerUpData.bombs.lastResetDate !== today) {
      this.powerUpData.bombs.dailyEarned = 0
      this.powerUpData.bombs.lastResetDate = today
      this.adTracking.todayWatched = 0
      this.shareTracking.todayShares = 0
      this.saveData()
    }
  }

  // 检查是否可以复活
  canRevive() {
    return this.reviveData.usedCount < this.reviveData.maxPerGame
  }

  // 获取剩余复活次数
  getRemainingRevives() {
    return this.reviveData.maxPerGame - this.reviveData.usedCount
  }

  // 看广告复活
  async reviveByWatchingAd() {
    return new Promise((resolve, reject) => {
      if (!this.canRevive()) {
        reject(new Error('复活次数已用完'))
        return
      }

      // 创建激励视频广告
      const videoAd = wx.createRewardedVideoAd({
        adUnitId: 'adunit-revive-001' // 需要替换为实际的广告位ID
      })

      videoAd.onLoad(() => {
        console.log('复活广告加载成功')
      })

      videoAd.onError((err) => {
        console.log('复活广告加载失败:', err)
        reject(new Error('广告加载失败，请稍后重试'))
      })

      videoAd.onClose((res) => {
        if (res && res.isEnded) {
          // 用户观看完整广告
          this.executeRevive('ad')
          this.updateAdTracking()
          resolve({
            success: true,
            method: 'ad',
            remainingRevives: this.getRemainingRevives()
          })
        } else {
          reject(new Error('需要观看完整广告才能获得复活'))
        }
      })

      // 显示广告
      videoAd.show().catch(() => {
        reject(new Error('广告显示失败'))
      })
    })
  }

  // 分享复活
  async reviveBySharing() {
    return new Promise((resolve, reject) => {
      if (!this.canRevive()) {
        reject(new Error('复活次数已用完'))
        return
      }

      const shareData = {
        title: '我在《管道净化消消乐》中遇到难关，快来帮我一起净化水源吧！',
        desc: '点点够净水器，RO反渗透技术，980元用2年',
        path: '/pages/game/game',
        imageUrl: '/assets/images/share_revive.png'
      }

      wx.showShareMenu({
        withShareTicket: true,
        success: () => {
          wx.shareAppMessage({
            ...shareData,
            success: (res) => {
              this.executeRevive('share')
              this.updateShareTracking(true)
              resolve({
                success: true,
                method: 'share',
                remainingRevives: this.getRemainingRevives()
              })
            },
            fail: (err) => {
              this.updateShareTracking(false)
              reject(new Error('分享失败'))
            }
          })
        },
        fail: () => {
          reject(new Error('分享功能不可用'))
        }
      })
    })
  }

  // 执行复活
  executeRevive(method) {
    this.reviveData.usedCount++
    this.saveData()
    
    // 触发复活事件
    this.triggerReviveEvent(method)
  }

  // 触发复活事件
  triggerReviveEvent(method) {
    // 由具体的游戏页面实现
    console.log(`复活成功，方式: ${method}`)
  }

  // 更新广告观看记录
  updateAdTracking() {
    this.adTracking.totalWatched++
    this.adTracking.todayWatched++
    this.adTracking.lastAdTime = Date.now()
    this.saveData()
  }

  // 更新分享记录
  updateShareTracking(success) {
    this.shareTracking.totalShares++
    this.shareTracking.todayShares++
    if (success) {
      this.shareTracking.shareSuccess++
    }
    this.saveData()
  }

  // 重置游戏复活数据
  resetGameReviveData() {
    this.reviveData.usedCount = 0
    this.saveData()
  }

  // 检查是否可以获得免费道具
  canGetFreePowerUp() {
    return this.powerUpData.bombs.dailyEarned < this.powerUpData.bombs.maxDaily
  }

  // 获取剩余免费道具次数
  getRemainingFreePowerUps() {
    return this.powerUpData.bombs.maxDaily - this.powerUpData.bombs.dailyEarned
  }

  // 看广告获得道具
  async getPowerUpByWatchingAd() {
    return new Promise((resolve, reject) => {
      if (!this.canGetFreePowerUp()) {
        reject(new Error('今日免费道具已达上限'))
        return
      }

      const videoAd = wx.createRewardedVideoAd({
        adUnitId: 'adunit-powerup-001' // 需要替换为实际的广告位ID
      })

      videoAd.onLoad(() => {
        console.log('道具广告加载成功')
      })

      videoAd.onError((err) => {
        console.log('道具广告加载失败:', err)
        reject(new Error('广告加载失败'))
      })

      videoAd.onClose((res) => {
        if (res && res.isEnded) {
          const powerUp = this.generateRandomPowerUp()
          this.awardPowerUp(powerUp)
          this.updateAdTracking()
          
          resolve({
            success: true,
            powerUp: powerUp,
            remaining: this.getRemainingFreePowerUps()
          })
        } else {
          reject(new Error('需要观看完整广告'))
        }
      })

      videoAd.show().catch(() => {
        reject(new Error('广告显示失败'))
      })
    })
  }

  // 分享获得道具
  async getPowerUpBySharing() {
    return new Promise((resolve, reject) => {
      if (!this.canGetFreePowerUp()) {
        reject(new Error('今日免费道具已达上限'))
        return
      }

      const shareData = {
        title: '《点点够净水消消乐》太好玩了！还能学到水质知识',
        desc: '一起来净化管道，保护家庭用水安全吧！',
        path: '/pages/index/index',
        imageUrl: '/assets/images/share_powerup.png'
      }

      wx.showShareMenu({
        withShareTicket: true,
        success: () => {
          wx.shareAppMessage({
            ...shareData,
            success: (res) => {
              const powerUp = this.generateRandomPowerUp()
              this.awardPowerUp(powerUp)
              this.updateShareTracking(true)
              
              resolve({
                success: true,
                powerUp: powerUp,
                remaining: this.getRemainingFreePowerUps()
              })
            },
            fail: () => {
              this.updateShareTracking(false)
              reject(new Error('分享失败'))
            }
          })
        }
      })
    })
  }

  // 生成随机道具
  generateRandomPowerUp() {
    const powerUps = [
      { type: 'pp_cotton', name: 'PP棉炸弹', description: '清除3x3区域的颗粒污染物' },
      { type: 'cto_laser', name: 'CTO激光', description: '清除整行或整列的微生物' },
      { type: 'ro_wave', name: 'RO清洁波', description: '清除全屏指定类型污染物' }
    ]
    
    return powerUps[Math.floor(Math.random() * powerUps.length)]
  }

  // 奖励道具
  awardPowerUp(powerUp) {
    this.powerUpData.bombs.count++
    this.powerUpData.bombs.dailyEarned++
    
    // 更新用户道具数据
    const app = getApp()
    if (!app.globalData.userGameData.powerups) {
      app.globalData.userGameData.powerups = {}
    }
    
    if (!app.globalData.userGameData.powerups[powerUp.type]) {
      app.globalData.userGameData.powerups[powerUp.type] = 0
    }
    
    app.globalData.userGameData.powerups[powerUp.type]++
    app.saveGameData()
    
    this.saveData()
  }

  // 获取复活统计数据
  getReviveStats() {
    return {
      used: this.reviveData.usedCount,
      remaining: this.getRemainingRevives(),
      maxPerGame: this.reviveData.maxPerGame
    }
  }

  // 获取道具统计数据
  getPowerUpStats() {
    return {
      dailyEarned: this.powerUpData.bombs.dailyEarned,
      maxDaily: this.powerUpData.bombs.maxDaily,
      remaining: this.getRemainingFreePowerUps()
    }
  }

  // 获取广告观看统计
  getAdStats() {
    return {
      totalWatched: this.adTracking.totalWatched,
      todayWatched: this.adTracking.todayWatched
    }
  }

  // 获取分享统计
  getShareStats() {
    return {
      totalShares: this.shareTracking.totalShares,
      todayShares: this.shareTracking.todayShares,
      successRate: this.shareTracking.totalShares > 0 ? 
        (this.shareTracking.shareSuccess / this.shareTracking.totalShares * 100).toFixed(1) : 0
    }
  }
}

module.exports = ReviveRewardManager
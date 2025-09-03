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

      const videoAd = wx.createRewardedVideoAd({
        adUnitId: 'adunit-revive-001'
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
        title: '我在《点点够净水消消乐》中遇到难关，快来帮我一起净化水源吧！',
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
    this.triggerReviveEvent(method)
  }

  // 触发复活事件
  triggerReviveEvent(method) {
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

  // 获取道具奖励
  async earnPowerUpReward() {
    if (this.powerUpData.bombs.dailyEarned >= this.powerUpData.bombs.maxDaily) {
      return {
        success: false,
        message: '今日道具奖励已达上限'
      }
    }

    return new Promise((resolve, reject) => {
      const videoAd = wx.createRewardedVideoAd({
        adUnitId: 'adunit-powerup-001'
      })

      videoAd.onClose((res) => {
        if (res && res.isEnded) {
          this.powerUpData.bombs.count++
          this.powerUpData.bombs.dailyEarned++
          this.updateAdTracking()
          
          resolve({
            success: true,
            reward: 'pp_cotton_bomb',
            remaining: this.powerUpData.bombs.maxDaily - this.powerUpData.bombs.dailyEarned
          })
        } else {
          reject(new Error('需要观看完整广告才能获得奖励'))
        }
      })

      videoAd.show().catch(() => {
        reject(new Error('广告显示失败'))
      })
    })
  }

  // 重置游戏复活数据
  resetGameReviveData() {
    this.reviveData.usedCount = 0
    this.saveData()
  }

  // 获取统计数据
  getStatistics() {
    return {
      revive: {
        total: this.reviveData.usedCount,
        remaining: this.getRemainingRevives()
      },
      ads: {
        total: this.adTracking.totalWatched,
        today: this.adTracking.todayWatched
      },
      shares: {
        total: this.shareTracking.totalShares,
        today: this.shareTracking.todayShares,
        successRate: this.shareTracking.totalShares > 0 ? 
          Math.round((this.shareTracking.shareSuccess / this.shareTracking.totalShares) * 100) : 0
      },
      powerUps: {
        bombs: this.powerUpData.bombs.count,
        dailyRemaining: this.powerUpData.bombs.maxDaily - this.powerUpData.bombs.dailyEarned
      }
    }
  }
}

module.exports = ReviveRewardManager
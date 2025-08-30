// pages/index/index.js
const app = getApp()

Page({
  data: {
    userInfo: null,
    gameData: {},
    gameSettings: {},
    levelList: [],
    dailyTasks: [],
    showBrandModal: false,
    showSettingsModal: false,
    maxUnlockedLevel: 1
  },

  onLoad() {
    this.initPageData()
    this.loadUserInfo()
    this.generateLevels()
    this.loadDailyTasks()
  },

  onShow() {
    // 每次显示页面时更新数据
    this.setData({
      gameData: app.globalData.userGameData,
      gameSettings: app.globalData.gameSettings
    })
  },

  // 初始化页面数据
  initPageData() {
    this.setData({
      gameData: app.globalData.userGameData,
      gameSettings: app.globalData.gameSettings,
      userInfo: app.globalData.userInfo
    })
  },

  // 加载用户信息
  loadUserInfo() {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo
      })
    }
  },

  // 生成关卡列表
  generateLevels() {
    const levels = []
    for (let i = 1; i <= 50; i++) {
      levels.push(i)
    }
    
    // 计算最大解锁关卡
    const maxUnlockedLevel = Math.max(...app.globalData.userGameData.unlockedLevels)
    
    this.setData({
      levelList: levels,
      maxUnlockedLevel: maxUnlockedLevel
    })
  },

  // 加载每日任务
  loadDailyTasks() {
    const tasks = [
      {
        id: 'daily_play',
        name: '完成3局游戏',
        reward: 50,
        progress: 1,
        target: 3,
        completed: false
      },
      {
        id: 'daily_score',
        name: '单局得分超过1000',
        reward: 100,
        progress: 0,
        target: 1,
        completed: false
      },
      {
        id: 'daily_level',
        name: '通过新关卡',
        reward: 200,
        progress: 0,
        target: 1,
        completed: false
      }
    ]
    
    this.setData({
      dailyTasks: tasks
    })
  },

  // 获取用户信息授权
  onGetUserInfo(e) {
    if (e.detail.userInfo) {
      app.globalData.userInfo = e.detail.userInfo
      this.setData({
        userInfo: e.detail.userInfo
      })
      
      wx.showToast({
        title: '登录成功',
        icon: 'success'
      })
    }
  },

  // 选择关卡
  onSelectLevel(e) {
    const level = e.currentTarget.dataset.level
    const maxUnlocked = this.data.maxUnlockedLevel || 1
    
    if (level > maxUnlocked) {
      wx.showToast({
        title: '请先通过前面的关卡',
        icon: 'none'
      })
      return
    }
    
    // 跳转到游戏页面
    wx.navigateTo({
      url: `/pages/game/game?level=${level}`
    })
  },

  // 快速开始游戏
  onQuickStart() {
    const currentLevel = this.data.gameData.level || 1
    wx.navigateTo({
      url: `/pages/game/game?level=${currentLevel}`
    })
  },

  // 完成任务
  onCompleteTask(e) {
    const task = e.currentTarget.dataset.task
    if (task.completed) return
    
    // 这里可以添加任务完成逻辑
    wx.showToast({
      title: '任务进行中...',
      icon: 'none'
    })
  },

  // 显示品牌信息
  onShowBrandInfo() {
    this.setData({
      showBrandModal: true
    })
  },

  // 隐藏品牌信息
  onHideBrandModal() {
    this.setData({
      showBrandModal: false
    })
  },

  // 联系我们
  onContactUs() {
    wx.showModal({
      title: '联系我们',
      content: '客服电话: 400-123-4567\n微信: diandian-go\n官网: www.diandian.com',
      confirmText: '复制电话',
      success: (res) => {
        if (res.confirm) {
          wx.setClipboardData({
            data: '400-123-4567',
            success: () => {
              wx.showToast({
                title: '电话已复制',
                icon: 'success'
              })
            }
          })
        }
      }
    })
    
    this.setData({
      showBrandModal: false
    })
  },

  // 显示设置
  onShowSettings() {
    this.setData({
      showSettingsModal: true
    })
  },

  // 隐藏设置
  onHideSettingsModal() {
    this.setData({
      showSettingsModal: false
    })
  },

  // 音效设置
  onSoundChange(e) {
    const sound = e.detail.value
    app.globalData.gameSettings.sound = sound
    this.setData({
      'gameSettings.sound': sound
    })
    app.saveGameData()
  },

  // 音乐设置
  onMusicChange(e) {
    const music = e.detail.value
    app.globalData.gameSettings.music = music
    this.setData({
      'gameSettings.music': music
    })
    app.saveGameData()
  },

  // 震动设置
  onVibrationChange(e) {
    const vibration = e.detail.value
    app.globalData.gameSettings.vibration = vibration
    this.setData({
      'gameSettings.vibration': vibration
    })
    app.saveGameData()
  },

  // 重置游戏
  onResetGame() {
    wx.showModal({
      title: '重置游戏',
      content: '确定要重置所有游戏数据吗？此操作不可恢复！',
      success: (res) => {
        if (res.confirm) {
          // 重置游戏数据
          app.globalData.userGameData = {
            openId: '',
            nickname: '',
            avatar: '',
            level: 1,
            totalScore: 0,
            coins: 100,
            achievements: [],
            unlockedLevels: [1]
          }
          
          app.saveGameData()
          
          this.setData({
            gameData: app.globalData.userGameData,
            showSettingsModal: false
          })
          
          wx.showToast({
            title: '重置成功',
            icon: 'success'
          })
          
          // 重新生成关卡
          this.generateLevels()
        }
      }
    })
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 空函数，用于阻止事件冒泡
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: '点点够净水消消乐 - 守护家庭用水安全',
      path: '/pages/index/index',
      imageUrl: '/images/share_image.png'
    }
  }
})
App({
  globalData: {
    userInfo: null,
    userGameData: {
      openId: '',
      nickname: '',
      avatar: '',
      level: 1,
      totalScore: 0,
      coins: 100,
      achievements: [],
      unlockedLevels: [1]
    },
    gameSettings: {
      sound: true,
      music: true,
      vibration: true
    }
  },

  onLaunch() {
    // 初始化云开发
    if (wx.cloud) {
      wx.cloud.init({
        env: 'water-game-env'
      })
    }
    
    // 获取用户信息
    this.getUserInfo()
    
    // 初始化游戏数据
    this.initGameData()
  },

  getUserInfo() {
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: res => {
              this.globalData.userInfo = res.userInfo
            }
          })
        }
      }
    })
  },

  initGameData() {
    // 从本地存储读取游戏数据
    const savedData = wx.getStorageSync('gameData')
    if (savedData) {
      this.globalData.userGameData = { ...this.globalData.userGameData, ...savedData }
    }
  },

  saveGameData() {
    wx.setStorageSync('gameData', this.globalData.userGameData)
  }
})
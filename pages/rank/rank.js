// pages/rank/rank.js
const app = getApp()
const Logger = require('../../utils/Logger.js')

Page({
  data: {
    activeTab: 'score', // score, level, coins
    scoreRank: [],
    levelRank: [],
    coinsRank: [],
    userInfo: null,
    userRank: {
      score: 0,
      level: 0,
      coins: 0
    }
  },

  onLoad() {
    Logger.info('排行榜页面加载')
    this.initPageData()
  },

  // 初始化页面数据
  initPageData() {
    this.setData({
      userInfo: app.globalData.userInfo,
      scoreRank: this.generateScoreRank(),
      levelRank: this.generateLevelRank(),
      coinsRank: this.generateCoinsRank()
    })
    
    this.calculateUserRank()
  },

  // 生成分数排行榜
  generateScoreRank() {
    return [
      { rank: 1, nickname: '净水达人', score: 15800, avatar: '/images/avatars/avatar1.jpg' },
      { rank: 2, nickname: '水滴守护者', score: 14250, avatar: '/images/avatars/avatar2.jpg' },
      { rank: 3, nickname: '纯净之王', score: 13680, avatar: '/images/avatars/avatar3.jpg' },
      { rank: 4, nickname: '清泉使者', score: 12900, avatar: '/images/avatars/avatar4.jpg' },
      { rank: 5, nickname: '净水专家', score: 11850, avatar: '/images/avatars/avatar5.jpg' },
      { rank: 6, nickname: '水处理师', score: 10920, avatar: '/images/avatars/avatar6.jpg' },
      { rank: 7, nickname: '水质分析师', score: 9850, avatar: '/images/avatars/avatar7.jpg' },
      { rank: 8, nickname: '净水先锋', score: 8760, avatar: '/images/avatars/avatar8.jpg' },
      { rank: 9, nickname: '水质守护神', score: 7650, avatar: '/images/avatars/avatar9.jpg' },
      { rank: 10, nickname: '纯净水专家', score: 6540, avatar: '/images/avatars/avatar10.jpg' }
    ]
  },

  // 生成等级排行榜
  generateLevelRank() {
    return [
      { rank: 1, nickname: '净水大师', level: 45, avatar: '/images/avatars/avatar1.jpg' },
      { rank: 2, nickname: '水滴宗师', level: 42, avatar: '/images/avatars/avatar2.jpg' },
      { rank: 3, nickname: '纯净之尊', level: 39, avatar: '/images/avatars/avatar3.jpg' },
      { rank: 4, nickname: '清泉圣者', level: 37, avatar: '/images/avatars/avatar4.jpg' },
      { rank: 5, nickname: '净水至尊', level: 35, avatar: '/images/avatars/avatar5.jpg' },
      { rank: 6, nickname: '水处理专家', level: 32, avatar: '/images/avatars/avatar6.jpg' },
      { rank: 7, nickname: '水质分析师', level: 30, avatar: '/images/avatars/avatar7.jpg' },
      { rank: 8, nickname: '净水先锋', level: 28, avatar: '/images/avatars/avatar8.jpg' },
      { rank: 9, nickname: '水质守护神', level: 25, avatar: '/images/avatars/avatar9.jpg' },
      { rank: 10, nickname: '纯净水专家', level: 22, avatar: '/images/avatars/avatar10.jpg' }
    ]
  },

  // 生成金币排行榜
  generateCoinsRank() {
    return [
      { rank: 1, nickname: '财富大亨', coins: 25680, avatar: '/images/avatars/avatar1.jpg' },
      { rank: 2, nickname: '金币收藏家', coins: 23450, avatar: '/images/avatars/avatar2.jpg' },
      { rank: 3, nickname: '财富达人', coins: 21560, avatar: '/images/avatars/avatar3.jpg' },
      { rank: 4, nickname: '金币猎人', coins: 19870, avatar: '/images/avatars/avatar4.jpg' },
      { rank: 5, nickname: '财富守护者', coins: 18230, avatar: '/images/avatars/avatar5.jpg' },
      { rank: 6, nickname: '金币专家', coins: 16780, avatar: '/images/avatars/avatar6.jpg' },
      { rank: 7, nickname: '财富分析师', coins: 15430, avatar: '/images/avatars/avatar7.jpg' },
      { rank: 8, nickname: '金币先锋', coins: 14210, avatar: '/images/avatars/avatar8.jpg' },
      { rank: 9, nickname: '财富守护神', coins: 13050, avatar: '/images/avatars/avatar9.jpg' },
      { rank: 10, nickname: '金币大亨', coins: 11890, avatar: '/images/avatars/avatar10.jpg' }
    ]
  },

  // 计算用户排名
  calculateUserRank() {
    const userData = app.globalData.userGameData
    const userRank = {
      score: this.calculateRank(this.data.scoreRank, userData.totalScore, 'score'),
      level: this.calculateRank(this.data.levelRank, userData.level, 'level'),
      coins: this.calculateRank(this.data.coinsRank, userData.coins, 'coins')
    }
    
    this.setData({
      userRank: userRank
    })
  },

  // 计算排名
  calculateRank(rankList, userValue, type) {
    // 在实际应用中，这里应该从服务器获取完整排行榜并计算排名
    // 这里简化处理，根据用户数值估算排名
    if (rankList.length === 0) return 0
    
    // 找到第一个小于用户数值的排名
    for (let i = 0; i < rankList.length; i++) {
      if (userValue >= rankList[i][type]) {
        return Math.max(1, i) // 确保排名至少为1
      }
    }
    
    // 如果用户数值比所有排行榜用户都低，则排名在最后
    return rankList.length + 1
  },

  // 切换标签页
  onTabChange(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({
      activeTab: tab
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    wx.showLoading({ title: '刷新中...' })
    
    // 模拟刷新数据
    setTimeout(() => {
      this.initPageData()
      wx.hideLoading()
      wx.stopPullDownRefresh()
      wx.showToast({ title: '刷新成功' })
    }, 1000)
  },

  // 分享排行榜
  onShareRank() {
    wx.shareAppMessage({
      title: '点点够净水消消乐排行榜',
      desc: '来看看我在排行榜上的位置吧！',
      path: '/pages/rank/rank'
    })
  },

  // 邀请好友
  onInviteFriends() {
    wx.shareAppMessage({
      title: '一起来玩点点够净水消消乐吧！',
      desc: '寓教于乐的净水知识小游戏',
      path: '/pages/index/index'
    })
  }
})
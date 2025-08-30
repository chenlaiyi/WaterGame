// pages/rank/rank.js
const app = getApp()

Page({
  data: {
    currentTab: 'score', // score, level, friends
    userInfo: {},
    myRank: {
      position: 0,
      score: 0,
      level: 1,
      friendsCount: 0,
      trend: 'up', // up, down, stable
      trendText: '上升'
    },
    rankList: [],
    
    // 弹窗状态
    showUserModal: false,
    showRewardsModal: false,
    selectedUser: {}
  },

  onLoad() {
    this.initData()
  },

  onShow() {
    this.refreshRankData()
  },

  // 初始化数据
  initData() {
    const userInfo = app.globalData.userInfo || {}
    const gameData = app.globalData.userGameData || {}
    
    this.setData({
      userInfo: userInfo,
      'myRank.score': gameData.totalScore || 0,
      'myRank.level': gameData.level || 1,
      'myRank.friendsCount': gameData.friendsCount || 0
    })
    
    this.loadRankList()
  },

  // 刷新排行榜数据
  onRefreshRank() {
    wx.showLoading({
      title: '刷新中...'
    })
    
    // 模拟网络请求延迟
    setTimeout(() => {
      this.loadRankList()
      wx.hideLoading()
      wx.showToast({
        title: '刷新成功',
        icon: 'success',
        duration: 1000
      })
    }, 1000)
  },

  // 刷新排行榜数据
  refreshRankData() {
    this.loadRankList()
  },

  // 切换标签
  onSwitchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({
      currentTab: tab
    })
    this.loadRankList()
  },

  // 加载排行榜列表
  loadRankList() {
    // 模拟排行榜数据
    const mockUsers = this.generateMockRankData()
    
    // 根据当前标签排序
    let sortedUsers = [...mockUsers]
    const currentUser = app.globalData.userInfo
    
    switch(this.data.currentTab) {
      case 'score':
        sortedUsers.sort((a, b) => b.totalScore - a.totalScore)
        break
      case 'level':
        sortedUsers.sort((a, b) => b.maxLevel - a.maxLevel)
        break
      case 'friends':
        sortedUsers.sort((a, b) => b.winRate - a.winRate)
        break
    }
    
    // 标记当前用户并查找排名
    let myPosition = 0
    sortedUsers.forEach((user, index) => {
      if (user.isCurrentUser) {
        user.isCurrentUser = true
        myPosition = index + 1
      }
    })
    
    this.setData({
      rankList: sortedUsers,
      'myRank.position': myPosition
    })
  },

  // 生成模拟排行榜数据
  generateMockRankData() {
    const names = [
      '净水达人', '清洁大师', '管道专家', '水质卫士', '过滤高手',
      'RO之王', '纯净使者', '污染克星', '健康守护', '滤芯专家',
      '消毒专家', '水源保护者', '净化能手', '安全用水', '洁净生活'
    ]
    
    const avatars = [
      '/images/avatar1.png', '/images/avatar2.png', '/images/avatar3.png',
      '/images/avatar4.png', '/images/avatar5.png', '/images/default_avatar.png'
    ]
    
    const users = []
    const currentUserInfo = app.globalData.userInfo || {}
    const currentGameData = app.globalData.userGameData || {}
    
    // 添加当前用户
    users.push({
      openId: 'current_user',
      nickName: currentUserInfo.nickName || '我',
      avatarUrl: currentUserInfo.avatarUrl || '/images/default_avatar.png',
      totalScore: currentGameData.totalScore || Math.floor(Math.random() * 5000),
      maxLevel: currentGameData.level || Math.floor(Math.random() * 20) + 1,
      gamesPlayed: Math.floor(Math.random() * 100) + 10,
      winRate: Math.floor(Math.random() * 40) + 60,
      isOnline: true,
      isCurrentUser: true,
      achievements: this.generateAchievements()
    })
    
    // 生成其他用户
    for (let i = 0; i < 20; i++) {
      users.push({
        openId: `user_${i}`,
        nickName: names[Math.floor(Math.random() * names.length)],
        avatarUrl: avatars[Math.floor(Math.random() * avatars.length)],
        totalScore: Math.floor(Math.random() * 10000),
        maxLevel: Math.floor(Math.random() * 30) + 1,
        gamesPlayed: Math.floor(Math.random() * 200) + 5,
        winRate: Math.floor(Math.random() * 50) + 50,
        isOnline: Math.random() > 0.3,
        isCurrentUser: false,
        achievements: this.generateAchievements()
      })
    }
    
    return users
  },

  // 生成成就数据
  generateAchievements() {
    const allAchievements = [
      { id: 'newcomer', name: '新手上路', icon: '🌟' },
      { id: 'expert', name: '净水专家', icon: '💧' },
      { id: 'master', name: '过滤大师', icon: '🏆' },
      { id: 'guardian', name: '水质卫士', icon: '🛡️' },
      { id: 'champion', name: '清洁冠军', icon: '👑' }
    ]
    
    const achievementCount = Math.floor(Math.random() * 4) + 1
    return allAchievements.slice(0, achievementCount)
  },

  // 获取当前标签对应的值
  getCurrentTabValue(user) {
    switch(this.data.currentTab) {
      case 'score':
        return user.totalScore.toLocaleString()
      case 'level':
        return user.maxLevel
      case 'friends':
        return user.winRate + '%'
      default:
        return user.totalScore.toLocaleString()
    }
  },

  // 查看用户详情
  onViewUserProfile(e) {
    const user = e.currentTarget.dataset.user
    if (user && !user.isCurrentUser) {
      this.setData({
        selectedUser: user,
        showUserModal: true
      })
    }
  },

  // 隐藏用户详情
  onHideUserModal() {
    this.setData({
      showUserModal: false,
      selectedUser: {}
    })
  },

  // 挑战用户
  onChallengeUser(e) {
    const user = e.currentTarget.dataset.user
    
    if (!user) return
    
    wx.showModal({
      title: '发起挑战',
      content: `确定要向 ${user.nickName} 发起挑战吗？\n挑战成功可获得额外奖励！`,
      success: (res) => {
        if (res.confirm) {
          // 这里可以实现挑战功能，比如跳转到对战模式
          wx.showModal({
            title: '挑战发起成功',
            content: '已向对方发送挑战请求，等待对方接受挑战。',
            showCancel: false,
            confirmText: '知道了'
          })
          
          // 隐藏用户详情弹窗
          if (this.data.showUserModal) {
            this.onHideUserModal()
          }
        }
      }
    })
  },

  // 分享排名
  onShareRank() {
    const position = this.data.myRank.position
    const tab = this.data.currentTab
    
    let shareTitle = ''
    let shareDesc = ''
    
    switch(tab) {
      case 'score':
        shareTitle = `我在净水消消乐得分榜排名第${position}名！`
        shareDesc = `最高得分：${this.data.myRank.score}分，快来挑战我吧！`
        break
      case 'level':
        shareTitle = `我在净水消消乐关卡榜排名第${position}名！`
        shareDesc = `已通过${this.data.myRank.level}关，一起来净化水质吧！`
        break
      case 'friends':
        shareTitle = `我在净水消消乐好友榜表现优异！`
        shareDesc = '快来和我一起保护家庭用水安全！'
        break
    }
    
    wx.shareAppMessage({
      title: shareTitle,
      desc: shareDesc,
      path: '/pages/rank/rank',
      imageUrl: '/images/rank_share.png'
    })
  },

  // 邀请好友
  onInviteFriends() {
    wx.shareAppMessage({
      title: '快来和我一起玩净水消消乐吧！',
      desc: '学习净水知识，保护家庭用水安全，还有丰厚奖励等你来拿！',
      path: '/pages/index/index',
      imageUrl: '/images/invite_share.png'
    })
  },

  // 查看奖励规则
  onViewRewards() {
    this.setData({
      showRewardsModal: true
    })
  },

  // 隐藏奖励规则
  onHideRewardsModal() {
    this.setData({
      showRewardsModal: false
    })
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 空函数，用于阻止事件冒泡
  },

  // 分享功能
  onShareAppMessage() {
    const position = this.data.myRank.position
    
    return {
      title: `我在点点够净水消消乐排行榜排名第${position}名！`,
      desc: '快来挑战我，一起学习净水知识！',
      path: '/pages/rank/rank',
      imageUrl: '/images/rank_share.png'
    }
  }
})
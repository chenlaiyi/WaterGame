// pages/game/game.js
const GameManager = require('../../utils/GameManager')
const MatchEngine = require('../../utils/MatchEngine')
const app = getApp()

Page({
  data: {
    currentLevel: 1,
    score: 0,
    timeLeft: 300,
    timeUsed: 0,
    gameBlocks: [],
    powerups: {},
    
    // 游戏状态
    gameState: 'playing', // playing, paused, gameOver, completed
    
    // 复活系统
    reviveUsed: 0,
    maxRevive: 2,
    canRevive: true,
    gameOverReason: '',
    
    // 弹窗状态
    showGameOverModal: false,
    showWinModal: false,
    showPauseModal: false,
    showSmartModal: false,
    
    // 智能控制
    waterQuality: 'good',
    waterQualityText: '优秀',
    chipActive: true,
    strongFlushCooldown: 0,
    filterLife: {
      pp: 85,
      cto: 70,
      ro: 90
    },
    
    // 奖励
    rewardCoins: 0
  },

  gameManager: null,
  matchEngine: null,
  gameTimer: null,
  cooldownTimer: null,

  onLoad(options) {
    // 获取关卡参数
    const level = parseInt(options.level) || 1
    this.setData({
      currentLevel: level
    })

    this.initGame()
  },

  onUnload() {
    this.clearTimers()
  },

  onHide() {
    if (this.data.gameState === 'playing') {
      this.pauseGame()
    }
  },

  onShow() {
    if (this.data.gameState === 'paused') {
      this.resumeGame()
    }
  },

  // 初始化游戏
  initGame() {
    // 创建游戏管理器
    this.gameManager = new GameManager()
    this.matchEngine = new MatchEngine(this.gameManager)
    
    // 绑定事件
    this.gameManager.triggerEvent = this.handleGameEvent.bind(this)
    
    // 初始化关卡
    this.gameManager.initGame(this.data.currentLevel)
    
    // 获取用户道具
    const userPowerups = app.globalData.userGameData.powerups || {}
    
    this.setData({
      score: this.gameManager.score,
      timeLeft: this.gameManager.timeLeft,
      gameBlocks: this.gameManager.gameArea.blocks,
      powerups: userPowerups,
      gameState: 'playing',
      reviveUsed: 0,
      canRevive: true
    })

    this.startGameTimer()
    this.updateWaterQuality()
  },

  // 开始游戏计时器
  startGameTimer() {
    this.gameTimer = setInterval(() => {
      if (this.data.gameState === 'playing') {
        this.gameManager.update(1) // 每秒更新
        this.setData({
          timeLeft: this.gameManager.timeLeft,
          score: this.gameManager.score,
          gameBlocks: this.gameManager.gameArea.blocks
        })
        
        this.updateWaterQuality()
        this.updateCooldown()
      }
    }, 1000)
  },

  // 清除计时器
  clearTimers() {
    if (this.gameTimer) {
      clearInterval(this.gameTimer)
      this.gameTimer = null
    }
    if (this.cooldownTimer) {
      clearInterval(this.cooldownTimer)
      this.cooldownTimer = null
    }
  },

  // 处理游戏事件
  handleGameEvent(eventName, data) {
    switch(eventName) {
      case 'showReviveModal':
        this.setData({
          showGameOverModal: true,
          canRevive: this.data.reviveUsed < this.data.maxRevive,
          gameOverReason: data.reason === 'timeout' ? '时间不够了！' : '污染物堆积到顶部！'
        })
        break
      case 'gameEnd':
        this.endGame(false)
        break
      case 'showWaterTest':
        this.setData({
          showWinModal: true,
          rewardCoins: Math.floor(this.data.score / 100)
        })
        break
    }
  },

  // 方块点击处理
  onBlockTap(e) {
    if (this.data.gameState !== 'playing') return
    
    const blockId = e.currentTarget.dataset.id
    this.matchEngine.handleBlockTap(blockId)
    
    // 更新界面
    this.setData({
      gameBlocks: this.gameManager.gameArea.blocks,
      score: this.gameManager.score
    })

    // 检查是否通关
    this.checkLevelComplete()
  },

  // 检查关卡完成
  checkLevelComplete() {
    if (this.gameManager.gameArea.blocks.length === 0) {
      this.gameManager.levelComplete()
    }
  },

  // 使用道具
  usePowerUp(e) {
    if (this.data.gameState !== 'playing') return
    
    const type = e.currentTarget.dataset.type
    const currentCount = this.data.powerups[type] || 0
    
    if (currentCount <= 0) {
      wx.showToast({
        title: '道具不足',
        icon: 'none'
      })
      return
    }

    // 使用道具效果
    this.applyPowerUpEffect(type)
    
    // 减少道具数量
    const newPowerups = {...this.data.powerups}
    newPowerups[type] = Math.max(0, newPowerups[type] - 1)
    
    this.setData({
      powerups: newPowerups
    })
    
    // 保存到全局数据
    app.globalData.userGameData.powerups = newPowerups
    app.saveGameData()
    
    wx.showToast({
      title: '道具使用成功！',
      icon: 'success'
    })
  },

  // 应用道具效果
  applyPowerUpEffect(type) {
    let blocksToRemove = []
    
    switch(type) {
      case 'pp':
        // PP棉：清除所有颗粒污染物
        blocksToRemove = this.data.gameBlocks.filter(block => block.type === 'particle')
        break
      case 'cto':
        // CTO：清除所有微生物污染
        blocksToRemove = this.data.gameBlocks.filter(block => block.type === 'microbe')
        break
      case 'ro':
        // RO膜：清除所有化学污染物
        blocksToRemove = this.data.gameBlocks.filter(block => block.type === 'chemical')
        break
    }
    
    // 执行消除动画和逻辑
    if (blocksToRemove.length > 0) {
      this.eliminateBlocks(blocksToRemove)
    }
  },

  // 消除方块
  eliminateBlocks(blocks) {
    // 先播放消除动画
    blocks.forEach(block => {
      block.eliminating = true
    })
    
    this.setData({
      gameBlocks: this.data.gameBlocks
    })
    
    // 延迟移除方块并计分
    setTimeout(() => {
      const remainingBlocks = this.data.gameBlocks.filter(block => 
        !blocks.some(removeBlock => removeBlock.id === block.id)
      )
      
      const scoreGain = blocks.length * 50
      
      this.setData({
        gameBlocks: remainingBlocks,
        score: this.data.score + scoreGain
      })
      
      this.gameManager.gameArea.blocks = remainingBlocks
      this.gameManager.score = this.data.score
      
      // 检查是否通关
      this.checkLevelComplete()
    }, 600)
  },

  // 暂停游戏
  onPauseGame() {
    if (this.data.gameState === 'playing') {
      this.setData({
        gameState: 'paused',
        showPauseModal: true
      })
    }
  },

  // 恢复游戏
  onResume() {
    this.setData({
      gameState: 'playing',
      showPauseModal: false
    })
  },

  // 显示智能控制
  onShowSmartModal() {
    this.setData({
      showSmartModal: true
    })
  },

  // 隐藏智能控制
  onHideSmartModal() {
    this.setData({
      showSmartModal: false
    })
  },

  // 强冲功能
  onStrongFlush() {
    if (this.data.strongFlushCooldown > 0) return
    
    // 随机清除一些污染物
    const blocksToRemove = this.data.gameBlocks
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(5, this.data.gameBlocks.length))
    
    this.eliminateBlocks(blocksToRemove)
    
    // 设置冷却时间
    this.setData({
      strongFlushCooldown: 30
    })
    
    wx.showToast({
      title: '强冲清洁完成！',
      icon: 'success'
    })
  },

  // 更新冷却时间
  updateCooldown() {
    if (this.data.strongFlushCooldown > 0) {
      this.setData({
        strongFlushCooldown: this.data.strongFlushCooldown - 1
      })
    }
  },

  // 更新水质状态
  updateWaterQuality() {
    const pollutionLevel = this.data.gameBlocks.length
    let quality, qualityText
    
    if (pollutionLevel <= 10) {
      quality = 'excellent'
      qualityText = '优秀'
    } else if (pollutionLevel <= 25) {
      quality = 'good'
      qualityText = '良好'
    } else if (pollutionLevel <= 40) {
      quality = 'average'
      qualityText = '一般'
    } else {
      quality = 'poor'
      qualityText = '差'
    }
    
    this.setData({
      waterQuality: quality,
      waterQualityText: qualityText
    })
  },

  // 看广告复活
  onReviveByAd() {
    // 创建激励视频广告
    const videoAd = wx.createRewardedVideoAd({
      adUnitId: 'adunit-revive-ad' // 需要替换为真实广告ID
    })
    
    videoAd.onLoad(() => {
      console.log('复活广告加载成功')
    })
    
    videoAd.onError((err) => {
      console.log('复活广告加载失败', err)
      wx.showToast({
        title: '广告暂时无法加载',
        icon: 'none'
      })
    })
    
    videoAd.onClose((res) => {
      if (res && res.isEnded) {
        this.executeRevive()
      } else {
        wx.showToast({
          title: '需要看完广告才能复活',
          icon: 'none'
        })
      }
    })
    
    videoAd.show().catch(() => {
      wx.showToast({
        title: '广告播放失败',
        icon: 'none'
      })
    })
  },

  // 分享复活
  onReviveByShare() {
    wx.shareAppMessage({
      title: '帮帮我！我在净水消消乐中遇到困难了',
      desc: '快来一起净化管道，保护家庭用水安全！',
      path: `/pages/game/game?level=${this.data.currentLevel}`,
      success: () => {
        this.executeRevive()
      },
      fail: () => {
        wx.showToast({
          title: '分享失败',
          icon: 'none'
        })
      }
    })
  },

  // 执行复活
  executeRevive() {
    this.setData({
      reviveUsed: this.data.reviveUsed + 1,
      gameState: 'playing',
      showGameOverModal: false,
      timeLeft: this.data.timeLeft + 10, // 增加10秒
      canRevive: this.data.reviveUsed + 1 < this.data.maxRevive
    })
    
    // 清除一些污染物
    const blocksToRemove = this.data.gameBlocks
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(8, this.data.gameBlocks.length))
    
    this.eliminateBlocks(blocksToRemove)
    
    wx.showToast({
      title: '复活成功！继续战斗！',
      icon: 'success'
    })
  },

  // 重新开始关卡
  onRestartLevel() {
    this.setData({
      showGameOverModal: false
    })
    this.clearTimers()
    this.initGame()
  },

  // 放弃游戏
  onGiveUp() {
    this.setData({
      showGameOverModal: false,
      showPauseModal: false
    })
    wx.navigateBack()
  },

  // 退出游戏
  onQuitGame() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出当前游戏吗？进度将不会保存。',
      success: (res) => {
        if (res.confirm) {
          this.onGiveUp()
        }
      }
    })
  },

  // 下一关
  onNextLevel() {
    this.setData({
      showWinModal: false,
      currentLevel: this.data.currentLevel + 1
    })
    this.clearTimers()
    this.initGame()
  },

  // 进入水质检测
  onWaterTest() {
    wx.navigateTo({
      url: '/pages/waterTest/waterTest'
    })
  },

  // 了解更多
  onLearnMore() {
    wx.showModal({
      title: '点点够净水器',
      content: '采用RO反渗透技术，有效去除管道污染物。980元使用2年，平均每天仅需1.3元。5G智能芯片，远程监控水质状态。',
      confirmText: '咨询购买',
      success: (res) => {
        if (res.confirm) {
          // 这里可以跳转到购买页面或联系客服
          wx.showToast({
            title: '客服微信：diandian-go',
            icon: 'none',
            duration: 3000
          })
        }
      }
    })
  },

  // 隐藏弹窗
  onHideGameOverModal() {
    // 点击遮罩不关闭游戏结束弹窗
  },

  onHideWinModal() {
    // 点击遮罩不关闭胜利弹窗  
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 空函数，用于阻止事件冒泡
  },

  // 显示道具使用提示
  showToolTip() {
    wx.showToast({
      title: '点击目标方块使用道具',
      icon: 'none'
    })
  },

  // 暂停游戏
  pauseGame() {
    this.setData({
      gameState: 'paused',
      showPauseModal: true
    })
  },

  // 继续游戏
  resumeGame() {
    this.setData({
      gameState: 'playing',
      showPauseModal: false
    })
  },

  // 重新开始游戏
  restartGame() {
    this.clearTimers()
    this.initGame()
    this.setData({
      showGameOverModal: false,
      showPauseModal: false
    })
  },

  // 看广告复活
  reviveByAd() {
    const videoAd = wx.createRewardedVideoAd({
      adUnitId: 'adunit-revive-video' // 替换为真实广告位ID
    })

    videoAd.onLoad(() => {
      console.log('复活广告加载成功')
    })

    videoAd.onError((err) => {
      console.log('复活广告加载失败', err)
      wx.showToast({
        title: '广告加载失败',
        icon: 'none'
      })
    })

    videoAd.onClose((res) => {
      if (res && res.isEnded) {
        this.executeRevive()
      } else {
        wx.showToast({
          title: '需要看完广告才能复活',
          icon: 'none'
        })
      }
    })

    videoAd.show().catch(() => {
      wx.showToast({
        title: '广告加载失败',
        icon: 'none'
      })
    })
  },

  // 分享复活
  reviveByShare() {
    wx.showShareMenu({
      withShareTicket: true,
      success: () => {
        wx.shareAppMessage({
          title: '我在《管道净化消消乐》中遇到难关，快来帮我一起净化水源吧！',
          desc: '点点够净水器，RO反渗透技术，980元用2年',
          path: `/pages/game/game?level=${this.data.currentLevel}`,
          imageUrl: '/assets/images/share_revive.png',
          success: () => {
            this.executeRevive()
          },
          fail: () => {
            wx.showToast({
              title: '分享失败',
              icon: 'none'
            })
          }
        })
      }
    })
  },

  // 执行复活
  executeRevive() {
    this.gameManager.revive()
    this.setData({
      reviveUsed: this.data.reviveUsed + 1,
      timeLeft: this.gameManager.timeLeft,
      gameBlocks: this.gameManager.gameArea.blocks,
      gameState: 'playing',
      showGameOverModal: false
    })

    wx.showToast({
      title: '复活成功！',
      icon: 'success'
    })
  },

  // 放弃游戏
  giveUpGame() {
    this.endGame(false)
  },

  // 结束游戏
  endGame(passed) {
    this.clearTimers()
    this.setData({
      gameState: 'gameOver',
      showGameOverModal: false,
      showWinModal: false
    })

    if (passed) {
      // 保存进度和奖励
      app.globalData.userGameData.coins += this.data.rewardCoins
      app.saveGameData()
    }

    // 返回主页
    setTimeout(() => {
      wx.navigateBack()
    }, 1000)
  },

  // 下一关
  nextLevel() {
    const nextLevel = this.data.currentLevel + 1
    this.setData({
      currentLevel: nextLevel,
      showWinModal: false
    })
    this.clearTimers()
    this.initGame()
  },

  // 开始水质检测
  startWaterTest() {
    wx.navigateTo({
      url: '/pages/waterTest/waterTest'
    })
  },

  // 显示智能控制面板
  showSmartPanel() {
    this.setData({
      showSmartModal: true
    })
  },

  // 隐藏智能控制面板
  hideSmartModal() {
    this.setData({
      showSmartModal: false
    })
  },

  // 触发强冲
  triggerStrongFlush() {
    if (this.data.strongFlushCooldown > 0) return

    // 清除一些污染物
    this.gameManager.clearSomeBlocks()
    this.setData({
      gameBlocks: this.gameManager.gameArea.blocks,
      strongFlushCooldown: 30 // 30秒冷却
    })

    // 启动冷却计时器
    this.cooldownTimer = setInterval(() => {
      if (this.data.strongFlushCooldown > 0) {
        this.setData({
          strongFlushCooldown: this.data.strongFlushCooldown - 1
        })
      } else {
        clearInterval(this.cooldownTimer)
        this.cooldownTimer = null
      }
    }, 1000)

    wx.showToast({
      title: '强冲模式启动！',
      icon: 'success'
    })
  },

  // 更新水质状态
  updateWaterQuality() {
    const blockCount = this.gameManager.gameArea.blocks.length
    const totalBlocks = 96 // 8x12
    const pollutionRate = blockCount / totalBlocks

    if (pollutionRate < 0.3) {
      this.setData({
        waterQuality: 'excellent',
        waterQualityText: '优秀'
      })
    } else if (pollutionRate < 0.6) {
      this.setData({
        waterQuality: 'good',
        waterQualityText: '良好'
      })
    } else {
      this.setData({
        waterQuality: 'poor',
        waterQualityText: '污染严重'
      })
    }
  },

  // 更新冷却时间
  updateCooldown() {
    // 在startGameTimer中已处理
  },

  // 格式化时间显示
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  },

  // 返回主页
  goBack() {
    if (this.data.gameState === 'playing') {
      wx.showModal({
        title: '确认离开',
        content: '游戏正在进行中，确认要离开吗？',
        success: (res) => {
          if (res.confirm) {
            wx.navigateBack()
          }
        }
      })
    } else {
      wx.navigateBack()
    }
  },

  // 阻止弹窗关闭
  preventClose() {
    // 阻止事件冒泡
  },

  // 隐藏弹窗
  hideGameOverModal() {
    // 不允许点击遮罩关闭游戏结束弹窗
  },

  hideWinModal() {
    // 不允许点击遮罩关闭胜利弹窗
  },

  hidePauseModal() {
    this.resumeGame()
  },

  // 分享配置
  onShareAppMessage() {
    return {
      title: `我正在挑战第${this.data.currentLevel}关！`,
      desc: '快来一起净化管道，保护家庭用水安全',
      path: `/pages/game/game?level=${this.data.currentLevel}`,
      imageUrl: '/assets/images/share_game.png'
    }
  }
})
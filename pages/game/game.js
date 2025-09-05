// pages/game/game.js
const app = getApp()
const GameManager = require('../../utils/GameManager.js')
const MatchEngine = require('../../utils/MatchEngine.js')

Page({
  data: {
    gameManager: null,
    matchEngine: null,
    gameStatus: 'ready', // ready, playing, paused, gameOver
    score: 0,
    timeLeft: 300,
    level: 1,
    lives: 3,
    blocks: [],
    selectedBlock: null,
    combo: 0,
    powerUps: {
      ppCotton: 0,
      ctoLaser: 0,
      roWave: 0
    }
  },

  onLoad(options) {
    this.initGame(options.level || 1)
  },

  initGame(level) {
    this.gameManager = new GameManager()
    this.matchEngine = new MatchEngine(this.gameManager)
    
    this.gameManager.initGame(level)
    
    this.setData({
      gameStatus: 'playing',
      score: this.gameManager.score,
      timeLeft: this.gameManager.timeLeft,
      level: this.gameManager.currentLevel,
      lives: this.gameManager.lives,
      blocks: this.gameManager.gameArea.blocks
    })
    
    this.startGameLoop()
  },

  startGameLoop() {
    // 优化游戏循环，减少不必要的setData调用
    this.gameTimer = setInterval(() => {
      if (this.data.gameStatus === 'playing') {
        this.gameManager.update(1);
        
        // 只有当数据真正发生变化时才更新UI
        const newData = {};
        let shouldUpdate = false;
        
        if (this.data.timeLeft !== this.gameManager.timeLeft) {
          newData.timeLeft = this.gameManager.timeLeft;
          shouldUpdate = true;
        }
        
        if (this.data.score !== this.gameManager.score) {
          newData.score = this.gameManager.score;
          shouldUpdate = true;
        }
        
        if (shouldUpdate) {
          this.setData(newData);
        }
      }
    }, 1000);
  },

  onBlockTap(e) {
    if (this.data.gameStatus !== 'playing') return;
    
    const blockId = e.currentTarget.dataset.id;
    this.matchEngine.handleBlockTap(blockId);
    
    // 优化：只更新发生变化的数据
    this.setData({
      score: this.gameManager.score,
      combo: this.matchEngine.combo
    });
  },

  usePPCottonBomb(e) {
    if (this.data.powerUps.ppCotton <= 0) {
      wx.showToast({
        title: '没有PP棉炸弹',
        icon: 'none'
      })
      return
    }
    
    // 使用PP棉炸弹逻辑
    this.setData({
      'powerUps.ppCotton': this.data.powerUps.ppCotton - 1
    })
    
    wx.showToast({
      title: '使用PP棉炸弹',
      icon: 'success'
    })
  },

  useCTOLaser(e) {
    if (this.data.powerUps.ctoLaser <= 0) {
      wx.showToast({
        title: '没有CTO激光',
        icon: 'none'
      })
      return
    }
    
    // 使用CTO激光逻辑
    this.setData({
      'powerUps.ctoLaser': this.data.powerUps.ctoLaser - 1
    })
    
    wx.showToast({
      title: '使用CTO激光',
      icon: 'success'
    })
  },

  useROWave(e) {
    if (this.data.powerUps.roWave <= 0) {
      wx.showToast({
        title: '没有RO清洁波',
        icon: 'none'
      })
      return
    }
    
    // 使用RO清洁波逻辑
    this.setData({
      'powerUps.roWave': this.data.powerUps.roWave - 1
    })
    
    wx.showToast({
      title: '使用RO清洁波',
      icon: 'success'
    })
  },

  pauseGame() {
    this.setData({
      gameStatus: 'paused'
    })
  },

  resumeGame() {
    this.setData({
      gameStatus: 'playing'
    })
  },

  restartGame() {
    this.initGame(this.data.level)
  },

  onShowSmartControl() {
    wx.navigateTo({
      url: '/pages/smartControl/smartControl'
    })
  },

  onShowWaterTest() {
    wx.navigateTo({
      url: '/pages/waterTest/waterTest'
    })
  },

  onGameOver() {
    this.setData({
      gameStatus: 'gameOver'
    })
    
    clearInterval(this.gameTimer)
    
    wx.showModal({
      title: '游戏结束',
      content: `最终得分: ${this.data.score}`,
      showCancel: true,
      cancelText: '返回首页',
      confirmText: '重新开始',
      success: (res) => {
        if (res.confirm) {
          this.restartGame()
        } else {
          wx.navigateBack()
        }
      }
    })
  },

  onUnload() {
    clearInterval(this.gameTimer)
  }
})
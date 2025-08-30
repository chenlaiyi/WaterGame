/**
 * 游戏核心管理器
 * 负责游戏状态管理、场景切换、分数计算等核心功能
 */
class GameManager {
  constructor() {
    this.gameState = 'menu' // menu, playing, paused, gameOver
    this.currentLevel = 1
    this.score = 0
    this.lives = 3
    this.timeLeft = 300 // 5分钟倒计时
    this.gameArea = {
      width: 8,
      height: 12,
      blocks: []
    }
    this.reviveUsed = 0
    this.maxRevive = 2
  }

  // 初始化游戏
  initGame(level = 1) {
    this.currentLevel = level
    this.score = 0
    this.lives = 3
    this.timeLeft = this.getLevelTimeLimit(level)
    this.reviveUsed = 0
    this.gameArea.blocks = this.generateInitialBlocks()
    this.gameState = 'playing'
  }

  // 获取关卡时间限制
  getLevelTimeLimit(level) {
    if (level <= 5) return 300 // 5分钟
    if (level <= 15) return 240 // 4分钟
    if (level <= 30) return 180 // 3分钟
    return 120 // 2分钟
  }

  // 生成初始污染物方块
  generateInitialBlocks() {
    const blocks = []
    const types = this.getAvailableBlockTypes()
    
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 8; col++) {
        const randomType = types[Math.floor(Math.random() * types.length)]
        blocks.push({
          id: `${row}-${col}`,
          type: randomType,
          row: row,
          col: col,
          falling: false
        })
      }
    }
    return blocks
  }

  // 根据关卡获取可用污染物类型
  getAvailableBlockTypes() {
    if (this.currentLevel <= 5) {
      return ['particle'] // 只有颗粒污染物
    } else if (this.currentLevel <= 15) {
      return ['particle', 'microbe'] // 颗粒 + 微生物
    } else {
      return ['particle', 'microbe', 'chemical'] // 全部类型
    }
  }

  // 更新游戏状态
  update(deltaTime) {
    if (this.gameState !== 'playing') return

    this.timeLeft -= deltaTime
    if (this.timeLeft <= 0) {
      this.gameOver('timeout')
    }

    // 检查污染物是否到达顶部
    if (this.checkPollutionReachTop()) {
      this.gameOver('pollution')
    }

    // 处理下落逻辑
    this.handleFallingBlocks()
  }

  // 检查污染物是否到达家庭入口
  checkPollutionReachTop() {
    return this.gameArea.blocks.some(block => block.row >= 11)
  }

  // 游戏结束
  gameOver(reason) {
    this.gameState = 'gameOver'
    if (this.reviveUsed < this.maxRevive) {
      // 显示复活选项
      this.showReviveOptions(reason)
    } else {
      // 直接结束游戏
      this.endGame()
    }
  }

  // 显示复活选项
  showReviveOptions(reason) {
    // 这里会触发UI显示复活弹窗
    wx.showModal({
      title: '污染物进入家庭！',
      content: `${reason === 'timeout' ? '时间不够了' : '污染物堆积到顶部'}，是否复活继续游戏？`,
      showCancel: true,
      cancelText: '放弃',
      confirmText: '复活',
      success: (res) => {
        if (res.confirm) {
          this.showReviveMethods()
        } else {
          this.endGame()
        }
      }
    })
  }

  // 显示复活方式
  showReviveMethods() {
    // 触发复活方式选择UI
    this.triggerEvent('showReviveModal')
  }

  // 执行复活
  revive() {
    this.reviveUsed++
    this.timeLeft += 10 // 增加10秒
    this.clearSomeBlocks() // 清除一些污染物
    this.gameState = 'playing'
  }

  // 清除一些污染物（复活时）
  clearSomeBlocks() {
    const blocksToRemove = Math.min(10, this.gameArea.blocks.length * 0.3)
    for (let i = 0; i < blocksToRemove; i++) {
      const randomIndex = Math.floor(Math.random() * this.gameArea.blocks.length)
      this.gameArea.blocks.splice(randomIndex, 1)
    }
  }

  // 结束游戏
  endGame() {
    // 保存分数和进度
    const app = getApp()
    app.globalData.userGameData.totalScore = Math.max(app.globalData.userGameData.totalScore, this.score)
    app.saveGameData()
    
    // 触发游戏结束事件
    this.triggerEvent('gameEnd', {
      score: this.score,
      level: this.currentLevel,
      passed: false
    })
  }

  // 通关成功
  levelComplete() {
    this.gameState = 'completed'
    const app = getApp()
    
    // 解锁下一关
    if (!app.globalData.userGameData.unlockedLevels.includes(this.currentLevel + 1)) {
      app.globalData.userGameData.unlockedLevels.push(this.currentLevel + 1)
    }
    
    // 更新分数
    app.globalData.userGameData.totalScore += this.score
    app.globalData.userGameData.coins += Math.floor(this.score / 100)
    app.saveGameData()

    // 触发水质检测小游戏
    this.triggerWaterTest()
  }

  // 触发水质检测
  triggerWaterTest() {
    this.triggerEvent('showWaterTest')
  }

  // 事件触发器（需要具体实现绑定到UI）
  triggerEvent(eventName, data = {}) {
    // 这里需要根据具体的UI框架实现事件触发
    console.log(`Event triggered: ${eventName}`, data)
  }
}

module.exports = GameManager
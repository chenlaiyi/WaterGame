// pages/waterTest/waterTest.js
const app = getApp()
const Logger = require('../../utils/Logger.js')

Page({
  data: {
    activeTest: 'tds', // 当前进行的测试类型
    testResults: {
      tds: { value: 0, quality: '', color: '' },
      chlorine: { bubbles: 0, quality: '' },
      ph: { value: 7, color: '' },
      minerals: { collected: 0, target: 10 },
      electrolysis: { stage: 0, progress: 0 }
    },
    testCompleted: {
      tds: false,
      chlorine: false,
      ph: false,
      minerals: false,
      electrolysis: false
    },
    showResult: false,
    rewardCoins: 0
  },

  onLoad() {
    Logger.info('水质检测页面加载')
    this.initTestData()
  },

  // 初始化测试数据
  initTestData() {
    this.setData({
      'testResults.tds.value': Math.floor(Math.random() * 300),
      'testResults.chlorine.bubbles': Math.floor(Math.random() * 10),
      'testResults.ph.value': (Math.random() * 14).toFixed(1),
      'testResults.minerals.target': 10 + Math.floor(Math.random() * 11)
    })
    
    this.evaluateTDS()
    this.evaluateChlorine()
    this.evaluatePH()
  },

  // TDS检测
  onTDSStart() {
    wx.showLoading({ title: '检测中...' })
    
    // 模拟检测过程
    setTimeout(() => {
      wx.hideLoading()
      
      const tdsValue = 50 + Math.floor(Math.random() * 200)
      this.setData({
        'testResults.tds.value': tdsValue
      })
      
      this.evaluateTDS()
      this.completeTest('tds')
    }, 2000)
  },

  // 评估TDS值
  evaluateTDS() {
    const tdsValue = this.data.testResults.tds.value
    let quality = ''
    let color = ''
    
    if (tdsValue < 50) {
      quality = '优秀'
      color = '#4CAF50'
    } else if (tdsValue < 100) {
      quality = '良好'
      color = '#FF9800'
    } else {
      quality = '一般'
      color = '#F44336'
    }
    
    this.setData({
      'testResults.tds.quality': quality,
      'testResults.tds.color': color
    })
  },

  // 余氯检测
  onChlorineAdd() {
    if (this.data.testResults.chlorine.bubbles >= 10) return
    
    const newBubbles = this.data.testResults.chlorine.bubbles + 1
    this.setData({
      'testResults.chlorine.bubbles': newBubbles
    })
    
    if (newBubbles >= 5) {
      this.evaluateChlorine()
      this.completeTest('chlorine')
    }
  },

  // 评估余氯
  evaluateChlorine() {
    const bubbles = this.data.testResults.chlorine.bubbles
    let quality = ''
    
    if (bubbles < 3) {
      quality = '余氯含量较低'
    } else if (bubbles < 7) {
      quality = '余氯含量适中'
    } else {
      quality = '余氯含量较高'
    }
    
    this.setData({
      'testResults.chlorine.quality': quality
    })
  },

  // PH检测
  onPHTest() {
    wx.showLoading({ title: '测试中...' })
    
    // 模拟测试过程
    setTimeout(() => {
      wx.hideLoading()
      
      const phValue = (6 + Math.random() * 2).toFixed(1)
      this.setData({
        'testResults.ph.value': phValue
      })
      
      this.evaluatePH()
      this.completeTest('ph')
    }, 1500)
  },

  // 评估PH值
  evaluatePH() {
    const phValue = parseFloat(this.data.testResults.ph.value)
    let color = ''
    
    if (phValue < 6.5) {
      color = '#F44336' // 酸性
    } else if (phValue > 8.5) {
      color = '#2196F3' // 碱性
    } else {
      color = '#4CAF50' // 正常
    }
    
    this.setData({
      'testResults.ph.color': color
    })
  },

  // 矿物质收集
  onCollectMineral() {
    if (this.data.testResults.minerals.collected >= this.data.testResults.minerals.target) return
    
    const newCollected = this.data.testResults.minerals.collected + 1
    this.setData({
      'testResults.minerals.collected': newCollected
    })
    
    if (newCollected >= this.data.testResults.minerals.target) {
      this.completeTest('minerals')
    }
  },

  // 电解实验
  onElectrolysisStart() {
    wx.showLoading({ title: '实验进行中...' })
    
    // 模拟实验过程
    let stage = 0
    const interval = setInterval(() => {
      stage++
      const progress = Math.min(100, stage * 20)
      
      this.setData({
        'testResults.electrolysis.stage': stage,
        'testResults.electrolysis.progress': progress
      })
      
      if (stage >= 5) {
        clearInterval(interval)
        wx.hideLoading()
        this.completeTest('electrolysis')
      }
    }, 1000)
  },

  // 完成测试
  completeTest(testType) {
    this.setData({
      [`testCompleted.${testType}`]: true
    })
    
    // 检查是否所有测试都已完成
    const allCompleted = Object.values(this.data.testCompleted).every(completed => completed)
    if (allCompleted) {
      this.onAllTestsCompleted()
    }
  },

  // 所有测试完成
  onAllTestsCompleted() {
    // 计算奖励
    const rewardCoins = 50 + Math.floor(Math.random() * 101) // 50-150 coins
    
    this.setData({
      showResult: true,
      rewardCoins: rewardCoins
    })
    
    // 发放奖励
    app.globalData.userGameData.coins += rewardCoins
    app.saveGameData()
    
    wx.showToast({
      title: `获得${rewardCoins}金币`,
      icon: 'success'
    })
  },

  // 切换测试类型
  onTestChange(e) {
    const testType = e.currentTarget.dataset.test
    this.setData({
      activeTest: testType
    })
  },

  // 返回游戏
  onBackToGame() {
    wx.navigateBack()
  },

  // 分享成绩
  onShareResults() {
    wx.shareAppMessage({
      title: '水质检测完成，快来查看我的检测结果！',
      path: '/pages/waterTest/waterTest'
    })
  }
})
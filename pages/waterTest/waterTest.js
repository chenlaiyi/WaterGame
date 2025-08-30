// pages/waterTest/waterTest.js
const app = getApp()

Page({
  data: {
    currentTest: '', // 当前选中的检测项目
    
    // 检测结果
    tdsResult: {
      value: 0,
      level: '',
      text: '未检测',
      description: '点击开始TDS检测'
    },
    chlorineResult: {
      value: 0,
      level: '',
      text: '未检测',
      description: '点击开始余氯检测',
      bubbles: []
    },
    phResult: {
      value: 7.0,
      level: '',
      text: '未检测',
      description: '点击开始pH检测',
      colorClass: 'neutral'
    },
    mineralResult: {
      level: '',
      text: '未检测',
      particles: [],
      composition: []
    },
    electrolysisResult: {
      level: '',
      text: '未检测',
      beforeClass: 'polluted',
      afterClass: 'clean',
      beforeDesc: '含有杂质',
      afterDesc: '清澈透明',
      conclusion: ''
    },
    
    // 检测状态
    tdsTestState: 'idle', // idle, testing, result
    chlorineTestState: 'idle',
    phTestState: 'idle',
    mineralTestState: 'idle',
    electrolysisTestState: 'idle',
    
    // pH刻度
    phScale: [
      { value: 1, color: '#f44336' },
      { value: 3, color: '#ff9800' },
      { value: 5, color: '#ffeb3b' },
      { value: 7, color: '#4caf50' },
      { value: 9, color: '#2196f3' },
      { value: 11, color: '#9c27b0' },
      { value: 13, color: '#e91e63' }
    ],
    
    // 综合报告
    allTestsCompleted: false,
    reportDate: '',
    overallGrade: {
      score: 0,
      grade: '',
      level: ''
    },
    recommendations: [],
  },

  onLoad() {
    this.initData()
  },

  // 初始化数据
  initData() {
    const now = new Date()
    const reportDate = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`
    
    this.setData({
      reportDate: reportDate
    })
  },

  // 返回上一页
  onBack() {
    wx.navigateBack()
  },

  // 选择检测项目
  onSelectTest(e) {
    const type = e.currentTarget.dataset.type
    this.setData({
      currentTest: type
    })
    
    // 播放选择音效
    if (app.globalData.gameSettings.sound) {
      wx.playBackgroundAudio({
        dataUrl: '/sounds/select.mp3'
      })
    }
  },

  // 开始TDS检测
  onStartTdsTest() {
    if (this.data.tdsTestState === 'testing') return
    
    this.setData({
      tdsTestState: 'testing'
    })
    
    // 模拟检测过程
    setTimeout(() => {
      const value = Math.floor(Math.random() * 400) + 50 // 50-450 ppm
      let level, text, description
      
      if (value <= 50) {
        level = 'excellent'
        text = '优秀'
        description = '纯净水级别，适合直接饮用'
      } else if (value <= 100) {
        level = 'good'
        text = '良好'
        description = '优质饮用水，符合国家标准'
      } else if (value <= 300) {
        level = 'average'
        text = '一般'
        description = '一般饮用水，建议净化处理'
      } else {
        level = 'poor'
        text = '较差'
        description = '需要净化处理后饮用'
      }
      
      this.setData({
        tdsTestState: 'result',
        'tdsResult.value': value,
        'tdsResult.level': level,
        'tdsResult.text': text,
        'tdsResult.description': description
      })
      
      this.checkAllTestsCompleted()
      
      wx.showToast({
        title: 'TDS检测完成',
        icon: 'success'
      })
    }, 2000)
  },

  // 开始余氯检测
  onStartChlorineTest() {
    if (this.data.chlorineTestState === 'testing') return
    
    this.setData({
      chlorineTestState: 'testing'
    })
    
    // 模拟检测过程
    setTimeout(() => {
      const value = (Math.random() * 2).toFixed(2) // 0-2 mg/L
      let level, text, description, bubbleCount
      
      if (value <= 0.3) {
        level = 'excellent'
        text = '优秀'
        description = '余氯含量适中，符合饮用标准'
        bubbleCount = 2
      } else if (value <= 0.8) {
        level = 'good'
        text = '良好'
        description = '余氯含量偏高，建议活性炭过滤'
        bubbleCount = 4
      } else if (value <= 1.5) {
        level = 'average'
        text = '一般'
        description = '余氯含量较高，影响口感和健康'
        bubbleCount = 6
      } else {
        level = 'poor'
        text = '较差'
        description = '余氯严重超标，必须净化处理'
        bubbleCount = 8
      }
      
      // 生成气泡
      const bubbles = []
      for (let i = 0; i < bubbleCount; i++) {
        bubbles.push(i)
      }
      
      this.setData({
        chlorineTestState: 'result',
        'chlorineResult.value': value,
        'chlorineResult.level': level,
        'chlorineResult.text': text,
        'chlorineResult.description': description,
        'chlorineResult.bubbles': bubbles
      })
      
      this.checkAllTestsCompleted()
      
      wx.showToast({
        title: '余氯检测完成',
        icon: 'success'
      })
    }, 2000)
  },

  // 开始pH检测
  onStartPhTest() {
    if (this.data.phTestState === 'testing') return
    
    this.setData({
      phTestState: 'testing'
    })
    
    // 模拟检测过程
    setTimeout(() => {
      const value = (Math.random() * 8 + 4).toFixed(1) // 4.0-12.0
      let level, text, description, colorClass
      
      if (value >= 6.5 && value <= 8.5) {
        level = 'excellent'
        text = '优秀'
        description = 'pH值适宜，符合饮用水标准'
        colorClass = 'neutral'
      } else if ((value >= 6.0 && value < 6.5) || (value > 8.5 && value <= 9.0)) {
        level = 'good'
        text = '良好'
        description = 'pH值轻微偏离，基本符合标准'
        colorClass = value < 7 ? 'acidic' : 'alkaline'
      } else if ((value >= 5.5 && value < 6.0) || (value > 9.0 && value <= 10.0)) {
        level = 'average'
        text = '一般'
        description = 'pH值偏离较多，建议调节'
        colorClass = value < 7 ? 'acidic' : 'alkaline'
      } else {
        level = 'poor'
        text = '较差'
        description = 'pH值严重偏离，需要处理'
        colorClass = value < 7 ? 'acidic' : 'alkaline'
      }
      
      this.setData({
        phTestState: 'result',
        'phResult.value': value,
        'phResult.level': level,
        'phResult.text': text,
        'phResult.description': description,
        'phResult.colorClass': colorClass
      })
      
      this.checkAllTestsCompleted()
      
      wx.showToast({
        title: 'pH检测完成',
        icon: 'success'
      })
    }, 2000)
  },

  // 开始矿物质检测
  onStartMineralTest() {
    if (this.data.mineralTestState === 'testing') return
    
    this.setData({
      mineralTestState: 'testing'
    })
    
    // 模拟检测过程
    setTimeout(() => {
      // 生成矿物质颗粒
      const particles = []
      const mineralTypes = [
        { type: 'calcium', symbol: 'Ca²⁺' },
        { type: 'magnesium', symbol: 'Mg²⁺' },
        { type: 'iron', symbol: 'Fe³⁺' },
        { type: 'zinc', symbol: 'Zn²⁺' }
      ]
      
      for (let i = 0; i < 15; i++) {
        const mineralType = mineralTypes[Math.floor(Math.random() * mineralTypes.length)]
        particles.push({
          id: i,
          type: mineralType.type,
          symbol: mineralType.symbol,
          x: Math.random() * 80 + 10,
          y: Math.random() * 60 + 20
        })
      }
      
      // 生成矿物质组成
      const composition = [
        {
          name: '钙离子',
          percentage: Math.random() * 40 + 20,
          value: (Math.random() * 50 + 10).toFixed(1) + ' mg/L'
        },
        {
          name: '镁离子',
          percentage: Math.random() * 30 + 15,
          value: (Math.random() * 30 + 5).toFixed(1) + ' mg/L'
        },
        {
          name: '钾离子',
          percentage: Math.random() * 20 + 5,
          value: (Math.random() * 10 + 2).toFixed(1) + ' mg/L'
        },
        {
          name: '其他',
          percentage: Math.random() * 15 + 5,
          value: (Math.random() * 5 + 1).toFixed(1) + ' mg/L'
        }
      ]
      
      // 计算综合等级
      const totalMinerals = composition.reduce((sum, item) => sum + item.percentage, 0)
      let level, text
      
      if (totalMinerals >= 60 && totalMinerals <= 100) {
        level = 'excellent'
        text = '优秀'
      } else if (totalMinerals >= 40) {
        level = 'good'
        text = '良好'
      } else if (totalMinerals >= 20) {
        level = 'average'
        text = '一般'
      } else {
        level = 'poor'
        text = '较差'
      }
      
      this.setData({
        mineralTestState: 'result',
        'mineralResult.level': level,
        'mineralResult.text': text,
        'mineralResult.particles': particles,
        'mineralResult.composition': composition
      })
      
      this.checkAllTestsCompleted()
      
      wx.showToast({
        title: '矿物质检测完成',
        icon: 'success'
      })
    }, 3000)
  },

  // 开始电解实验
  onStartElectrolysis() {
    if (this.data.electrolysisTestState === 'testing') return
    
    this.setData({
      electrolysisTestState: 'testing'
    })
    
    // 模拟电解过程
    setTimeout(() => {
      const beforeColor = Math.random() > 0.3 ? 'dirty' : 'polluted'
      const afterColor = 'clean'
      
      let level, text, conclusion
      
      if (beforeColor === 'dirty') {
        level = 'poor'
        text = '差异明显'
        conclusion = '净化前水质较差，净化后显著改善，建议安装净水器'
      } else {
        level = 'average'
        text = '有改善'
        conclusion = '净化前有轻度污染，净化后得到改善'
      }
      
      this.setData({
        electrolysisTestState: 'result',
        'electrolysisResult.level': level,
        'electrolysisResult.text': text,
        'electrolysisResult.beforeClass': beforeColor,
        'electrolysisResult.afterClass': afterColor,
        'electrolysisResult.conclusion': conclusion
      })
      
      this.checkAllTestsCompleted()
      
      wx.showToast({
        title: '电解实验完成',
        icon: 'success'
      })
    }, 3000)
  },

  // 检查是否所有检测都完成
  checkAllTestsCompleted() {
    const completedTests = [
      this.data.tdsTestState === 'result',
      this.data.chlorineTestState === 'result',
      this.data.phTestState === 'result',
      this.data.mineralTestState === 'result',
      this.data.electrolysisTestState === 'result'
    ]
    
    if (completedTests.every(test => test)) {
      this.generateReport()
    }
  },

  // 生成综合报告
  generateReport() {
    // 计算综合得分
    const scores = {
      excellent: 100,
      good: 80,
      average: 60,
      poor: 40
    }
    
    const testResults = [
      this.data.tdsResult.level,
      this.data.chlorineResult.level,
      this.data.phResult.level,
      this.data.mineralResult.level,
      this.data.electrolysisResult.level
    ]
    
    const totalScore = testResults.reduce((sum, level) => sum + (scores[level] || 0), 0)
    const averageScore = Math.round(totalScore / testResults.length)
    
    let grade, level
    if (averageScore >= 90) {
      grade = 'A+'
      level = 'excellent'
    } else if (averageScore >= 80) {
      grade = 'A'
      level = 'good'
    } else if (averageScore >= 70) {
      grade = 'B'
      level = 'average'
    } else {
      grade = 'C'
      level = 'poor'
    }
    
    // 生成建议
    const recommendations = []
    
    if (this.data.tdsResult.level === 'poor') {
      recommendations.push('安装RO反渗透净水器去除溶解杂质')
    }
    if (this.data.chlorineResult.level === 'poor' || this.data.chlorineResult.level === 'average') {
      recommendations.push('使用活性炭滤芯去除余氯')
    }
    if (this.data.phResult.level === 'poor') {
      recommendations.push('调节水质pH值至适宜范围')
    }
    if (this.data.mineralResult.level === 'poor') {
      recommendations.push('保留有益矿物质，去除有害重金属')
    }
    
    if (recommendations.length === 0) {
      recommendations.push('水质状况良好，建议定期检测')
    }
    
    this.setData({
      allTestsCompleted: true,
      overallGrade: {
        score: averageScore,
        grade: grade,
        level: level
      },
      recommendations: recommendations
    })
    
    // 保存到用户数据
    if (!app.globalData.userGameData.waterTestReports) {
      app.globalData.userGameData.waterTestReports = []
    }
    
    app.globalData.userGameData.waterTestReports.push({
      date: this.data.reportDate,
      score: averageScore,
      grade: grade,
      results: {
        tds: this.data.tdsResult,
        chlorine: this.data.chlorineResult,
        ph: this.data.phResult,
        mineral: this.data.mineralResult,
        electrolysis: this.data.electrolysisResult
      }
    })
    
    app.saveGameData()
  },

  // 保存报告
  onSaveReport() {
    wx.showModal({
      title: '报告已保存',
      content: '水质检测报告已保存到您的账户中，您可以在个人中心查看历史报告。',
      showCancel: false,
      confirmText: '知道了'
    })
  },

  // 联系客服
  onContactService() {
    wx.showModal({
      title: '咨询净水器',
      content: '专业客服为您推荐最适合的净水解决方案\n\n客服微信：diandian-go\n客服电话：400-123-4567',
      confirmText: '复制微信',
      cancelText: '拨打电话',
      success: (res) => {
        if (res.confirm) {
          wx.setClipboardData({
            data: 'diandian-go',
            success: () => {
              wx.showToast({
                title: '微信号已复制',
                icon: 'success'
              })
            }
          })
        } else if (res.cancel) {
          wx.makePhoneCall({
            phoneNumber: '400-123-4567'
          })
        }
      }
    })
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: '我刚完成了水质检测，快来看看你家的水质如何！',
      desc: '了解家庭用水安全，学习净水知识',
      path: '/pages/waterTest/waterTest',
      imageUrl: '/images/water_test_share.png'
    }
  }
})

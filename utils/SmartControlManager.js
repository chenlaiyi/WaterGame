/**
 * 5G智能控制管理器
 * 模拟点点够净水器的5G远程控制功能
 */
class SmartControlManager {
  constructor() {
    this.deviceInfo = {
      id: 'DDG_' + Math.random().toString(36).substr(2, 9),
      name: '点点够净水器',
      model: 'DDG-RO-980',
      version: '2.1.0',
      connected: true,
      lastHeartbeat: Date.now()
    }

    this.waterQuality = {
      tds: 45,
      ph: 7.2,
      chlorine: 0.02,
      temperature: 23,
      flow: 1.8,
      pressure: 0.25,
      quality: 'excellent'
    }

    this.filterStatus = {
      pp: { life: 85, needReplace: false, workDays: 45 },
      cto: { life: 70, needReplace: false, workDays: 120 },
      ro: { life: 90, needReplace: false, workDays: 180 }
    }

    this.deviceStatus = {
      power: true,
      working: false,
      strongFlush: false,
      autoMode: true,
      nightMode: false,
      childLock: false
    }

    this.statistics = {
      totalFiltered: 1250,
      todayUsage: 25,
      monthlyUsage: 680,
      energySaved: 45,
      co2Reduced: 12
    }

    this.alerts = []
    this.operationHistory = []

    this.initializeSmartFeatures()
  }

  // 初始化智能功能
  initializeSmartFeatures() {
    this.startHeartbeat()
    this.startQualityMonitoring()
    this.loadHistoryData()
  }

  // 开始心跳检测
  startHeartbeat() {
    setInterval(() => {
      this.deviceInfo.lastHeartbeat = Date.now()
      this.updateConnectionStatus()
    }, 30000)
  }

  // 更新连接状态
  updateConnectionStatus() {
    const timeSinceLastHeartbeat = Date.now() - this.deviceInfo.lastHeartbeat
    this.deviceInfo.connected = timeSinceLastHeartbeat < 60000
  }

  // 开始水质监测
  startQualityMonitoring() {
    setInterval(() => {
      this.updateWaterQuality()
      this.checkAlerts()
    }, 10000)
  }

  // 更新水质数据
  updateWaterQuality() {
    const baseTargetTDS = 20 + (100 - this.filterStatus.ro.life) * 0.3
    this.waterQuality.tds = Math.max(15, baseTargetTDS + (Math.random() - 0.5) * 10)
    this.waterQuality.ph = 7.0 + (Math.random() - 0.5) * 0.6
    this.waterQuality.chlorine = Math.max(0, 0.05 - this.filterStatus.cto.life * 0.0006)
    this.waterQuality.temperature = 20 + Math.random() * 8
    
    if (this.deviceStatus.working) {
      this.waterQuality.flow = 1.5 + Math.random() * 0.6
    } else {
      this.waterQuality.flow = 0
    }
    
    this.waterQuality.pressure = 0.2 + Math.random() * 0.1
    this.updateQualityGrade()
  }

  // 更新水质评级
  updateQualityGrade() {
    let score = 100
    
    if (this.waterQuality.tds > 50) score -= 20
    else if (this.waterQuality.tds > 30) score -= 10
    
    if (this.waterQuality.ph < 6.5 || this.waterQuality.ph > 8.5) score -= 15
    if (this.waterQuality.chlorine > 0.05) score -= 10
    
    if (score >= 90) this.waterQuality.quality = 'excellent'
    else if (score >= 75) this.waterQuality.quality = 'good'
    else if (score >= 60) this.waterQuality.quality = 'fair'
    else this.waterQuality.quality = 'poor'
  }

  // 检查告警
  checkAlerts() {
    const now = Date.now()
    
    Object.keys(this.filterStatus).forEach(filterType => {
      const filter = this.filterStatus[filterType]
      if (filter.life <= 10 && !filter.needReplace) {
        filter.needReplace = true
        this.addAlert({
          type: 'filter_replace',
          level: 'high',
          message: `${filterType.toUpperCase()}滤芯寿命不足10%，请及时更换`,
          timestamp: now
        })
      }
    })

    if (this.waterQuality.quality === 'poor') {
      this.addAlert({
        type: 'water_quality',
        level: 'medium',
        message: '检测到水质异常，建议检查滤芯状态',
        timestamp: now
      })
    }
  }

  // 添加告警
  addAlert(alert) {
    const existingAlert = this.alerts.find(a => 
      a.type === alert.type && 
      Math.abs(a.timestamp - alert.timestamp) < 300000
    )
    
    if (!existingAlert) {
      this.alerts.unshift(alert)
      if (this.alerts.length > 20) {
        this.alerts = this.alerts.slice(0, 20)
      }
    }
  }

  // 远程开关机
  async togglePower() {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.deviceStatus.power = !this.deviceStatus.power
        this.addOperationHistory('power', this.deviceStatus.power ? '开机' : '关机')
        
        if (!this.deviceStatus.power) {
          this.deviceStatus.working = false
          this.deviceStatus.strongFlush = false
        }
        
        resolve({
          success: true,
          status: this.deviceStatus.power,
          message: this.deviceStatus.power ? '设备已开机' : '设备已关机'
        })
      }, 1000)
    })
  }

  // 启动强冲功能
  async startStrongFlush() {
    if (!this.deviceStatus.power) {
      return { success: false, message: '设备未开机' }
    }
    
    return new Promise((resolve) => {
      this.deviceStatus.strongFlush = true
      this.deviceStatus.working = true
      this.addOperationHistory('strongFlush', '启动强冲')
      
      setTimeout(() => {
        this.deviceStatus.strongFlush = false
        this.deviceStatus.working = false
        this.addOperationHistory('strongFlush', '强冲完成')
        
        Object.keys(this.filterStatus).forEach(key => {
          this.filterStatus[key].life = Math.max(0, this.filterStatus[key].life - 0.5)
        })
        
        resolve({
          success: true,
          message: '强冲完成，系统已自动清洁'
        })
      }, 30000)
    })
  }

  // 获取设备状态
  getDeviceStatus() {
    return {
      device: this.deviceInfo,
      waterQuality: this.waterQuality,
      filters: this.filterStatus,
      status: this.deviceStatus,
      statistics: this.statistics,
      alerts: this.alerts.slice(0, 5),
      lastUpdate: Date.now()
    }
  }

  // 添加操作历史
  addOperationHistory(type, description) {
    this.operationHistory.unshift({
      id: Date.now(),
      type: type,
      description: description,
      timestamp: Date.now(),
      user: 'remote'
    })
    
    if (this.operationHistory.length > 50) {
      this.operationHistory = this.operationHistory.slice(0, 50)
    }
  }

  // 加载历史数据
  loadHistoryData() {
    try {
      const savedData = wx.getStorageSync('smartControlData')
      if (savedData) {
        this.statistics = { ...this.statistics, ...savedData.statistics }
        this.operationHistory = savedData.operationHistory || []
      }
    } catch (error) {
      console.log('加载智能控制数据失败:', error)
    }
  }

  // 保存数据
  saveData() {
    try {
      wx.setStorageSync('smartControlData', {
        statistics: this.statistics,
        operationHistory: this.operationHistory
      })
    } catch (error) {
      console.log('保存智能控制数据失败:', error)
    }
  }

  // 游戏中展示智能控制界面
  showSmartControlUI() {
    return {
      title: '5G智能控制',
      deviceStatus: this.getDeviceStatus(),
      controls: [
        {
          id: 'power',
          name: '电源开关',
          type: 'toggle',
          value: this.deviceStatus.power,
          action: 'togglePower'
        },
        {
          id: 'strongFlush',
          name: '强冲清洁',
          type: 'button',
          enabled: this.deviceStatus.power && !this.deviceStatus.strongFlush,
          action: 'startStrongFlush'
        }
      ],
      waterQualityDisplay: {
        tds: { value: this.waterQuality.tds, unit: 'ppm', status: this.getQualityStatus(this.waterQuality.tds, 'tds') },
        ph: { value: this.waterQuality.ph.toFixed(1), unit: '', status: this.getQualityStatus(this.waterQuality.ph, 'ph') },
        temperature: { value: this.waterQuality.temperature.toFixed(1), unit: '°C', status: 'normal' },
        flow: { value: this.waterQuality.flow.toFixed(1), unit: 'L/min', status: 'normal' }
      }
    }
  }

  // 获取水质参数状态
  getQualityStatus(value, type) {
    switch(type) {
      case 'tds':
        if (value <= 30) return 'excellent'
        if (value <= 50) return 'good'
        if (value <= 100) return 'fair'
        return 'poor'
        
      case 'ph':
        if (value >= 6.5 && value <= 8.5) return 'excellent'
        if (value >= 6.0 && value <= 9.0) return 'good'
        return 'poor'
        
      default:
        return 'normal'
    }
  }
}

module.exports = SmartControlManager
const logger = require('./Logger.js');

class SmartControlManager {
  constructor() {
    this.deviceStatus = {
      power: false,
      mode: 'normal', // normal, flush, sleep
      tds: 50,
      temperature: 25,
      filterLife: 80, // 滤芯寿命百分比
      wifi: true,
      lastUpdate: new Date()
    };
    
    this.modes = {
      normal: { name: '正常模式', power: 100 },
      flush: { name: '冲洗模式', power: 150 },
      sleep: { name: '休眠模式', power: 10 }
    };
  }

  // 获取设备状态
  getDeviceStatus() {
    return { ...this.deviceStatus };
  }

  // 开关机
  togglePower() {
    this.deviceStatus.power = !this.deviceStatus.power;
    this.deviceStatus.lastUpdate = new Date();
    this.simulateTDSChange();
    return this.deviceStatus.power;
  }

  // 切换模式
  switchMode(mode) {
    if (this.modes[mode]) {
      this.deviceStatus.mode = mode;
      this.deviceStatus.lastUpdate = new Date();
      this.simulateTDSChange();
      return true;
    }
    return false;
  }

  // 获取模式列表
  getModes() {
    return this.modes;
  }

  // 强冲功能
  startFlushing() {
    const originalMode = this.deviceStatus.mode;
    this.deviceStatus.mode = 'flush';
    this.deviceStatus.lastUpdate = new Date();
    
    // 模拟冲洗过程
    setTimeout(() => {
      // 冲洗完成后恢复原模式
      this.deviceStatus.mode = originalMode;
      this.deviceStatus.filterLife = Math.min(100, this.deviceStatus.filterLife + 5);
      this.deviceStatus.tds = Math.max(0, this.deviceStatus.tds - 10);
      this.deviceStatus.lastUpdate = new Date();
      
      wx.showToast({
        title: '冲洗完成',
        icon: 'success'
      });
    }, 3000);
    
    return true;
  }

  // 模拟TDS变化
  simulateTDSChange() {
    // 根据设备状态模拟TDS变化
    if (this.deviceStatus.power) {
      if (this.deviceStatus.mode === 'flush') {
        this.deviceStatus.tds = Math.max(0, this.deviceStatus.tds - 2);
      } else if (this.deviceStatus.mode === 'normal') {
        // 正常模式下缓慢变化
        this.deviceStatus.tds = Math.max(0, this.deviceStatus.tds - Math.random() * 0.5);
      }
    }
    
    // 模拟滤芯老化
    if (this.deviceStatus.power && this.deviceStatus.mode !== 'sleep') {
      this.deviceStatus.filterLife = Math.max(0, this.deviceStatus.filterLife - 0.01);
    }
    
    this.deviceStatus.lastUpdate = new Date();
  }

  // 获取水质报告
  getWaterQualityReport() {
    const status = this.getDeviceStatus();
    const quality = status.tds < 50 ? '优秀' : status.tds < 100 ? '良好' : '一般';
    
    return {
      tds: status.tds,
      temperature: status.temperature,
      quality: quality,
      filterLife: status.filterLife,
      recommendation: this.getRecommendation(status)
    };
  }

  // 获取建议
  getRecommendation(status) {
    const recommendations = [];
    
    if (status.tds > 100) {
      recommendations.push('建议立即更换滤芯');
    } else if (status.tds > 50) {
      recommendations.push('水质一般，建议检查滤芯');
    }
    
    if (status.filterLife < 20) {
      recommendations.push('滤芯寿命不足20%，建议准备更换');
    } else if (status.filterLife < 50) {
      recommendations.push('滤芯寿命已过半，请关注');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('设备运行正常，水质优秀');
    }
    
    return recommendations;
  }

  // 模拟设备数据更新
  updateDeviceData() {
    // 定期更新设备数据
    setInterval(() => {
      this.simulateTDSChange();
    }, 30000); // 每30秒更新一次
  }
}

module.exports = SmartControlManager;
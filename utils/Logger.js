/**
 * 游戏日志记录工具类
 * 提供统一的日志记录和错误处理功能
 */
class Logger {
  constructor() {
    this.logLevel = this.getLogLevel();
  }

  /**
   * 获取日志级别
   * @returns {string} 日志级别 (debug, info, warn, error)
   */
  getLogLevel() {
    // 在生产环境中默认为warn级别
    // 在开发环境中默认为debug级别
    return __DEV__ ? 'debug' : 'warn';
  }

  /**
   * 记录调试日志
   * @param {string} message - 日志消息
   * @param {object} data - 附加数据
   */
  debug(message, data = null) {
    if (this.shouldLog('debug')) {
      console.debug(`[DEBUG] ${message}`, data);
      this.writeToLog('debug', message, data);
    }
  }

  info(message, data = null) {
    if (this.shouldLog('info')) {
      console.info(`[INFO] ${message}`, data);
      this.writeToLog('info', message, data);
    }
  }

  warn(message, data = null) {
    if (this.shouldLog('warn')) {
      console.warn(`[WARN] ${message}`, data);
      this.writeToLog('warn', message, data);
    }
  }

  error(message, error = null, data = null) {
    if (this.shouldLog('error')) {
      console.error(`[ERROR] ${message}`, error, data);
      this.writeToLog('error', message, { error, data });
      
      // 在生产环境中，将错误发送到服务器
      if (!__DEV__) {
        this.sendErrorToServer(message, error, data);
      }
    }
  }

  shouldLog(level) {
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const targetLevelIndex = levels.indexOf(level);
    
    return targetLevelIndex >= currentLevelIndex;
  }

  writeToLog(level, message, data) {
    try {
      // 获取当前时间
      const timestamp = new Date().toISOString();
      
      // 构造日志条目
      const logEntry = {
        timestamp,
        level,
        message,
        data,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        url: typeof window !== 'undefined' ? window.location.href : ''
      };
      
      // 在微信小程序环境中，使用本地存储
      if (typeof wx !== 'undefined') {
        // 获取现有的日志
        const existingLogs = wx.getStorageSync('game_logs') || [];
        
        // 添加新日志
        existingLogs.push(logEntry);
        
        // 只保留最近的100条日志
        if (existingLogs.length > 100) {
          existingLogs.splice(0, existingLogs.length - 100);
        }
        
        // 保存日志
        wx.setStorageSync('game_logs', existingLogs);
      }
    } catch (e) {
      // 忽略日志记录错误，避免影响主流程
      console.warn('Failed to write log to storage', e);
    }
  }

  sendErrorToServer(message, error, data) {
    try {
      // 构造错误报告
      const errorReport = {
        timestamp: new Date().toISOString(),
        message,
        error: error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : null,
        data,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        url: typeof window !== 'undefined' ? window.location.href : '',
        appVersion: typeof getApp !== 'undefined' ? (getApp().globalData ? getApp().globalData.version : '') : ''
      };
      
      // 发送到服务器（需要实现具体的API端点）
      if (typeof wx !== 'undefined') {
        wx.request({
          url: 'https://your-domain.com/api/game/v1/logs/error',
          method: 'POST',
          data: errorReport,
          header: {
            'content-type': 'application/json'
          },
          success: () => {
            // 发送成功，清除本地存储的错误日志
            this.clearErrorLogs();
          },
          fail: (err) => {
            console.warn('Failed to send error report to server', err);
          }
        });
      }
    } catch (e) {
      console.warn('Failed to send error to server', e);
    }
  }

  clearErrorLogs() {
    try {
      if (typeof wx !== 'undefined') {
        wx.removeStorageSync('game_logs');
      }
    } catch (e) {
      console.warn('Failed to clear error logs', e);
    }
  }

  getLocalLogs() {
    try {
      if (typeof wx !== 'undefined') {
        return wx.getStorageSync('game_logs') || [];
      }
      return [];
    } catch (e) {
      console.warn('Failed to get local logs', e);
      return [];
    }
  }
}

// 创建单例实例
const logger = new Logger();

// 导出单例实例
module.exports = logger;
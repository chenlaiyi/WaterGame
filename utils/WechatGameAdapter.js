const logger = require('./Logger.js');

class WechatGameAdapter {
  constructor() {
    this.systemInfo = null;
    this.userInfo = null;
    this.adapters = {
      share: this.initShareAdapter(),
      ad: this.initAdAdapter(),
      cloud: this.initCloudAdapter()
    };
  }

  // 初始化分享适配器
  initShareAdapter() {
    // 设置全局分享参数
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
    
    return {
      onShareAppMessage: (callback) => {
        wx.onShareAppMessage(callback);
      },
      
      shareAppMessage: (options) => {
        return wx.shareAppMessage(options);
      },
      
      updateShareMenu: (options) => {
        return wx.updateShareMenu(options);
      }
    };
  }

  // 初始化广告适配器
  initAdAdapter() {
    return {
      createRewardedVideoAd: (adUnitId) => {
        if (wx.createRewardedVideoAd) {
          return wx.createRewardedVideoAd({ adUnitId });
        }
        return null;
      },
      
      createInterstitialAd: (adUnitId) => {
        if (wx.createInterstitialAd) {
          return wx.createInterstitialAd({ adUnitId });
        }
        return null;
      }
    };
  }

  // 初始化云开发适配器
  initCloudAdapter() {
    let cloud = null;
    if (wx.cloud) {
      cloud = wx.cloud;
    }
    return cloud;
  }

  // 获取系统信息
  async getSystemInfo() {
    if (this.systemInfo) {
      return this.systemInfo;
    }
    
    try {
      const info = await new Promise((resolve, reject) => {
        wx.getSystemInfo({
          success: resolve,
          fail: reject
        });
      });
      
      this.systemInfo = info;
      return info;
    } catch (error) {
      logger.error('获取系统信息失败', error);
      return null;
    }
  }

  // 获取用户信息
  async getUserInfo() {
    if (this.userInfo) {
      return this.userInfo;
    }
    
    try {
      const settings = await new Promise((resolve, reject) => {
        wx.getSetting({
          success: resolve,
          fail: reject
        });
      });
      
      if (settings.authSetting['scope.userInfo']) {
        const info = await new Promise((resolve, reject) => {
          wx.getUserInfo({
            success: resolve,
            fail: reject
          });
        });
        
        this.userInfo = info.userInfo;
        return info.userInfo;
      }
    } catch (error) {
      logger.error('获取用户信息失败', error);
    }
    
    return null;
  }

  // 登录
  async login() {
    try {
      const loginResult = await new Promise((resolve, reject) => {
        wx.login({
          success: resolve,
          fail: reject
        });
      });
      
      return loginResult;
    } catch (error) {
      logger.error('微信登录失败', error);
      return null;
    }
  }

  // 支付
  async requestPayment(params) {
    try {
      const result = await new Promise((resolve, reject) => {
        wx.requestPayment({
          ...params,
          success: resolve,
          fail: reject
        });
      });
      
      return result;
    } catch (error) {
      logger.error('支付失败', error);
      return null;
    }
  }

  // 本地存储
  setStorage(key, data) {
    try {
      wx.setStorageSync(key, data);
      return true;
    } catch (error) {
      logger.error('本地存储失败', error);
      return false;
    }
  }

  getStorage(key) {
    try {
      return wx.getStorageSync(key);
    } catch (error) {
      logger.error('读取本地存储失败', error);
      return null;
    }
  }

  removeStorage(key) {
    try {
      wx.removeStorageSync(key);
      return true;
    } catch (error) {
      logger.error('删除本地存储失败', error);
      return false;
    }
  }

  // 网络请求
  async request(options) {
    try {
      const result = await new Promise((resolve, reject) => {
        wx.request({
          ...options,
          success: resolve,
          fail: reject
        });
      });
      
      return result;
    } catch (error) {
      logger.error('网络请求失败', error);
      return null;
    }
  }

  // 文件上传
  async uploadFile(options) {
    try {
      const result = await new Promise((resolve, reject) => {
        wx.uploadFile({
          ...options,
          success: resolve,
          fail: reject
        });
      });
      
      return result;
    } catch (error) {
      logger.error('文件上传失败', error);
      return null;
    }
  }

  // 获取授权信息
  async getAuthorization(scope) {
    try {
      const setting = await new Promise((resolve, reject) => {
        wx.getSetting({
          success: resolve,
          fail: reject
        });
      });
      
      return setting.authSetting[scope] || false;
    } catch (error) {
      logger.error('获取授权信息失败', error);
      return false;
    }
  }

  // 请求授权
  async requestAuthorization(scope) {
    try {
      const authResult = await new Promise((resolve, reject) => {
        wx.authorize({
          scope: scope,
          success: resolve,
          fail: reject
        });
      });
      
      return true;
    } catch (error) {
      // 用户拒绝授权，引导用户开启授权
      wx.showModal({
        title: '授权请求',
        content: '需要您授权相关权限才能使用此功能',
        success: (res) => {
          if (res.confirm) {
            wx.openSetting({
              success: (settingResult) => {
                return settingResult.authSetting[scope] || false;
              }
            });
          }
        }
      });
      
      return false;
    }
  }
}

module.exports = WechatGameAdapter;
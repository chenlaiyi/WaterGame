const logger = require('./Logger.js');

class ReviveRewardManager {
  constructor() {
    this.reviveCount = 0;
    this.maxRevives = 2;
    this.rewardMethods = {
      ad: { available: true, name: '看广告复活' },
      share: { available: true, name: '分享复活' }
    };
  }

  // 检查是否可以复活
  canRevive() {
    return this.reviveCount < this.maxRevives;
  }

  // 显示复活选项
  showReviveOptions() {
    return new Promise((resolve) => {
      wx.showModal({
        title: '游戏结束',
        content: '是否使用复活继续游戏？',
        showCancel: true,
        cancelText: '放弃',
        confirmText: '复活',
        success: (res) => {
          if (res.confirm && this.canRevive()) {
            this.showReviveMethods().then(method => {
              resolve(method);
            });
          } else {
            resolve(null);
          }
        }
      });
    });
  }

  // 显示复活方式
  showReviveMethods() {
    return new Promise((resolve) => {
      const items = [];
      if (this.rewardMethods.ad.available) {
        items.push(this.rewardMethods.ad.name);
      }
      if (this.rewardMethods.share.available) {
        items.push(this.rewardMethods.share.name);
      }

      wx.showActionSheet({
        itemList: items,
        success: (res) => {
          const selectedMethod = items[res.tapIndex];
          resolve(this.getMethodKey(selectedMethod));
        },
        fail: () => {
          resolve(null);
        }
      });
    });
  }

  // 获取方法键名
  getMethodKey(methodName) {
    for (const key in this.rewardMethods) {
      if (this.rewardMethods[key].name === methodName) {
        return key;
      }
    }
    return null;
  }

  // 执行复活
  async revive(method) {
    if (!this.canRevive()) {
      return false;
    }

    let success = false;
    switch (method) {
      case 'ad':
        success = await this.watchAd();
        break;
      case 'share':
        success = await this.shareGame();
        break;
    }

    if (success) {
      this.reviveCount++;
      return true;
    }

    return false;
  }

  // 观看广告复活
  watchAd() {
    return new Promise((resolve) => {
      // 模拟广告观看
      wx.showModal({
        title: '观看广告',
        content: '观看30秒广告获得复活机会',
        showCancel: true,
        success: (res) => {
          if (res.confirm) {
            // 模拟广告观看完成
            setTimeout(() => {
              wx.showToast({
                title: '复活成功',
                icon: 'success'
              });
              resolve(true);
            }, 1000);
          } else {
            resolve(false);
          }
        }
      });
    });
  }

  // 分享游戏复活
  shareGame() {
    return new Promise((resolve) => {
      // 模拟分享
      wx.showModal({
        title: '分享游戏',
        content: '分享到微信群或好友获得复活机会',
        showCancel: true,
        success: (res) => {
          if (res.confirm) {
            wx.showToast({
              title: '分享成功，复活中...',
              icon: 'success'
            });
            
            // 模拟分享完成
            setTimeout(() => {
              wx.showToast({
                title: '复活成功',
                icon: 'success'
              });
              resolve(true);
            }, 1500);
          } else {
            resolve(false);
          }
        }
      });
    });
  }

  // 重置复活次数
  resetReviveCount() {
    this.reviveCount = 0;
  }

  // 获取复活次数信息
  getReviveInfo() {
    return {
      used: this.reviveCount,
      max: this.maxRevives,
      remaining: this.maxRevives - this.reviveCount
    };
  }
}

module.exports = ReviveRewardManager;
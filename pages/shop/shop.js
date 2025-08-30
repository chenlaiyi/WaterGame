// pages/shop/shop.js
const app = getApp()

Page({
  data: {
    userCoins: 0,
    userPowerups: {},
    
    // 每日限制
    remainingAds: 5,
    remainingShares: 3,
    
    // 商品信息
    products: {
      pp: {
        name: 'PP棉炸弹',
        symbol: '🧽',
        price: 50,
        quantity: 1,
        maxQuantity: 10,
        discount: false
      },
      cto: {
        name: 'CTO激光',
        symbol: '⚡',
        price: 80,
        quantity: 1,
        maxQuantity: 10,
        recommended: true
      },
      ro: {
        name: 'RO清洁波',
        symbol: '🌊',
        price: 120,
        quantity: 1,
        maxQuantity: 10,
        premium: true
      }
    },
    
    // 套餐信息
    packages: {
      starter: {
        name: '新手套餐',
        price: 299,
        originalPrice: 480,
        items: {
          pp: 3,
          cto: 2,
          coins: 200
        }
      },
      advanced: {
        name: '进阶套餐',
        price: 799,
        originalPrice: 1200,
        items: {
          pp: 5,
          cto: 5,
          ro: 2,
          coins: 500
        }
      },
      master: {
        name: '大师套餐',
        price: 1599,
        originalPrice: 2500,
        items: {
          pp: 10,
          cto: 10,
          ro: 5,
          coins: 1000
        }
      }
    },
    
    // 金币套餐
    coinPackages: [
      { id: 'coin1', amount: 100, price: 6, bonus: 0 },
      { id: 'coin2', amount: 300, price: 18, bonus: 50 },
      { id: 'coin3', amount: 500, price: 30, bonus: 100 },
      { id: 'coin4', amount: 1000, price: 60, bonus: 300 },
      { id: 'coin5', amount: 2000, price: 120, bonus: 800 },
      { id: 'coin6', amount: 5000, price: 300, bonus: 2000 }
    ],
    
    // 购买弹窗
    showPurchaseModal: false,
    purchaseData: {}
  },

  onLoad() {
    this.initData()
  },

  onShow() {
    this.refreshData()
  },

  // 初始化数据
  initData() {
    this.refreshData()
    this.updateDailyLimits()
  },

  // 刷新数据
  refreshData() {
    const gameData = app.globalData.userGameData || {}
    
    this.setData({
      userCoins: gameData.coins || 0,
      userPowerups: gameData.powerups || {}
    })
  },

  // 更新每日限制
  updateDailyLimits() {
    const today = new Date().toDateString()
    const lastResetDate = wx.getStorageSync('lastShopLimitReset')
    
    if (lastResetDate !== today) {
      // 重置每日限制
      wx.setStorageSync('lastShopLimitReset', today)
      wx.setStorageSync('dailyShopAdsUsed', 0)
      wx.setStorageSync('dailyShopSharesUsed', 0)
      
      this.setData({
        remainingAds: 5,
        remainingShares: 3
      })
    } else {
      // 读取已使用次数
      const adsUsed = wx.getStorageSync('dailyShopAdsUsed') || 0
      const sharesUsed = wx.getStorageSync('dailyShopSharesUsed') || 0
      
      this.setData({
        remainingAds: Math.max(0, 5 - adsUsed),
        remainingShares: Math.max(0, 3 - sharesUsed)
      })
    }
  },

  // 看广告获得奖励
  onWatchAdForReward() {
    if (this.data.remainingAds <= 0) {
      wx.showToast({
        title: '今日次数已用完',
        icon: 'none'
      })
      return
    }

    // 创建激励视频广告
    const videoAd = wx.createRewardedVideoAd({
      adUnitId: 'adunit-shop-reward' // 需要替换为真实广告ID
    })

    videoAd.onLoad(() => {
      console.log('商城奖励广告加载成功')
    })

    videoAd.onError((err) => {
      console.log('商城奖励广告加载失败', err)
      wx.showToast({
        title: '广告暂时无法加载',
        icon: 'none'
      })
    })

    videoAd.onClose((res) => {
      if (res && res.isEnded) {
        this.giveAdReward()
      } else {
        wx.showToast({
          title: '需要看完广告才能获得奖励',
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

  // 给予广告奖励
  giveAdReward() {
    const rewards = ['pp', 'cto', 'ro']
    const randomReward = rewards[Math.floor(Math.random() * rewards.length)]
    const rewardNames = {
      pp: 'PP棉炸弹',
      cto: 'CTO激光',
      ro: 'RO清洁波'
    }
    
    // 增加道具
    if (!app.globalData.userGameData.powerups) {
      app.globalData.userGameData.powerups = {}
    }
    if (!app.globalData.userGameData.powerups[randomReward]) {
      app.globalData.userGameData.powerups[randomReward] = 0
    }
    app.globalData.userGameData.powerups[randomReward]++
    
    // 减少剩余次数
    const newRemainingAds = this.data.remainingAds - 1
    this.setData({ remainingAds: newRemainingAds })
    wx.setStorageSync('dailyShopAdsUsed', 5 - newRemainingAds)
    
    // 保存数据
    app.saveGameData()
    this.refreshData()
    
    wx.showToast({
      title: `获得${rewardNames[randomReward]}！`,
      icon: 'success'
    })
  },

  // 分享获得奖励
  onShareForReward() {
    if (this.data.remainingShares <= 0) {
      wx.showToast({
        title: '今日次数已用完',
        icon: 'none'
      })
      return
    }

    wx.shareAppMessage({
      title: '点点够净水消消乐道具商城 - 免费获取游戏道具',
      desc: '快来免费领取道具，助你轻松通关！',
      path: '/pages/shop/shop',
      success: () => {
        this.giveShareReward()
      },
      fail: () => {
        wx.showToast({
          title: '分享失败',
          icon: 'none'
        })
      }
    })
  },

  // 给予分享奖励
  giveShareReward() {
    // 给予金币奖励
    const coinReward = 50
    app.globalData.userGameData.coins += coinReward
    
    // 减少剩余次数
    const newRemainingShares = this.data.remainingShares - 1
    this.setData({ remainingShares: newRemainingShares })
    wx.setStorageSync('dailyShopSharesUsed', 3 - newRemainingShares)
    
    // 保存数据
    app.saveGameData()
    this.refreshData()
    
    wx.showToast({
      title: `获得${coinReward}金币！`,
      icon: 'success'
    })
  },

  // 数量变化
  onQuantityChange(e) {
    const { product, action } = e.currentTarget.dataset
    const currentQuantity = this.data.products[product].quantity
    const maxQuantity = this.data.products[product].maxQuantity
    
    let newQuantity = currentQuantity
    
    if (action === 'increase' && currentQuantity < maxQuantity) {
      newQuantity = currentQuantity + 1
    } else if (action === 'decrease' && currentQuantity > 1) {
      newQuantity = currentQuantity - 1
    }
    
    if (newQuantity !== currentQuantity) {
      this.setData({
        [`products.${product}.quantity`]: newQuantity
      })
    }
  },

  // 购买商品
  onBuyProduct(e) {
    const productType = e.currentTarget.dataset.product
    const product = this.data.products[productType]
    
    if (!product) return
    
    const totalPrice = product.price * product.quantity
    
    // 设置购买数据
    this.setData({
      showPurchaseModal: true,
      purchaseData: {
        type: productType,
        name: product.name,
        symbol: product.symbol,
        quantity: product.quantity,
        unitPrice: product.price,
        totalPrice: totalPrice
      }
    })
  },

  // 确认购买
  onConfirmPurchase() {
    const { type, quantity, totalPrice } = this.data.purchaseData
    
    if (this.data.userCoins < totalPrice) {
      wx.showToast({
        title: '金币不足',
        icon: 'none'
      })
      return
    }
    
    // 扣除金币
    app.globalData.userGameData.coins -= totalPrice
    
    // 增加道具
    if (!app.globalData.userGameData.powerups) {
      app.globalData.userGameData.powerups = {}
    }
    if (!app.globalData.userGameData.powerups[type]) {
      app.globalData.userGameData.powerups[type] = 0
    }
    app.globalData.userGameData.powerups[type] += quantity
    
    // 保存数据
    app.saveGameData()
    this.refreshData()
    
    // 重置商品数量
    this.setData({
      [`products.${type}.quantity`]: 1,
      showPurchaseModal: false
    })
    
    wx.showToast({
      title: '购买成功！',
      icon: 'success'
    })
  },

  // 购买套餐
  onBuyPackage(e) {
    const packageType = e.currentTarget.dataset.package
    const packageData = this.data.packages[packageType]
    
    if (!packageData) return
    
    if (this.data.userCoins < packageData.price) {
      wx.showModal({
        title: '金币不足',
        content: `购买${packageData.name}需要💰${packageData.price}，您当前有💰${this.data.userCoins}。是否前往充值？`,
        confirmText: '去充值',
        success: (res) => {
          if (res.confirm) {
            // 滚动到金币充值区域
            wx.pageScrollTo({
              selector: '.coins-section',
              duration: 300
            })
          }
        }
      })
      return
    }
    
    wx.showModal({
      title: '确认购买',
      content: `确定要购买${packageData.name}吗？\n价格：💰${packageData.price}（原价💰${packageData.originalPrice}）`,
      success: (res) => {
        if (res.confirm) {
          // 扣除金币
          app.globalData.userGameData.coins -= packageData.price
          
          // 增加道具和金币
          if (!app.globalData.userGameData.powerups) {
            app.globalData.userGameData.powerups = {}
          }
          
          Object.keys(packageData.items).forEach(itemType => {
            if (itemType === 'coins') {
              app.globalData.userGameData.coins += packageData.items[itemType]
            } else {
              if (!app.globalData.userGameData.powerups[itemType]) {
                app.globalData.userGameData.powerups[itemType] = 0
              }
              app.globalData.userGameData.powerups[itemType] += packageData.items[itemType]
            }
          })
          
          // 保存数据
          app.saveGameData()
          this.refreshData()
          
          wx.showToast({
            title: `${packageData.name}购买成功！`,
            icon: 'success'
          })
        }
      }
    })
  },

  // 购买金币
  onBuyCoins(e) {
    const coinPackage = e.currentTarget.dataset.package
    
    if (!coinPackage) return
    
    wx.showModal({
      title: '充值确认',
      content: `确定要充值💰${coinPackage.amount}${coinPackage.bonus ? '+' + coinPackage.bonus : ''}金币吗？\n价格：¥${coinPackage.price}`,
      success: (res) => {
        if (res.confirm) {
          // 这里应该调用微信支付接口
          // 模拟支付成功
          this.mockPaymentSuccess(coinPackage)
        }
      }
    })
  },

  // 模拟支付成功
  mockPaymentSuccess(coinPackage) {
    const totalCoins = coinPackage.amount + (coinPackage.bonus || 0)
    
    // 增加金币
    app.globalData.userGameData.coins += totalCoins
    
    // 保存数据
    app.saveGameData()
    this.refreshData()
    
    wx.showModal({
      title: '充值成功',
      content: `成功充值💰${totalCoins}金币！`,
      showCancel: false,
      confirmText: '确定'
    })
  },

  // 隐藏购买弹窗
  onHidePurchaseModal() {
    this.setData({
      showPurchaseModal: false
    })
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 空函数，用于阻止事件冒泡
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: '点点够净水消消乐道具商城 - 免费获取游戏道具',
      desc: '快来免费领取道具，助你轻松通关！',
      path: '/pages/shop/shop',
      imageUrl: '/images/shop_share.png'
    }
  }
})

// pages/shop/shop.js
const app = getApp()
const Logger = require('../../utils/Logger.js')
const BrandMarketingManager = require('../../utils/BrandMarketingManager.js')

Page({
  data: {
    activeTab: 'products', // products, coupons, knowledge
    products: [],
    coupons: [],
    knowledge: [],
    userInfo: null
  },

  onLoad() {
    Logger.info('商城页面加载')
    this.brandManager = new BrandMarketingManager()
    this.initPageData()
  },

  // 初始化页面数据
  initPageData() {
    this.setData({
      userInfo: app.globalData.userInfo,
      products: this.getProducts(),
      coupons: this.getCoupons(),
      knowledge: this.brandManager.getWaterKnowledge()
    })
  },

  // 获取产品列表
  getProducts() {
    return [
      {
        id: 1,
        name: '点点够RO反渗透净水器',
        price: 980,
        originalPrice: 1280,
        image: '/images/products/product1.jpg',
        description: '五级精滤，智能监控，静音设计',
        features: ['RO反渗透技术', '智能滤芯提醒', '静音设计'],
        sales: 1280,
        tags: ['热销', '智能']
      },
      {
        id: 2,
        name: 'PP棉滤芯（3支装）',
        price: 89,
        originalPrice: 120,
        image: '/images/products/product2.jpg',
        description: '适用于点点够系列净水器',
        features: ['高品质', '长寿命', '易更换'],
        sales: 860,
        tags: ['配件']
      },
      {
        id: 3,
        name: 'CTO活性炭滤芯',
        price: 128,
        originalPrice: 168,
        image: '/images/products/product3.jpg',
        description: '高效吸附余氯和异味',
        features: ['优质椰壳炭', '深层吸附', '改善口感'],
        sales: 540,
        tags: ['配件']
      },
      {
        id: 4,
        name: 'RO反渗透滤芯',
        price: 299,
        originalPrice: 399,
        image: '/images/products/product4.jpg',
        description: '核心过滤部件，品质保证',
        features: ['高脱盐率', '长寿命', '易更换'],
        sales: 320,
        tags: ['核心', '热销']
      }
    ]
  },

  // 获取优惠券列表
  getCoupons() {
    return [
      {
        id: 1,
        name: '新人专享券',
        discount: 100,
        condition: '满500元可用',
        validity: '2025-12-31',
        type: '新人券'
      },
      {
        id: 2,
        name: '满减优惠券',
        discount: 50,
        condition: '满300元可用',
        validity: '2025-11-30',
        type: '满减券'
      },
      {
        id: 3,
        name: '配件专享券',
        discount: 30,
        condition: '购买滤芯配件可用',
        validity: '2025-10-31',
        type: '配件券'
      }
    ]
  },

  // 切换标签页
  onTabChange(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({
      activeTab: tab
    })
  },

  // 查看产品详情
  onViewProduct(e) {
    const product = e.currentTarget.dataset.product
    wx.showModal({
      title: product.name,
      content: `价格: ¥${product.price}\n原价: ¥${product.originalPrice}\n\n${product.description}\n\n特点:\n${product.features.join('\n')}`,
      confirmText: '立即购买',
      cancelText: '再看看',
      success: (res) => {
        if (res.confirm) {
          this.onPurchaseProduct(product)
        }
      }
    })
  },

  // 购买产品
  onPurchaseProduct(product) {
    wx.showModal({
      title: '购买确认',
      content: `确定要购买 ${product.name} 吗？\n价格: ¥${product.price}`,
      confirmText: '确认购买',
      success: (res) => {
        if (res.confirm) {
          // 模拟购买流程
          wx.showLoading({ title: '处理中...' })
          
          setTimeout(() => {
            wx.hideLoading()
            wx.showToast({
              title: '购买成功',
              icon: 'success'
            })
            
            // 更新用户金币
            app.globalData.userGameData.coins -= product.price
            app.saveGameData()
          }, 1500)
        }
      }
    })
  },

  // 领取优惠券
  onClaimCoupon(e) {
    const coupon = e.currentTarget.dataset.coupon
    wx.showToast({
      title: `领取成功\n${coupon.name}`,
      icon: 'success'
    })
  },

  // 查看知识详情
  onViewKnowledge(e) {
    const knowledge = e.currentTarget.dataset.knowledge
    wx.showModal({
      title: knowledge.title,
      content: knowledge.content,
      showCancel: false
    })
  },

  // 分享产品
  onShareProduct(e) {
    const product = e.currentTarget.dataset.product
    wx.shareAppMessage({
      title: `推荐好物：${product.name}`,
      desc: product.description,
      path: '/pages/shop/shop'
    })
  },

  // 联系客服
  onContactSupport() {
    wx.showModal({
      title: '联系客服',
      content: '客服热线: 400-123-4567\n服务时间: 9:00-21:00',
      confirmText: '拨打',
      success: (res) => {
        if (res.confirm) {
          wx.makePhoneCall({
            phoneNumber: '400-123-4567'
          })
        }
      }
    })
  },

  // 查看品牌故事
  onViewBrandStory() {
    this.brandManager.showBrandStory()
  },

  // 查看产品优势
  onViewProductFeatures() {
    this.brandManager.showProductFeatures()
  },

  // 查看成本对比
  onViewCostComparison() {
    this.brandManager.showCostComparison()
  }
})
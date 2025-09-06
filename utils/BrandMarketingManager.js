const logger = require('./Logger.js');

class BrandMarketingManager {
  constructor() {
    this.brandInfo = {
      name: '点点够',
      slogan: '让每一滴水都纯净',
      description: '专注净水领域，为您提供安全、健康、便捷的净水解决方案',
      features: [
        {
          title: 'RO反渗透技术',
          description: '有效去除水中99%以上的细菌、病毒、重金属等有害物质'
        },
        {
          title: '980元2年',
          description: '超高性价比，两年仅需980元，平均每天1.34元'
        },
        {
          title: '5G智能控制',
          description: '实时监控水质，远程控制设备，智能提醒滤芯更换'
        }
      ]
    };
    
    this.productInfo = {
      modelName: 'DDG-RO501',
      price: 980,
      servicePeriod: '2年',
      highlights: [
        'RO反渗透技术，过滤精度0.0001微米',
        '五级精滤，层层保障水质安全',
        '智能滤芯提醒，及时更换不担心',
        '静音设计，工作噪音低于40分贝',
        '节能环保，制水率高达50%以上'
      ]
    };
    
    this.waterKnowledge = [
      {
        title: '管道二次污染',
        content: '自来水在输送过程中，由于管道老化、水箱二次供水等原因，容易产生二次污染，影响水质安全。'
      },
      {
        title: '净水器必要性',
        content: '安装净水器可以有效去除水中的余氯、细菌、重金属等有害物质，保障家庭饮水安全。'
      },
      {
        title: 'TDS值含义',
        content: 'TDS（Total Dissolved Solids）表示水中溶解性总固体含量，数值越低表示水质越纯净。'
      },
      {
        title: '滤芯更换',
        content: '不同类型的滤芯有不同的使用寿命，及时更换滤芯是保证净水效果的关键。'
      }
    ];
    
    this.costComparison = {
      bottledWater: {
        name: '瓶装水',
        annualCost: 1800, // 按每天1.5L，每瓶2元计算
        disadvantages: ['塑料污染', '运输不便', '成本高昂']
      },
      traditional: {
        name: '传统净水器',
        annualCost: 600, // 滤芯更换费用
        disadvantages: ['缺乏智能监控', '滤芯更换不及时', '维护复杂']
      },
      ddg: {
        name: '点点够净水器',
        annualCost: 490, // 980元2年
        advantages: ['智能监控', '滤芯智能提醒', '高性价比', '专业服务']
      }
    };
  }

  // 获取品牌信息
  getBrandInfo() {
    return { ...this.brandInfo };
  }

  // 获取产品信息
  getProductInfo() {
    return { ...this.productInfo };
  }

  // 获取水质知识
  getWaterKnowledge() {
    return [...this.waterKnowledge];
  }

  // 获取指定ID的水质知识
  getWaterKnowledgeById(id) {
    return this.waterKnowledge[id] || null;
  }

  // 获取成本对比信息
  getCostComparison() {
    return { ...this.costComparison };
  }

  // 显示品牌故事弹窗
  showBrandStory() {
    const brandInfo = this.getBrandInfo();
    
    wx.showModal({
      title: brandInfo.name,
      content: `${brandInfo.slogan}\n\n${brandInfo.description}`,
      showCancel: false,
      confirmText: '了解更多'
    });
  }

  // 显示产品优势
  showProductFeatures() {
    const productInfo = this.getProductInfo();
    const features = productInfo.highlights.join('\n');
    
    wx.showModal({
      title: `${productInfo.modelName} 产品优势`,
      content: features,
      showCancel: false
    });
  }

  // 显示成本对比
  showCostComparison() {
    const comparison = this.getCostComparison();
    const content = `
${comparison.bottledWater.name}: 年费用${comparison.bottledWater.annualCost}元
劣势: ${comparison.bottledWater.disadvantages.join(', ')}

${comparison.traditional.name}: 年费用${comparison.traditional.annualCost}元
劣势: ${comparison.traditional.disadvantages.join(', ')}

${comparison.ddg.name}: 年费用${comparison.ddg.annualCost}元
优势: ${comparison.ddg.advantages.join(', ')}
    `;
    
    wx.showModal({
      title: '成本对比分析',
      content: content,
      showCancel: false
    });
  }

  // 显示水质知识
  showWaterKnowledge() {
    const knowledgeList = this.getWaterKnowledge();
    const items = knowledgeList.map(item => item.title);
    
    wx.showActionSheet({
      itemList: items,
      success: (res) => {
        const selectedKnowledge = knowledgeList[res.tapIndex];
        wx.showModal({
          title: selectedKnowledge.title,
          content: selectedKnowledge.content,
          showCancel: false
        });
      }
    });
  }

  // 记录品牌曝光
  trackBrandExposure(event) {
    try {
      // 记录品牌曝光事件
      logger.info('品牌曝光', { event });
      
      // 这里可以集成微信统计或其他分析工具
      if (wx.reportAnalytics) {
        wx.reportAnalytics('brand_exposure', {
          event: event,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      logger.error('记录品牌曝光失败', error);
    }
  }

  // 记录用户互动
  trackUserInteraction(action) {
    try {
      // 记录用户互动事件
      logger.info('用户互动', { action });
      
      // 这里可以集成微信统计或其他分析工具
      if (wx.reportAnalytics) {
        wx.reportAnalytics('user_interaction', {
          action: action,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      logger.error('记录用户互动失败', error);
    }
  }

  // 获取营销活动信息
  getMarketingCampaigns() {
    // 当前可参与的营销活动
    return [
      {
        id: 'new_user_discount',
        title: '新用户专享',
        description: '首次购买立减100元',
        valid: true
      },
      {
        id: 'refer_friend',
        title: '推荐有礼',
        description: '推荐好友购买双方各得50元优惠券',
        valid: true
      }
    ];
  }

  // 分享营销内容
  shareMarketingContent() {
    const brandInfo = this.getBrandInfo();
    
    wx.shareAppMessage({
      title: `${brandInfo.name} - ${brandInfo.slogan}`,
      desc: brandInfo.description,
      path: '/pages/index/index'
    });
  }
}

module.exports = BrandMarketingManager;
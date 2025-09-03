/**
 * 品牌营销管理器
 * 处理品牌宣传、用户教育、营销功能
 */
class BrandMarketingManager {
  constructor() {
    this.brandInfo = {
      name: '点点够',
      slogan: 'RO反渗透 · 980元用2年',
      coreValues: ['健康', '经济', '智能', '环保'],
      productHighlights: [
        { title: 'RO反渗透技术', desc: '0.0001微米精密过滤，去除99.9%有害物质' },
        { title: '超值性价比', desc: '980元即可享受2年纯净好水' },
        { title: '5G智能控制', desc: '远程监控，实时掌握水质状况' },
        { title: '三级精密过滤', desc: 'PP棉+CTO活性炭+RO膜组合过滤' }
      ]
    }

    this.educationContent = {
      waterKnowledge: [
        {
          id: 'knowledge_001',
          title: '你知道吗？自来水的二次污染',
          content: '虽然自来水厂出水符合饮用标准，但在输送到家庭的管道过程中，容易受到管道老化、二次供水设施污染等影响，产生铁锈、细菌等有害物质。',
          icon: '💧',
          category: '水质安全'
        },
        {
          id: 'knowledge_002', 
          title: 'TDS值越低越好吗？',
          content: 'TDS代表总溶解固体，包括有害物质和有益矿物质。理想的饮用水TDS应在30-150之间，既去除了有害物质，又保留了人体所需的矿物质。',
          icon: '🔬',
          category: '检测知识'
        },
        {
          id: 'knowledge_003',
          title: 'RO反渗透技术原理',
          content: 'RO膜孔径仅0.0001微米，相当于头发丝的百万分之一，能有效去除细菌、病毒、重金属、农药残留等有害物质，是目前最先进的净水技术。',
          icon: '⚗️',
          category: '技术原理'
        }
      ],
      tips: [
        '每天喝8杯纯净水，健康生活从点点够开始',
        '定期检测水质，关爱家人健康',
        '选择净水器，就是选择家庭健康保障',
        '智能提醒换芯，让净水更省心',
        '环保从我做起，拒绝塑料瓶装水'
      ]
    }

    this.marketingCampaigns = {
      welcomeGift: {
        title: '新用户专享',
        description: '注册即送100金币+3个道具',
        rewards: { coins: 100, powerups: { pp_cotton: 1, cto_laser: 1, ro_wave: 1 } },
        claimed: false
      },
      shareReward: {
        title: '分享有礼',
        description: '每日分享获得额外奖励',
        dailyLimit: 3,
        rewards: { coins: 20, powerups: 1 }
      },
      levelReward: {
        title: '通关奖励',
        description: '每通过5关解锁品牌知识+丰厚奖励',
        milestones: [5, 10, 15, 20, 25, 30]
      }
    }

    this.userEngagement = {
      visitDays: 0,
      totalPlayTime: 0,
      knowledgeUnlocked: [],
      achievementsEarned: [],
      brandInteractions: 0
    }

    this.loadUserData()
  }

  // 加载用户数据
  loadUserData() {
    try {
      const savedData = wx.getStorageSync('brandMarketingData')
      if (savedData) {
        this.userEngagement = { ...this.userEngagement, ...savedData }
      }
    } catch (error) {
      console.log('加载品牌营销数据失败:', error)
    }
  }

  // 保存用户数据
  saveUserData() {
    try {
      wx.setStorageSync('brandMarketingData', this.userEngagement)
    } catch (error) {
      console.log('保存品牌营销数据失败:', error)
    }
  }

  // 展示品牌介绍
  showBrandIntroduction() {
    return {
      title: '认识点点够净水器',
      content: {
        brand: this.brandInfo,
        introduction: `${this.brandInfo.name}专注于为中国家庭提供安全、经济、智能的净水解决方案。`,
        advantages: [
          '🔬 RO反渗透技术：去除99.9%有害物质',
          '💰 超值性价比：980元享受2年纯净好水',  
          '📱 5G智能控制：随时随地掌控水质',
          '🌱 环保节能：减少塑料瓶装水消耗',
          '🛡️ 品质保障：专业团队7x24服务'
        ],
        callToAction: '了解更多产品信息'
      }
    }
  }

  // 获取每日知识
  getDailyKnowledge() {
    const today = new Date().getDate()
    const knowledgeIndex = today % this.educationContent.waterKnowledge.length
    const knowledge = this.educationContent.waterKnowledge[knowledgeIndex]
    
    if (!this.userEngagement.knowledgeUnlocked.includes(knowledge.id)) {
      this.userEngagement.knowledgeUnlocked.push(knowledge.id)
      this.saveUserData()
    }
    
    return knowledge
  }

  // 获取通关知识奖励
  getLevelKnowledge(level) {
    const milestoneIndex = this.marketingCampaigns.levelReward.milestones.findIndex(m => m === level)
    if (milestoneIndex !== -1 && milestoneIndex < this.educationContent.waterKnowledge.length) {
      const knowledge = this.educationContent.waterKnowledge[milestoneIndex]
      
      if (!this.userEngagement.knowledgeUnlocked.includes(knowledge.id)) {
        this.userEngagement.knowledgeUnlocked.push(knowledge.id)
        this.saveUserData()
        
        return {
          unlocked: true,
          knowledge: knowledge,
          reward: { coins: 50, achievement: `水质专家 Level ${milestoneIndex + 1}` }
        }
      }
    }
    
    return { unlocked: false }
  }

  // 处理分享奖励
  handleShareReward() {
    const today = new Date().toDateString()
    const shareKey = `share_${today}`
    
    try {
      const todayShares = wx.getStorageSync(shareKey) || 0
      
      if (todayShares < this.marketingCampaigns.shareReward.dailyLimit) {
        wx.setStorageSync(shareKey, todayShares + 1)
        
        return {
          success: true,
          reward: this.marketingCampaigns.shareReward.rewards,
          remaining: this.marketingCampaigns.shareReward.dailyLimit - todayShares - 1,
          message: '分享成功！获得奖励'
        }
      } else {
        return {
          success: false,
          message: '今日分享次数已达上限',
          nextResetTime: '明日重置'
        }
      }
    } catch (error) {
      return { success: false, message: '分享失败，请重试' }
    }
  }

  // 显示产品对比
  showProductComparison() {
    return {
      title: '为什么选择点点够？',
      comparison: {
        traditional: {
          name: '传统净水方式',
          items: [
            { feature: '过滤精度', value: '粗过滤', status: 'poor' },
            { feature: '使用成本', value: '持续购买滤芯', status: 'poor' },
            { feature: '智能功能', value: '无', status: 'poor' }
          ]
        },
        diandougou: {
          name: '点点够净水器',
          items: [
            { feature: '过滤精度', value: '0.0001微米RO膜', status: 'excellent' },
            { feature: '使用成本', value: '980元用2年', status: 'excellent' },
            { feature: '智能功能', value: '5G远程控制', status: 'excellent' }
          ]
        }
      },
      highlights: [
        '💧 每杯水成本仅0.13元，比瓶装水便宜90%',
        '🏆 RO反渗透技术，NASA同款过滤标准',
        '📱 手机一键控制，科技改变生活',
        '🌍 年均减少1200个塑料瓶，守护地球'
      ]
    }
  }

  // 记录品牌互动
  recordBrandInteraction(type) {
    this.userEngagement.brandInteractions++
    this.userEngagement.lastInteraction = {
      type: type,
      timestamp: Date.now()
    }
    this.saveUserData()
  }

  // 获取品牌营销统计
  getMarketingStats() {
    return {
      totalInteractions: this.userEngagement.brandInteractions,
      knowledgeProgress: {
        unlocked: this.userEngagement.knowledgeUnlocked.length,
        total: this.educationContent.waterKnowledge.length,
        percentage: Math.round((this.userEngagement.knowledgeUnlocked.length / this.educationContent.waterKnowledge.length) * 100)
      },
      achievements: this.userEngagement.achievementsEarned,
      playTime: this.userEngagement.totalPlayTime,
      visitDays: this.userEngagement.visitDays
    }
  }
}

module.exports = BrandMarketingManager
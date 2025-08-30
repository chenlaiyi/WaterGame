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
        },
        {
          id: 'knowledge_004',
          title: '家庭净水器的必要性',
          content: '即使是达标的自来水，经过长距离管道输送后，也可能产生二次污染。家庭终端净水器是保障饮水安全的最后一道防线。',
          icon: '🏠',
          category: '健康意识'
        },
        {
          id: 'knowledge_005',
          title: '滤芯更换的重要性',
          content: '滤芯是净水器的核心，定期更换能确保过滤效果。PP棉过滤大颗粒，CTO去除异味余氯，RO膜去除细微污染物，三级过滤缺一不可。',
          icon: '🔄',
          category: '维护保养'
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
        introduction: `${this.brandInfo.name}专注于为中国家庭提供安全、经济、智能的净水解决方案。我们深知中国家庭对水质安全的需求，特别是管道二次污染问题，因此采用先进的RO反渗透技术，确保每一滴水都达到直饮标准。`,
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
    
    // 记录知识解锁
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
      
      // 解锁特殊知识
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
            { feature: '智能功能', value: '无', status: 'poor' },
            { feature: '水质监测', value: '人工检测', status: 'poor' },
            { feature: '维护成本', value: '较高', status: 'poor' }
          ]
        },
        bottledWater: {
          name: '瓶装水',
          items: [
            { feature: '使用成本', value: '每月200-400元', status: 'poor' },
            { feature: '环保性', value: '塑料污染', status: 'poor' },
            { feature: '便利性', value: '需要搬运', status: 'poor' },
            { feature: '储存', value: '占用空间', status: 'poor' },
            { feature: '质量保证', value: '品牌差异大', status: 'fair' }
          ]
        },
        diandougou: {
          name: '点点够净水器',
          items: [
            { feature: '过滤精度', value: '0.0001微米RO膜', status: 'excellent' },
            { feature: '使用成本', value: '980元用2年', status: 'excellent' },
            { feature: '智能功能', value: '5G远程控制', status: 'excellent' },
            { feature: '水质监测', value: '实时监测', status: 'excellent' },
            { feature: '维护成本', value: '智能提醒', status: 'excellent' }
          ]
        }
      },
      conclusion: '点点够净水器在过滤效果、使用成本、智能化程度等方面全面领先，是现代家庭的理想选择。'
    }
  }

  // 计算用户节省
  calculateUserSavings(daysUsed, dailyUsage = 25) {
    const totalLiters = daysUsed * dailyUsage
    
    // 相比瓶装水的节省
    const bottledWaterCost = totalLiters * 2 // 假设每升瓶装水2元
    const deviceCost = 980
    const filterCost = Math.floor(daysUsed / 365) * 200 // 每年滤芯200元
    const totalDeviceCost = deviceCost + filterCost
    
    const moneySaved = bottledWaterCost - totalDeviceCost
    const bottlesSaved = totalLiters // 假设每升一个塑料瓶
    
    return {
      daysUsed: daysUsed,
      totalLiters: totalLiters,
      moneySaved: Math.max(0, moneySaved),
      bottlesSaved: bottlesSaved,
      co2Reduced: Math.round(bottlesSaved * 0.1), // 每个塑料瓶产生0.1kg CO2
      treesEquivalent: Math.round(bottlesSaved * 0.1 / 22), // 一棵树年吸收22kg CO2
      paybackPeriod: Math.ceil(deviceCost / (dailyUsage * 2 * 30)), // 几个月回本
      monthlyBottledWaterCost: dailyUsage * 2 * 30,
      monthlyDeviceCost: (deviceCost / 24) + (200 / 12) // 设备分24个月+滤芯月成本
    }
  }

  // 生成分享内容
  generateShareContent(type, data = {}) {
    const shareTemplates = {
      achievement: {
        title: `我在《点点够净水消消乐》中达成了新成就！`,
        desc: `刚刚通过第${data.level}关，学到了很多水质知识！点点够净水器真的很棒！`,
        imageUrl: '/assets/images/share_achievement.png'
      },
      knowledge: {
        title: `涨知识了！${data.title}`,
        desc: `在《点点够净水消消乐》中学到：${data.content.substring(0, 50)}...快来一起学习吧！`,
        imageUrl: '/assets/images/share_knowledge.png'
      },
      savings: {
        title: `我用点点够净水器已经节省了${data.moneySaved}元！`,
        desc: `还减少了${data.bottlesSaved}个塑料瓶的使用，为环保贡献力量！`,
        imageUrl: '/assets/images/share_savings.png'
      },
      invitation: {
        title: `净水知识大闯关，边玩边学超有趣！`,
        desc: `《点点够净水消消乐》寓教于乐，还能了解家庭用水安全知识，快来加入吧！`,
        imageUrl: '/assets/images/share_invitation.png'
      }
    }
    
    return shareTemplates[type] || shareTemplates.invitation
  }

  // 检查新用户奖励
  checkWelcomeGift() {
    if (!this.marketingCampaigns.welcomeGift.claimed) {
      return {
        available: true,
        gift: this.marketingCampaigns.welcomeGift
      }
    }
    return { available: false }
  }

  // 领取新用户奖励
  claimWelcomeGift() {
    if (!this.marketingCampaigns.welcomeGift.claimed) {
      this.marketingCampaigns.welcomeGift.claimed = true
      this.userEngagement.brandInteractions++
      this.saveUserData()
      
      // 更新用户游戏数据
      const app = getApp()
      const rewards = this.marketingCampaigns.welcomeGift.rewards
      app.globalData.userGameData.coins += rewards.coins
      
      if (!app.globalData.userGameData.powerups) {
        app.globalData.userGameData.powerups = {}
      }
      
      Object.keys(rewards.powerups).forEach(powerup => {
        if (!app.globalData.userGameData.powerups[powerup]) {
          app.globalData.userGameData.powerups[powerup] = 0
        }
        app.globalData.userGameData.powerups[powerup] += rewards.powerups[powerup]
      })
      
      app.saveGameData()
      
      return {
        success: true,
        rewards: rewards,
        message: '欢迎礼包领取成功！'
      }
    }
    
    return { success: false, message: '礼包已领取' }
  }

  // 展示品牌故事
  showBrandStory() {
    return {
      title: '点点够的故事',
      chapters: [
        {
          title: '发现问题',
          content: '我们发现，虽然自来水厂出水符合国家标准，但在漫长的管道输送过程中，很容易受到二次污染，影响家庭用水安全。',
          image: '/assets/images/story_problem.png'
        },
        {
          title: '寻找解决方案',
          content: '经过深入研究，我们选择了RO反渗透技术作为核心，这是目前最先进的净水技术，能够去除99.9%的有害物质。',
          image: '/assets/images/story_solution.png'
        },
        {
          title: '追求性价比',
          content: '我们坚信，优质的净水设备不应该是奢侈品。980元用2年的定价让每个家庭都能享受纯净好水。',
          image: '/assets/images/story_value.png'
        },
        {
          title: '拥抱智能时代',
          content: '集成5G技术，让净水器变得更智能。远程控制、实时监测、智能提醒，科技让生活更美好。',
          image: '/assets/images/story_smart.png'
        }
      ]
    }
  }

  // 获取用户互动统计
  getUserEngagementStats() {
    return {
      visitDays: this.userEngagement.visitDays,
      playTimeHours: Math.round(this.userEngagement.totalPlayTime / 3600),
      knowledgeCount: this.userEngagement.knowledgeUnlocked.length,
      totalKnowledge: this.educationContent.waterKnowledge.length,
      knowledgeProgress: Math.round(this.userEngagement.knowledgeUnlocked.length / this.educationContent.waterKnowledge.length * 100),
      achievements: this.userEngagement.achievementsEarned.length,
      brandInteractions: this.userEngagement.brandInteractions
    }
  }

  // 推荐下一步行动
  getRecommendedActions() {
    const stats = this.getUserEngagementStats()
    const actions = []
    
    if (stats.knowledgeProgress < 50) {
      actions.push({
        type: 'knowledge',
        title: '继续学习水质知识',
        description: `您已解锁${stats.knowledgeCount}/${this.educationContent.waterKnowledge.length}个知识点`,
        action: '继续通关解锁'
      })
    }
    
    if (stats.brandInteractions < 5) {
      actions.push({
        type: 'engagement',
        title: '了解更多产品信息',
        description: '深入了解点点够净水器的技术优势',
        action: '查看产品详情'
      })
    }
    
    if (stats.visitDays >= 7) {
      actions.push({
        type: 'share',
        title: '分享给好友',
        description: '把有用的水质知识分享给更多人',
        action: '立即分享'
      })
    }
    
    return actions
  }

  // 记录用户行为
  trackUserBehavior(action, data = {}) {
    switch(action) {
      case 'visit':
        this.userEngagement.visitDays++
        break
      case 'play':
        this.userEngagement.totalPlayTime += data.duration || 0
        break
      case 'brand_interaction':
        this.userEngagement.brandInteractions++
        break
      case 'knowledge_view':
        if (data.knowledgeId && !this.userEngagement.knowledgeUnlocked.includes(data.knowledgeId)) {
          this.userEngagement.knowledgeUnlocked.push(data.knowledgeId)
        }
        break
      case 'achievement':
        if (data.achievement && !this.userEngagement.achievementsEarned.includes(data.achievement)) {
          this.userEngagement.achievementsEarned.push(data.achievement)
        }
        break
    }
    
    this.saveUserData()
  }

  // 生成个性化推荐
  getPersonalizedContent() {
    const stats = this.getUserEngagementStats()
    
    if (stats.knowledgeProgress >= 80) {
      return {
        type: 'expert',
        title: '水质专家',
        content: '您已经是水质知识达人了！考虑成为我们的品牌推广大使吗？',
        action: '了解推广计划'
      }
    } else if (stats.knowledgeProgress >= 50) {
      return {
        type: 'advanced',
        title: '进阶学习者',
        content: '您对水质知识很有研究！继续学习更多专业知识吧。',
        action: '解锁高级知识'
      }
    } else {
      return {
        type: 'beginner',
        title: '新手入门',
        content: '水质安全关系全家健康，让我们一起学习更多知识吧！',
        action: '开始学习之旅'
      }
    }
  }
}

module.exports = BrandMarketingManager
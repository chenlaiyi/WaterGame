/**
 * 增强游戏功能管理器
 * 添加新的游戏特性和改进用户体验
 */
class EnhancedGameFeatures {
  constructor() {
    this.achievements = new Map()
    this.dailyQuests = []
    this.powerUpCombos = []
    this.socialFeatures = {
      challenges: [],
      leaderboards: {},
      shareHistory: []
    }
  }

  // 初始化增强功能
  init() {
    this.initAchievements()
    this.initDailyQuests()
    this.initPowerUpCombos()
    this.initSocialFeatures()
  }

  // 成就系统
  initAchievements() {
    const achievements = [
      {
        id: 'first_clear',
        name: '净水新手',
        description: '完成第一个关卡',
        icon: '🎯',
        requirement: 'clear_level_1',
        reward: { coins: 100, title: '净水新手' }
      },
      {
        id: 'combo_master',
        name: '连击大师',
        description: '达成10连击',
        icon: '⚡',
        requirement: 'combo_10',
        reward: { coins: 200, powerup: 'super_bomb' }
      },
      {
        id: 'time_master',
        name: '时间管理大师',
        description: '在30秒内完成关卡',
        icon: '⏱️',
        requirement: 'clear_in_30s',
        reward: { coins: 300, title: '时间大师' }
      },
      {
        id: 'water_expert',
        name: '水质专家',
        description: '完成所有水质检测',
        icon: '🧪',
        requirement: 'all_water_tests',
        reward: { coins: 500, badge: 'expert' }
      },
      {
        id: 'social_butterfly',
        name: '社交达人',
        description: '邀请10个好友游戏',
        icon: '👥',
        requirement: 'invite_10_friends',
        reward: { coins: 1000, powerup_pack: 'social' }
      },
      {
        id: 'brand_ambassador',
        name: '品牌大使',
        description: '了解所有净水器功能',
        icon: '💎',
        requirement: 'explore_all_features',
        reward: { coins: 800, special_badge: 'ambassador' }
      }
    ]

    achievements.forEach(achievement => {
      this.achievements.set(achievement.id, {
        ...achievement,
        unlocked: false,
        progress: 0
      })
    })
  }

  // 每日任务系统
  initDailyQuests() {
    this.dailyQuests = [
      {
        id: 'daily_play_3',
        name: '每日游戏',
        description: '完成3局游戏',
        type: 'play_count',
        target: 3,
        progress: 0,
        reward: { coins: 100, experience: 50 },
        refreshDaily: true
      },
      {
        id: 'daily_score_5000',
        name: '高分挑战',
        description: '单局得分超过5000',
        type: 'high_score',
        target: 5000,
        progress: 0,
        reward: { coins: 200, powerup: 'mega_bomb' },
        refreshDaily: true
      },
      {
        id: 'daily_water_test',
        name: '水质检测',
        description: '进行一次水质检测',
        type: 'water_test',
        target: 1,
        progress: 0,
        reward: { coins: 150, knowledge_point: 1 },
        refreshDaily: true
      },
      {
        id: 'daily_share',
        name: '分享达人',
        description: '分享游戏给好友',
        type: 'share',
        target: 1,
        progress: 0,
        reward: { coins: 80, social_point: 1 },
        refreshDaily: true
      }
    ]
  }

  // 道具组合系统
  initPowerUpCombos() {
    this.powerUpCombos = [
      {
        id: 'triple_filter',
        name: '三重过滤',
        description: 'PP棉 + CTO + RO 同时使用',
        components: ['pp_cotton', 'cto_carbon', 'ro_membrane'],
        effect: 'clear_entire_board',
        cooldown: 300, // 5分钟冷却
        animation: 'triple_filter_effect'
      },
      {
        id: 'time_freeze',
        name: '时间冻结',
        description: '暂停时间倒计时10秒',
        components: ['time_crystal', 'freeze_potion'],
        effect: 'pause_timer_10s',
        cooldown: 180, // 3分钟冷却
        animation: 'time_freeze_effect'
      },
      {
        id: 'smart_detection',
        name: '智能检测',
        description: '自动标记最佳消除位置',
        components: ['ai_chip', 'scanner'],
        effect: 'highlight_best_moves',
        cooldown: 120, // 2分钟冷却
        animation: 'smart_scan_effect'
      }
    ]
  }

  // 社交功能
  initSocialFeatures() {
    this.socialFeatures = {
      challenges: [
        {
          id: 'weekly_champion',
          name: '周冠军挑战',
          description: '本周得分排行榜第一名',
          type: 'leaderboard',
          duration: 7 * 24 * 60 * 60 * 1000, // 7天
          reward: { coins: 2000, title: '周冠军', badge: 'champion' }
        },
        {
          id: 'friend_battle',
          name: '好友对战',
          description: '与好友比拼同一关卡得分',
          type: 'pvp',
          reward: { coins: 500, experience: 100 }
        }
      ],
      leaderboards: {
        weekly: [],
        monthly: [],
        allTime: [],
        friends: []
      }
    }
  }

  // 检查成就进度
  checkAchievement(eventType, data) {
    this.achievements.forEach((achievement, id) => {
      if (achievement.unlocked) return

      let shouldUnlock = false

      switch (achievement.requirement) {
        case 'clear_level_1':
          shouldUnlock = eventType === 'level_clear' && data.level === 1
          break
        case 'combo_10':
          shouldUnlock = eventType === 'combo' && data.count >= 10
          break
        case 'clear_in_30s':
          shouldUnlock = eventType === 'level_clear' && data.time <= 30
          break
        case 'all_water_tests':
          shouldUnlock = eventType === 'water_test_complete' && data.allCompleted
          break
        case 'invite_10_friends':
          achievement.progress = data.friendCount || 0
          shouldUnlock = achievement.progress >= 10
          break
        case 'explore_all_features':
          achievement.progress = data.featuresExplored || 0
          shouldUnlock = achievement.progress >= 8 // 总共8个特性
          break
      }

      if (shouldUnlock) {
        this.unlockAchievement(id)
      }
    })
  }

  // 解锁成就
  unlockAchievement(achievementId) {
    const achievement = this.achievements.get(achievementId)
    if (!achievement || achievement.unlocked) return

    achievement.unlocked = true
    achievement.unlockedAt = Date.now()

    // 显示成就解锁动画
    this.showAchievementUnlock(achievement)

    // 给予奖励
    this.grantReward(achievement.reward)

    // 记录统计
    this.recordAchievementUnlock(achievementId)
  }

  // 显示成就解锁
  showAchievementUnlock(achievement) {
    wx.showModal({
      title: '成就解锁！',
      content: `恭喜您获得成就：${achievement.icon} ${achievement.name}\n${achievement.description}`,
      showCancel: false,
      confirmText: '太棒了！'
    })
  }

  // 给予奖励
  grantReward(reward) {
    // 实现奖励发放逻辑
    console.log('获得奖励:', reward)
  }

  // 更新每日任务进度
  updateDailyQuest(questType, progress) {
    const quest = this.dailyQuests.find(q => q.type === questType)
    if (!quest) return

    quest.progress = Math.min(quest.progress + progress, quest.target)

    if (quest.progress >= quest.target && !quest.completed) {
      quest.completed = true
      this.grantReward(quest.reward)
      this.showQuestComplete(quest)
    }
  }

  // 显示任务完成
  showQuestComplete(quest) {
    wx.showToast({
      title: `任务完成：${quest.name}`,
      icon: 'success',
      duration: 2000
    })
  }

  // 获取可用成就
  getAvailableAchievements() {
    return Array.from(this.achievements.values())
      .filter(achievement => !achievement.unlocked)
  }

  // 获取已解锁成就
  getUnlockedAchievements() {
    return Array.from(this.achievements.values())
      .filter(achievement => achievement.unlocked)
  }

  // 获取每日任务
  getDailyQuests() {
    return this.dailyQuests.filter(quest => !quest.completed)
  }

  // 刷新每日任务
  refreshDailyQuests() {
    this.dailyQuests.forEach(quest => {
      if (quest.refreshDaily) {
        quest.progress = 0
        quest.completed = false
      }
    })
  }
}

module.exports = EnhancedGameFeatures
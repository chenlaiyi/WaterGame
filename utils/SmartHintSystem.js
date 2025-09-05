/**
 * 智能提示系统
 * 为用户提供游戏指导和优化建议
 */
class SmartHintSystem {
  constructor() {
    this.hintHistory = []
    this.userProgress = {}
    this.adaptiveSettings = {
      showHints: true,
      hintFrequency: 'medium', // low, medium, high
      difficultyAdjustment: true
    }
  }

  // 分析游戏状态并提供提示
  analyzeAndHint(gameState) {
    const hints = []
    
    // 检查时间压力
    if (gameState.timeLeft < 60 && gameState.timeLeft > 30) {
      hints.push(this.createHint('time_warning', {
        message: '⏰ 时间不多了！优先消除上方的污染物',
        urgency: 'medium',
        actionable: true
      }))
    } else if (gameState.timeLeft <= 30) {
      hints.push(this.createHint('time_critical', {
        message: '🚨 时间紧急！使用道具快速清理',
        urgency: 'high',
        actionable: true,
        suggestedAction: 'use_powerup'
      }))
    }

    // 检查可消除的连击机会
    const comboOpportunities = this.findComboOpportunities(gameState.blocks)
    if (comboOpportunities.length > 0) {
      hints.push(this.createHint('combo_opportunity', {
        message: `✨ 发现 ${comboOpportunities.length} 个连击机会！`,
        urgency: 'low',
        positions: comboOpportunities
      }))
    }

    // 检查污染物堆积情况
    const stackHeight = this.getMaxStackHeight(gameState.blocks)
    if (stackHeight > 8) {
      hints.push(this.createHint('stack_warning', {
        message: '⚠️ 污染物堆积过高，注意清理底部',
        urgency: 'medium',
        suggestedStrategy: 'clear_bottom_first'
      }))
    }

    // 检查道具使用建议
    const powerupSuggestion = this.analyzePowerupUsage(gameState)
    if (powerupSuggestion) {
      hints.push(powerupSuggestion)
    }

    // 检查品牌教育机会
    const brandHint = this.getBrandEducationHint(gameState)
    if (brandHint) {
      hints.push(brandHint)
    }

    return this.filterAndPrioritizeHints(hints)
  }

  // 创建提示对象
  createHint(type, options) {
    return {
      id: `${type}_${Date.now()}`,
      type: type,
      message: options.message,
      urgency: options.urgency || 'low',
      timestamp: Date.now(),
      actionable: options.actionable || false,
      suggestedAction: options.suggestedAction,
      positions: options.positions,
      educationalContent: options.educationalContent
    }
  }

  // 寻找连击机会
  findComboOpportunities(blocks) {
    const opportunities = []
    const grid = this.convertToGrid(blocks)
    
    // 检查水平连击
    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length - 2; col++) {
        if (grid[row][col] && grid[row][col + 1] && grid[row][col + 2]) {
          if (grid[row][col].type === grid[row][col + 1].type && 
              grid[row][col].type === grid[row][col + 2].type) {
            opportunities.push({
              type: 'horizontal',
              positions: [[row, col], [row, col + 1], [row, col + 2]],
              blockType: grid[row][col].type
            })
          }
        }
      }
    }

    // 检查垂直连击
    for (let col = 0; col < 8; col++) {
      for (let row = 0; row < grid.length - 2; row++) {
        if (grid[row][col] && grid[row + 1][col] && grid[row + 2][col]) {
          if (grid[row][col].type === grid[row + 1][col].type && 
              grid[row][col].type === grid[row + 2][col].type) {
            opportunities.push({
              type: 'vertical',
              positions: [[row, col], [row + 1, col], [row + 2, col]],
              blockType: grid[row][col].type
            })
          }
        }
      }
    }

    return opportunities
  }

  // 分析道具使用建议
  analyzePowerupUsage(gameState) {
    const { blocks, powerups, timeLeft, score } = gameState
    
    // 如果时间紧急且有炸弹道具
    if (timeLeft < 45 && powerups.bomb > 0) {
      return this.createHint('powerup_bomb', {
        message: '💣 建议使用炸弹快速清理大面积污染物',
        urgency: 'medium',
        actionable: true,
        suggestedAction: 'use_bomb',
        educationalContent: 'PP棉炸弹可以清除3x3区域的颗粒污染物'
      })
    }

    // 如果有很多微生物且有CTO道具
    const microbeCount = blocks.filter(block => block.type === 'microbe').length
    if (microbeCount > 15 && powerups.cto > 0) {
      return this.createHint('powerup_cto', {
        message: '🔬 发现大量微生物，建议使用CTO激光清除',
        urgency: 'medium',
        actionable: true,
        suggestedAction: 'use_cto',
        educationalContent: 'CTO活性炭可以有效去除细菌和异味'
      })
    }

    // 如果有化学污染物且有RO道具
    const chemicalCount = blocks.filter(block => block.type === 'chemical').length
    if (chemicalCount > 10 && powerups.ro > 0) {
      return this.createHint('powerup_ro', {
        message: '⚗️ 发现化学污染，只有RO技术能完全清除',
        urgency: 'high',
        actionable: true,
        suggestedAction: 'use_ro',
        educationalContent: 'RO反渗透技术是去除重金属和化学污染的最佳方案'
      })
    }

    return null
  }

  // 获取品牌教育提示
  getBrandEducationHint(gameState) {
    const random = Math.random()
    
    // 随机显示品牌教育内容
    if (random < 0.1) { // 10%概率
      const educationHints = [
        {
          message: '💡 你知道吗？点点够净水器采用5层RO反渗透技术',
          educationalContent: 'RO反渗透技术可以去附99.9%的有害物质，包括重金属、细菌、病毒等'
        },
        {
          message: '💰 点点够净水器980元用2年，平均每天仅需1.3元',
          educationalContent: '相比桶装水，净水器更经济实惠，且水质更有保障'
        },
        {
          message: '📱 5G智能芯片可以实时监控水质状态',
          educationalContent: '通过手机APP可以远程查看滤芯寿命、水质报告等信息'
        },
        {
          message: '🏠 家庭终端净水比依赖水厂处理更安全',
          educationalContent: '自来水在管道输送过程中容易受到二次污染，家庭终端净化是最后一道防线'
        }
      ]

      const randomHint = educationHints[Math.floor(Math.random() * educationHints.length)]
      return this.createHint('brand_education', {
        message: randomHint.message,
        urgency: 'info',
        educationalContent: randomHint.educationalContent
      })
    }

    return null
  }

  // 过滤和优先级排序提示
  filterAndPrioritizeHints(hints) {
    // 按紧急程度排序
    const urgencyOrder = { 'high': 3, 'medium': 2, 'low': 1, 'info': 0 }
    
    return hints
      .filter(hint => this.shouldShowHint(hint))
      .sort((a, b) => urgencyOrder[b.urgency] - urgencyOrder[a.urgency])
      .slice(0, 3) // 最多显示3个提示
  }

  // 判断是否应该显示提示
  shouldShowHint(hint) {
    if (!this.adaptiveSettings.showHints) return false
    
    // 检查是否最近显示过相同类型的提示
    const recentHints = this.hintHistory.slice(-5)
    const recentSameType = recentHints.find(h => h.type === hint.type)
    
    if (recentSameType && Date.now() - recentSameType.timestamp < 30000) {
      return false // 30秒内不重复显示相同类型
    }
    
    return true
  }

  // 记录提示历史
  recordHint(hint) {
    this.hintHistory.push({
      ...hint,
      shownAt: Date.now()
    })
    
    // 只保留最近50条历史
    if (this.hintHistory.length > 50) {
      this.hintHistory = this.hintHistory.slice(-50)
    }
  }

  // 转换方块数组为网格
  convertToGrid(blocks) {
    const grid = Array(12).fill(null).map(() => Array(8).fill(null))
    
    blocks.forEach(block => {
      if (block.row !== undefined && block.col !== undefined) {
        grid[block.row][block.col] = block
      }
    })
    
    return grid
  }

  // 获取最大堆叠高度
  getMaxStackHeight(blocks) {
    const columnHeights = Array(8).fill(0)
    
    blocks.forEach(block => {
      if (block.col !== undefined) {
        columnHeights[block.col]++
      }
    })
    
    return Math.max(...columnHeights)
  }

  // 更新用户进度
  updateUserProgress(gameState) {
    this.userProgress = {
      ...this.userProgress,
      level: gameState.level,
      score: gameState.score,
      hintsUsed: this.hintHistory.length,
      lastPlayed: Date.now()
    }
  }

  // 获取适应性设置
  getAdaptiveSettings() {
    return { ...this.adaptiveSettings }
  }

  // 设置提示频率
  setHintFrequency(frequency) {
    this.adaptiveSettings.hintFrequency = frequency
  }
}

module.exports = SmartHintSystem
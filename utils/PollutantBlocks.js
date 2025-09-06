const logger = require('./Logger.js');

class PollutantBlocks {
  constructor() {
    // 定义污染物类型
    this.blockTypes = {
      particle: {
        id: 'particle',
        name: '颗粒污染物',
        description: '代表泥沙、铁锈等大颗粒杂质',
        color: '#8B4513', // 棕色
        difficulty: 1,
        scoreMultiplier: 1,
        removableBy: ['ppCotton']
      },
      microbe: {
        id: 'microbe',
        name: '微生物',
        description: '代表细菌、病毒等微生物',
        color: '#32CD32', // 绿色
        difficulty: 2,
        scoreMultiplier: 1.5,
        removableBy: ['ctoLaser']
      },
      chemical: {
        id: 'chemical',
        name: '化学污染物',
        description: '代表重金属、农药等化学污染物',
        color: '#9370DB', // 紫色
        difficulty: 3,
        scoreMultiplier: 2,
        removableBy: ['roWave']
      }
    };
    
    // 定义特殊方块类型
    this.specialBlocks = {
      ppCottonBomb: {
        id: 'ppCottonBomb',
        name: 'PP棉炸弹',
        description: '清除3x3区域内的颗粒污染物',
        color: '#D2691E',
        effect: 'clear3x3Particle'
      },
      ctoLaser: {
        id: 'ctoLaser',
        name: 'CTO激光',
        description: '清除整行或整列的微生物',
        color: '#228B22',
        effect: 'clearLineMicrobe'
      },
      roWave: {
        id: 'roWave',
        name: 'RO清洁波',
        description: '清除全屏指定类型的污染物',
        color: '#8A2BE2',
        effect: 'clearAllOfType'
      }
    };
  }

  // 获取所有污染物类型
  getAllBlockTypes() {
    return { ...this.blockTypes };
  }

  // 根据ID获取污染物信息
  getBlockTypeById(id) {
    return this.blockTypes[id] || null;
  }

  // 获取特殊方块信息
  getSpecialBlockById(id) {
    return this.specialBlocks[id] || null;
  }

  // 根据关卡获取可用的污染物类型
  getAvailableBlockTypesForLevel(level) {
    if (level <= 5) {
      return ['particle']; // 只有颗粒污染物
    } else if (level <= 15) {
      return ['particle', 'microbe']; // 颗粒 + 微生物
    } else {
      return ['particle', 'microbe', 'chemical']; // 全部类型
    }
  }

  // 生成指定类型的污染物方块
  generateBlock(type, row, col) {
    const blockType = this.blockTypes[type];
    if (!blockType) {
      logger.warn(`未知的污染物类型: ${type}`);
      return null;
    }
    
    return {
      id: `${type}-${Date.now()}-${row}-${col}`,
      type: type,
      name: blockType.name,
      row: row,
      col: col,
      color: blockType.color,
      difficulty: blockType.difficulty,
      scoreMultiplier: blockType.scoreMultiplier,
      falling: false
    };
  }

  // 生成特殊方块
  generateSpecialBlock(type, row, col) {
    const specialBlock = this.specialBlocks[type];
    if (!specialBlock) {
      logger.warn(`未知的特殊方块类型: ${type}`);
      return null;
    }
    
    return {
      id: `${type}-${Date.now()}-${row}-${col}`,
      type: type,
      name: specialBlock.name,
      row: row,
      col: col,
      color: specialBlock.color,
      effect: specialBlock.effect,
      isSpecial: true,
      falling: false
    };
  }

  // 获取污染物的分数
  getBlockScore(block, baseScore = 10) {
    if (block.isSpecial) {
      // 特殊方块有固定分数
      return baseScore * 5;
    }
    
    const blockType = this.blockTypes[block.type];
    if (blockType) {
      return baseScore * blockType.scoreMultiplier;
    }
    
    return baseScore;
  }

  // 检查两个方块是否可以匹配消除
  canMatch(block1, block2) {
    // 普通方块类型相同可以匹配
    if (!block1.isSpecial && !block2.isSpecial) {
      return block1.type === block2.type;
    }
    
    // 特殊方块可以与任何方块匹配
    return true;
  }

  // 获取特殊方块效果描述
  getSpecialBlockEffectDescription(effectType) {
    switch (effectType) {
      case 'clear3x3Particle':
        return '清除3x3区域内的颗粒污染物';
      case 'clearLineMicrobe':
        return '清除整行或整列的微生物';
      case 'clearAllOfType':
        return '清除全屏指定类型的污染物';
      default:
        return '特殊效果';
    }
  }

  // 根据难度获取提示信息
  getDifficultyTip(difficulty) {
    switch (difficulty) {
      case 1:
        return '简单：颗粒污染物，最容易清除';
      case 2:
        return '中等：微生物，需要特殊道具';
      case 3:
        return '困难：化学污染物，最难清除';
      default:
        return '未知难度';
    }
  }
}

module.exports = PollutantBlocks;
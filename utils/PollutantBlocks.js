/**
 * 污染物方块组件
 * 定义三种不同类型的污染物及其属性
 */
class PollutantBlock {
  constructor(type, row, col) {
    this.id = `${Date.now()}-${row}-${col}`
    this.type = type
    this.row = row
    this.col = col
    this.falling = false
    this.selected = false
    this.eliminating = false
    
    this.setTypeProperties()
  }

  // 设置类型属性
  setTypeProperties() {
    switch(this.type) {
      case 'particle':
        this.color = '#8B4513'
        this.hardness = 'easy'
        this.description = '颗粒污染物(铁锈、泥沙)'
        this.filterType = 'PP棉'
        this.eliminateScore = 10
        break
      case 'microbe':
        this.color = '#228B22'
        this.hardness = 'medium'
        this.description = '微生物(细菌、病毒)'
        this.filterType = 'CTO活性炭'
        this.eliminateScore = 20
        break
      case 'chemical':
        this.color = '#8A2BE2'
        this.hardness = 'hard'
        this.description = '化学污染物(重金属、农药)'
        this.filterType = 'RO反渗透膜'
        this.eliminateScore = 30
        break
      default:
        this.color = '#666666'
        this.hardness = 'medium'
        this.description = '未知污染物'
        this.filterType = '通用过滤'
        this.eliminateScore = 15
    }
  }

  // 移动方块
  move(newRow, newCol) {
    this.row = newRow
    this.col = newCol
  }

  // 选中方块
  select() {
    this.selected = true
  }

  // 取消选中
  deselect() {
    this.selected = false
  }

  // 检查是否可以与其他方块匹配
  canMatchWith(otherBlock) {
    return this.type === otherBlock.type
  }

  // 获取方块的视觉表现数据
  getDisplayData() {
    return {
      id: this.id,
      type: this.type,
      row: this.row,
      col: this.col,
      color: this.color,
      falling: this.falling,
      selected: this.selected,
      eliminating: this.eliminating,
      description: this.description,
      filterType: this.filterType
    }
  }
}

/**
 * 颗粒污染物方块
 */
class ParticleBlock extends PollutantBlock {
  constructor(row, col) {
    super('particle', row, col)
    this.icon = '/assets/images/particle.png'
  }
}

/**
 * 微生物污染物方块
 */
class MicrobeBlock extends PollutantBlock {
  constructor(row, col) {
    super('microbe', row, col)
    this.icon = '/assets/images/microbe.png'
    this.animationSpeed = Math.random() * 2 + 1
  }
}

/**
 * 化学污染物方块
 */
class ChemicalBlock extends PollutantBlock {
  constructor(row, col) {
    super('chemical', row, col)
    this.icon = '/assets/images/chemical.png'
    this.toxicLevel = Math.random() * 0.5 + 0.5
  }
}

/**
 * 污染物工厂类
 */
class PollutantFactory {
  static createBlock(type, row, col) {
    switch(type) {
      case 'particle':
        return new ParticleBlock(row, col)
      case 'microbe':
        return new MicrobeBlock(row, col)
      case 'chemical':
        return new ChemicalBlock(row, col)
      default:
        return new PollutantBlock(type, row, col)
    }
  }

  // 根据关卡生成合适的污染物类型
  static getRandomTypeForLevel(level) {
    if (level <= 5) {
      return 'particle'
    } else if (level <= 15) {
      const types = ['particle', 'microbe']
      return types[Math.floor(Math.random() * types.length)]
    } else {
      const types = ['particle', 'microbe', 'chemical']
      const weights = [0.4, 0.35, 0.25]
      const random = Math.random()
      
      if (random < weights[0]) return 'particle'
      if (random < weights[0] + weights[1]) return 'microbe'
      return 'chemical'
    }
  }

  // 根据难度调整污染物分布
  static getTypesForDifficulty(difficulty) {
    switch(difficulty) {
      case 'easy':
        return ['particle']
      case 'medium':
        return ['particle', 'microbe']
      case 'hard':
        return ['particle', 'microbe', 'chemical']
      case 'extreme':
        return ['microbe', 'chemical']
      default:
        return ['particle', 'microbe']
    }
  }

  // 生成初始方块布局
  static generateInitialLayout(level, rows = 6, cols = 8) {
    const blocks = []
    const availableTypes = this.getTypesForLevel(level)
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        let type
        let attempts = 0
        
        do {
          type = availableTypes[Math.floor(Math.random() * availableTypes.length)]
          attempts++
        } while (attempts < 10 && this.wouldCreateMatch(blocks, type, row, col))
        
        blocks.push(this.createBlock(type, row, col))
      }
    }
    
    return blocks
  }

  // 检查是否会创建匹配
  static wouldCreateMatch(existingBlocks, newType, row, col) {
    const leftBlocks = existingBlocks.filter(b => 
      b.row === row && b.col >= col - 2 && b.col < col
    ).sort((a, b) => a.col - b.col)
    
    if (leftBlocks.length >= 2 && 
        leftBlocks[leftBlocks.length - 1].type === newType &&
        leftBlocks[leftBlocks.length - 2].type === newType) {
      return true
    }
    
    return false
  }

  // 获取污染物类型信息
  static getTypeInfo(type) {
    const typeMap = {
      particle: {
        name: '颗粒污染物',
        description: '主要来源于水中的泥沙、铁锈等大颗粒物质',
        filterMethod: 'PP棉物理过滤',
        harmLevel: '低',
        color: '#8B4513'
      },
      microbe: {
        name: '微生物污染物',
        description: '包括细菌、病毒等微生物',
        filterMethod: 'CTO活性炭吸附',
        harmLevel: '中',
        color: '#228B22'
      },
      chemical: {
        name: '化学污染物',
        description: '重金属、农药残留等有害化学物质',
        filterMethod: 'RO反渗透膜高精度过滤',
        harmLevel: '高',
        color: '#8A2BE2'
      }
    }
    
    return typeMap[type] || typeMap.particle
  }
}

module.exports = {
  PollutantBlock,
  ParticleBlock,
  MicrobeBlock,
  ChemicalBlock,
  PollutantFactory
}
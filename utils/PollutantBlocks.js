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
    
    // 根据类型设置属性
    this.setTypeProperties()
  }

  // 设置类型属性
  setTypeProperties() {
    switch(this.type) {
      case 'particle':
        this.color = '#8B4513' // 棕色
        this.hardness = 'easy'
        this.description = '颗粒污染物(铁锈、泥沙)'
        this.filterType = 'PP棉'
        this.eliminateScore = 10
        break
      case 'microbe':
        this.color = '#228B22' // 绿色
        this.hardness = 'medium'
        this.description = '微生物(细菌、病毒)'
        this.filterType = 'CTO活性炭'
        this.eliminateScore = 20
        break
      case 'chemical':
        this.color = '#8A2BE2' // 紫色
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

  // 开始下落动画
  startFalling() {
    this.falling = true
  }

  // 停止下落动画
  stopFalling() {
    this.falling = false
  }

  // 选中方块
  select() {
    this.selected = true
  }

  // 取消选中
  deselect() {
    this.selected = false
  }

  // 开始消除动画
  startEliminating() {
    this.eliminating = true
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
    this.particles = this.generateParticles()
  }

  generateParticles() {
    // 生成泥沙、铁锈颗粒的视觉效果
    const particles = []
    for (let i = 0; i < 5; i++) {
      particles.push({
        x: Math.random() * 30 + 5,
        y: Math.random() * 30 + 5,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.5
      })
    }
    return particles
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
    this.microbes = this.generateMicrobes()
  }

  generateMicrobes() {
    // 生成细菌、病毒的动画效果
    const microbes = []
    for (let i = 0; i < 3; i++) {
      microbes.push({
        x: Math.random() * 25 + 5,
        y: Math.random() * 25 + 5,
        type: Math.random() > 0.5 ? 'bacteria' : 'virus',
        animationDelay: Math.random() * 2
      })
    }
    return microbes
  }
}

/**
 * 化学污染物方块
 */
class ChemicalBlock extends PollutantBlock {
  constructor(row, col) {
    super('chemical', row, col)
    this.icon = '/assets/images/chemical.png'
    this.toxicLevel = Math.random() * 0.5 + 0.5 // 毒性等级
    this.chemicals = this.generateChemicals()
  }

  generateChemicals() {
    // 生成重金属、有毒化学物质的视觉效果
    return {
      heavyMetals: ['铅', '汞', '镉'][Math.floor(Math.random() * 3)],
      toxicSymbol: '☠️',
      dangerLevel: this.toxicLevel > 0.7 ? 'high' : 'medium'
    }
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
      // 新手关卡，只有颗粒污染物
      return 'particle'
    } else if (level <= 15) {
      // 中级关卡，颗粒 + 微生物
      const types = ['particle', 'microbe']
      return types[Math.floor(Math.random() * types.length)]
    } else {
      // 高级关卡，所有类型
      const types = ['particle', 'microbe', 'chemical']
      return types[Math.floor(Math.random() * types.length)]
    }
  }

  // 生成关卡初始方块布局
  static generateLevelLayout(level, rows = 8, cols = 8) {
    const blocks = []
    const density = Math.min(0.7, 0.4 + level * 0.02) // 随关卡增加密度
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (Math.random() < density) {
          const type = this.getRandomTypeForLevel(level)
          const block = this.createBlock(type, row, col)
          blocks.push(block)
        }
      }
    }
    
    return blocks
  }
}

module.exports = {
  PollutantBlock,
  ParticleBlock,
  MicrobeBlock,
  ChemicalBlock,
  PollutantFactory
}
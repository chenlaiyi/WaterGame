/**
 * 污染物消除匹配引擎
 * 处理三消逻辑、方块移动、连击计算等
 */
class MatchEngine {
  constructor(gameManager) {
    this.gameManager = gameManager
    this.selectedBlock = null
    this.combo = 0
  }

  // 处理方块点击
  handleBlockTap(blockId) {
    const block = this.findBlockById(blockId)
    if (!block) return

    if (!this.selectedBlock) {
      // 选中第一个方块
      this.selectedBlock = block
      this.highlightBlock(block)
    } else {
      // 选中第二个方块，尝试交换
      if (this.isAdjacent(this.selectedBlock, block)) {
        this.swapBlocks(this.selectedBlock, block)
        this.checkAndClearMatches()
      }
      this.clearSelection()
    }
  }

  // 查找方块
  findBlockById(id) {
    return this.gameManager.gameArea.blocks.find(block => block.id === id)
  }

  // 检查两个方块是否相邻
  isAdjacent(block1, block2) {
    const rowDiff = Math.abs(block1.row - block2.row)
    const colDiff = Math.abs(block1.col - block2.col)
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)
  }

  // 交换方块
  swapBlocks(block1, block2) {
    const tempType = block1.type
    block1.type = block2.type
    block2.type = tempType
  }

  // 检查并清除匹配
  checkAndClearMatches() {
    const matches = this.findMatches()
    if (matches.length > 0) {
      this.clearMatches(matches)
      this.combo++
      this.calculateScore(matches.length)
      
      // 掉落填充
      setTimeout(() => {
        this.dropBlocks()
        this.fillEmptySpaces()
        // 递归检查新的匹配
        this.checkAndClearMatches()
      }, 300)
    } else {
      this.combo = 0
    }
  }

  // 查找所有匹配
  findMatches() {
    const matches = []
    const blocks = this.gameManager.gameArea.blocks
    
    // 检查水平匹配
    for (let row = 0; row < 12; row++) {
      for (let col = 0; col < 6; col++) {
        const current = this.getBlockAt(row, col)
        const right1 = this.getBlockAt(row, col + 1)
        const right2 = this.getBlockAt(row, col + 2)
        
        if (current && right1 && right2 && 
            current.type === right1.type && 
            current.type === right2.type) {
          matches.push([current, right1, right2])
        }
      }
    }
    
    // 检查垂直匹配
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 8; col++) {
        const current = this.getBlockAt(row, col)
        const down1 = this.getBlockAt(row + 1, col)
        const down2 = this.getBlockAt(row + 2, col)
        
        if (current && down1 && down2 && 
            current.type === down1.type && 
            current.type === down2.type) {
          matches.push([current, down1, down2])
        }
      }
    }
    
    return matches
  }

  // 获取指定位置的方块
  getBlockAt(row, col) {
    return this.gameManager.gameArea.blocks.find(block => 
      block.row === row && block.col === col
    )
  }

  // 清除匹配的方块
  clearMatches(matches) {
    const blocksToRemove = new Set()
    
    matches.forEach(match => {
      match.forEach(block => {
        blocksToRemove.add(block.id)
      })
    })
    
    // 播放消除动画
    this.playEliminateAnimation(Array.from(blocksToRemove))
    
    // 从游戏区域移除方块
    this.gameManager.gameArea.blocks = this.gameManager.gameArea.blocks.filter(
      block => !blocksToRemove.has(block.id)
    )
  }

  // 播放消除动画
  playEliminateAnimation(blockIds) {
    blockIds.forEach(id => {
      // 这里添加消除动画效果
      console.log(`Eliminating block: ${id}`)
    })
  }

  // 方块下落
  dropBlocks() {
    for (let col = 0; col < 8; col++) {
      const columnBlocks = this.gameManager.gameArea.blocks
        .filter(block => block.col === col)
        .sort((a, b) => b.row - a.row) // 从下往上排序
      
      let targetRow = 0
      columnBlocks.forEach(block => {
        block.row = targetRow
        targetRow++
      })
    }
  }

  // 填充空白位置
  fillEmptySpaces() {
    const types = this.gameManager.getAvailableBlockTypes()
    
    for (let col = 0; col < 8; col++) {
      const columnBlocks = this.gameManager.gameArea.blocks
        .filter(block => block.col === col).length
      
      // 从顶部添加新方块
      for (let row = columnBlocks; row < 12; row++) {
        const randomType = types[Math.floor(Math.random() * types.length)]
        this.gameManager.gameArea.blocks.push({
          id: `${Date.now()}-${row}-${col}`,
          type: randomType,
          row: row,
          col: col,
          falling: true
        })
      }
    }
  }

  // 计算分数
  calculateScore(matchCount) {
    let baseScore = matchCount * 10
    if (this.combo > 1) {
      baseScore *= this.combo // 连击加成
    }
    this.gameManager.score += baseScore
  }

  // 高亮方块
  highlightBlock(block) {
    // UI实现：添加高亮效果
    console.log(`Highlighting block: ${block.id}`)
  }

  // 清除选择
  clearSelection() {
    this.selectedBlock = null
    // UI实现：移除所有高亮效果
  }

  // 使用道具
  usePowerUp(type, targetBlock) {
    switch(type) {
      case 'pp_cotton': // PP棉炸弹
        this.clearAreaAround(targetBlock, 1)
        break
      case 'cto_laser': // CTO激光
        this.clearLineOrColumn(targetBlock)
        break
      case 'ro_wave': // RO清洁波
        this.clearAllOfType(targetBlock.type)
        break
    }
  }

  // 清除周围区域
  clearAreaAround(centerBlock, radius) {
    const blocksToRemove = []
    for (let row = centerBlock.row - radius; row <= centerBlock.row + radius; row++) {
      for (let col = centerBlock.col - radius; col <= centerBlock.col + radius; col++) {
        const block = this.getBlockAt(row, col)
        if (block && block.type === 'particle') { // PP棉只能清除颗粒污染物
          blocksToRemove.push(block.id)
        }
      }
    }
    
    this.gameManager.gameArea.blocks = this.gameManager.gameArea.blocks.filter(
      block => !blocksToRemove.includes(block.id)
    )
  }

  // 清除整行或整列
  clearLineOrColumn(targetBlock) {
    const blocksToRemove = []
    
    // 清除整行的微生物
    this.gameManager.gameArea.blocks.forEach(block => {
      if ((block.row === targetBlock.row || block.col === targetBlock.col) && 
          block.type === 'microbe') {
        blocksToRemove.push(block.id)
      }
    })
    
    this.gameManager.gameArea.blocks = this.gameManager.gameArea.blocks.filter(
      block => !blocksToRemove.includes(block.id)
    )
  }

  // 清除所有指定类型
  clearAllOfType(type) {
    this.gameManager.gameArea.blocks = this.gameManager.gameArea.blocks.filter(
      block => block.type !== type
    )
  }
}

module.exports = MatchEngine
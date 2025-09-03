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
      this.selectedBlock = block
      this.highlightBlock(block)
    } else {
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
      
      setTimeout(() => {
        this.dropBlocks()
        this.fillEmptySpaces()
        this.checkAndClearMatches()
      }, 300)
    } else {
      this.combo = 0
    }
  }

  // 查找所有匹配
  findMatches() {
    const matches = []
    
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
    
    this.gameManager.gameArea.blocks = this.gameManager.gameArea.blocks.filter(
      block => !blocksToRemove.has(block.id)
    )
  }

  // 方块下落
  dropBlocks() {
    for (let col = 0; col < 8; col++) {
      const columnBlocks = this.gameManager.gameArea.blocks
        .filter(block => block.col === col)
        .sort((a, b) => b.row - a.row)
      
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
      baseScore *= this.combo
    }
    this.gameManager.score += baseScore
  }

  // 高亮方块
  highlightBlock(block) {
    console.log(`Highlighting block: ${block.id}`)
  }

  // 清除选择
  clearSelection() {
    this.selectedBlock = null
  }

  // 使用PP棉炸弹
  usePPCottonBomb(centerRow, centerCol) {
    const blocksToRemove = []
    
    for (let row = centerRow - 1; row <= centerRow + 1; row++) {
      for (let col = centerCol - 1; col <= centerCol + 1; col++) {
        const block = this.getBlockAt(row, col)
        if (block && block.type === 'particle') {
          blocksToRemove.push(block.id)
        }
      }
    }
    
    this.removeBlocks(blocksToRemove)
    this.gameManager.score += blocksToRemove.length * 15
  }

  // 移除指定方块
  removeBlocks(blockIds) {
    this.gameManager.gameArea.blocks = this.gameManager.gameArea.blocks.filter(
      block => !blockIds.includes(block.id)
    )
    
    setTimeout(() => {
      this.dropBlocks()
      this.fillEmptySpaces()
    }, 200)
  }
}

module.exports = MatchEngine
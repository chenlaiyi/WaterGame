/**
 * 高性能渲染引擎
 * 专为消消乐游戏优化的Canvas渲染系统
 */
class AdvancedRenderEngine {
  constructor(canvas, ctx) {
    this.canvas = canvas
    this.ctx = ctx
    this.renderQueue = []
    this.animationQueue = []
    this.particleSystem = new ParticleSystem()
    this.shaderEffects = new ShaderEffects()
    
    // 渲染优化配置
    this.config = {
      enableVSync: true,
      targetFPS: 60,
      maxFrameTime: 16.67, // 60fps = 16.67ms per frame
      enableCulling: true,
      batchSize: 100,
      enableMipmap: true
    }
    
    // 性能监控
    this.metrics = {
      frameTime: 0,
      drawCalls: 0,
      triangles: 0,
      memoryUsage: 0
    }
    
    this.initOptimizations()
  }

  // 初始化渲染优化
  initOptimizations() {
    // 启用ImageSmoothingEnabled优化
    this.ctx.imageSmoothingEnabled = true
    this.ctx.imageSmoothingQuality = 'high'
    
    // 设置合成操作优化
    this.ctx.globalCompositeOperation = 'source-over'
    
    // 创建离屏Canvas用于预渲染
    this.offscreenCanvas = wx.createOffscreenCanvas({
      width: this.canvas.width,
      height: this.canvas.height
    })
    this.offscreenCtx = this.offscreenCanvas.getContext('2d')
    
    // 初始化对象池
    this.initObjectPools()
    
    // 预编译着色器效果
    this.shaderEffects.compile()
  }

  // 初始化对象池
  initObjectPools() {
    this.pools = {
      renderItem: [],
      particle: [],
      animation: [],
      transform: []
    }
    
    // 预创建对象
    for (let i = 0; i < 50; i++) {
      this.pools.renderItem.push(this.createRenderItem())
      this.pools.particle.push(this.createParticle())
      this.pools.animation.push(this.createAnimation())
      this.pools.transform.push(this.createTransform())
    }
  }

  // 主渲染循环
  render(gameState, deltaTime) {
    const startTime = performance.now()
    
    // 清空渲染队列
    this.renderQueue.length = 0
    this.metrics.drawCalls = 0
    
    // 构建渲染队列
    this.buildRenderQueue(gameState)
    
    // 视锥裁剪
    if (this.config.enableCulling) {
      this.performCulling()
    }
    
    // 批处理渲染
    this.batchRender()
    
    // 渲染特效
    this.renderEffects(deltaTime)
    
    // 渲染UI
    this.renderUI(gameState)
    
    // 更新性能指标
    this.metrics.frameTime = performance.now() - startTime
    
    // 自适应质量调整
    this.adaptiveQualityControl()
  }

  // 构建渲染队列
  buildRenderQueue(gameState) {
    // 添加游戏方块
    gameState.blocks.forEach(block => {
      const renderItem = this.getFromPool('renderItem')
      renderItem.setup(block)
      renderItem.z = block.row // Z-order sorting
      this.renderQueue.push(renderItem)
    })
    
    // 添加背景元素
    this.addBackgroundElements()
    
    // 添加UI元素
    this.addUIElements(gameState)
    
    // Z轴排序
    this.renderQueue.sort((a, b) => a.z - b.z)
  }

  // 视锥裁剪优化
  performCulling() {
    const viewport = {
      x: 0,
      y: 0,
      width: this.canvas.width,
      height: this.canvas.height
    }
    
    this.renderQueue = this.renderQueue.filter(item => {
      return this.isInViewport(item.bounds, viewport)
    })
  }

  // 批处理渲染
  batchRender() {
    // 按材质分组
    const batches = this.groupByMaterial(this.renderQueue)
    
    batches.forEach(batch => {
      this.renderBatch(batch)
    })
  }

  // 渲染批次
  renderBatch(batch) {
    if (batch.length === 0) return
    
    // 设置材质状态
    this.setMaterialState(batch[0].material)
    
    // 批量渲染
    batch.forEach(item => {
      this.renderItem(item)
    })
    
    this.metrics.drawCalls++
  }

  // 渲染单个元素
  renderItem(item) {
    this.ctx.save()
    
    // 应用变换
    this.applyTransform(item.transform)
    
    // 应用材质
    this.applyMaterial(item.material)
    
    // 渲染几何体
    this.renderGeometry(item.geometry)
    
    this.ctx.restore()
  }

  // 自适应质量控制
  adaptiveQualityControl() {
    if (this.metrics.frameTime > this.config.maxFrameTime * 1.5) {
      // 性能不足，降低质量
      this.config.enableMipmap = false
      this.particleSystem.maxParticles *= 0.8
    } else if (this.metrics.frameTime < this.config.maxFrameTime * 0.8) {
      // 性能充足，提升质量
      this.config.enableMipmap = true
      this.particleSystem.maxParticles = Math.min(
        this.particleSystem.maxParticles * 1.1,
        200
      )
    }
  }

  // 对象池管理
  getFromPool(type) {
    if (this.pools[type].length > 0) {
      return this.pools[type].pop()
    }
    return this.createObject(type)
  }

  returnToPool(type, obj) {
    obj.reset()
    this.pools[type].push(obj)
  }

  // 创建渲染对象
  createRenderItem() {
    return {
      setup: function(block) {
        this.x = block.x
        this.y = block.y
        this.width = block.width
        this.height = block.height
        this.type = block.type
        this.z = block.row || 0
      },
      reset: function() {
        this.x = 0
        this.y = 0
        this.width = 0
        this.height = 0
        this.type = null
        this.z = 0
      }
    }
  }

  // 获取性能指标
  getMetrics() {
    return { ...this.metrics }
  }

  // 清理资源
  cleanup() {
    this.renderQueue.length = 0
    this.animationQueue.length = 0
    this.particleSystem.cleanup()
  }
}

// 粒子系统类
class ParticleSystem {
  constructor() {
    this.particles = []
    this.maxParticles = 100
  }

  update(deltaTime) {
    this.particles.forEach((particle, index) => {
      particle.x += particle.vx * deltaTime
      particle.y += particle.vy * deltaTime
      particle.life -= deltaTime
      particle.alpha = particle.life / particle.maxLife
      
      if (particle.life <= 0) {
        this.particles.splice(index, 1)
      }
    })
  }

  render(ctx) {
    this.particles.forEach(particle => {
      ctx.save()
      ctx.globalAlpha = particle.alpha
      ctx.fillStyle = particle.color || '#fff'
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    })
  }

  cleanup() {
    this.particles.length = 0
  }
}

// 着色器效果类
class ShaderEffects {
  constructor() {
    this.effects = new Map()
  }

  compile() {
    // 预编译常用效果
    console.log('Shader effects compiled')
  }
}

module.exports = AdvancedRenderEngine
// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database()
  const users = db.collection('users')
  const type = event.type || 'score' // score, level, coins
  const limit = event.limit || 10
  
  try {
    let sortField = 'totalScore'
    switch (type) {
      case 'level':
        sortField = 'level'
        break
      case 'coins':
        sortField = 'coins'
        break
      default:
        sortField = 'totalScore'
    }
    
    // 查询排行榜数据
    const rankResult = await users
      .orderBy(sortField, 'desc')
      .limit(limit)
      .get()
    
    // 格式化排行榜数据
    const rankings = rankResult.data.map((user, index) => {
      return {
        rank: index + 1,
        nickname: user.nickname || `用户${index + 1}`,
        avatar: user.avatar || '',
        score: user.totalScore,
        level: user.level,
        coins: user.coins
      }
    })
    
    return {
      code: 0,
      message: '排行榜获取成功',
      data: rankings
    }
  } catch (error) {
    return {
      code: -1,
      message: '排行榜获取失败',
      error: error
    }
  }
}
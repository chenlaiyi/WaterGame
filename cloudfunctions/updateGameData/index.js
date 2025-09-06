// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  const users = db.collection('users')
  
  try {
    // 查询用户
    const userResult = await users.where({
      openid: wxContext.OPENID
    }).get()
    
    if (userResult.data.length === 0) {
      return {
        code: -1,
        message: '用户不存在'
      }
    }
    
    const userId = userResult.data[0]._id
    const userData = userResult.data[0]
    
    // 更新游戏数据
    const updateData = {
      level: event.level || userData.level,
      totalScore: event.totalScore || userData.totalScore,
      coins: event.coins || userData.coins,
      achievements: event.achievements || userData.achievements,
      unlockedLevels: event.unlockedLevels || userData.unlockedLevels,
      updateTime: new Date()
    }
    
    // 如果有新的解锁关卡，确保不重复并保持顺序
    if (event.unlockedLevels) {
      const uniqueLevels = [...new Set(event.unlockedLevels)].sort((a, b) => a - b)
      updateData.unlockedLevels = uniqueLevels
    }
    
    // 更新用户数据
    await users.doc(userId).update({
      data: updateData
    })
    
    return {
      code: 0,
      message: '游戏数据更新成功',
      data: updateData
    }
  } catch (error) {
    return {
      code: -1,
      message: '游戏数据更新失败',
      error: error
    }
  }
}
// 云函数 - 用户登录
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { code, userInfo } = event
  const wxContext = cloud.getWXContext()
  
  try {
    // 获取用户openId
    const { openid, unionid } = wxContext
    
    // 查询用户是否已存在
    const userRecord = await db.collection('users').where({
      openId: openid
    }).get()
    
    let userData = {
      openId: openid,
      unionId: unionid,
      nickname: userInfo.nickName,
      avatar: userInfo.avatarUrl,
      lastLoginTime: new Date(),
      createTime: new Date()
    }
    
    if (userRecord.data.length === 0) {
      // 新用户，创建记录
      userData.gameData = {
        level: 1,
        totalScore: 0,
        coins: 100, // 新用户送100金币
        achievements: [],
        unlockedLevels: [1],
        powerups: {
          pp_cotton: 1,
          cto_laser: 1,
          ro_wave: 1
        }
      }
      
      const result = await db.collection('users').add({
        data: userData
      })
      
      return {
        success: true,
        isNewUser: true,
        openId: openid,
        userId: result._id,
        gameData: userData.gameData
      }
    } else {
      // 老用户，更新登录时间
      await db.collection('users').doc(userRecord.data[0]._id).update({
        data: {
          lastLoginTime: new Date(),
          nickname: userInfo.nickName,
          avatar: userInfo.avatarUrl
        }
      })
      
      return {
        success: true,
        isNewUser: false,
        openId: openid,
        userId: userRecord.data[0]._id,
        gameData: userRecord.data[0].gameData
      }
    }
  } catch (error) {
    console.error('用户登录失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
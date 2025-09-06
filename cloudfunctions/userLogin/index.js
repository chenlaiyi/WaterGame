// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  
  // 记录用户登录信息
  const db = cloud.database()
  const users = db.collection('users')
  
  try {
    // 查询用户是否已存在
    const userResult = await users.where({
      openid: wxContext.OPENID
    }).get()
    
    if (userResult.data.length === 0) {
      // 新用户，创建用户记录
      const newUser = {
        openid: wxContext.OPENID,
        appid: wxContext.APPID,
        unionid: wxContext.UNIONID,
        nickname: '',
        avatar: '',
        level: 1,
        totalScore: 0,
        coins: 100,
        achievements: [],
        unlockedLevels: [1],
        createTime: new Date(),
        lastLoginTime: new Date()
      }
      
      await users.add({
        data: newUser
      })
      
      return {
        code: 0,
        message: '新用户注册成功',
        data: newUser
      }
    } else {
      // 老用户，更新最后登录时间
      const userId = userResult.data[0]._id
      await users.doc(userId).update({
        data: {
          lastLoginTime: new Date()
        }
      })
      
      return {
        code: 0,
        message: '登录成功',
        data: userResult.data[0]
      }
    }
  } catch (error) {
    return {
      code: -1,
      message: '登录失败',
      error: error
    }
  }
}
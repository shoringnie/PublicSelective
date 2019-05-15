// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  var status = 0
  var errMsg = "ok"
  const users = cloud.database().collection("users")
  var res, user
  var userDoc = users.doc(wxContext.OPENID)

  /* 获取用户数据 */
  try {
    res = await userDoc.get()
    status = 1
    user = res.data
  }
  catch(e) {
    console.log(e.lineNumber + "行: " + e.message)
    errMsg = "add_star: user not existed"
  }
  if (status == 0) {
    return {
      status: status,
      errMsg: errMsg,
    }
  }

  /* 判断不能收藏课程的情况 */
  if (user.stars.some(x => {
    return x == event.courseid
  })) {
    return {
      status: 0,
      errMsg: "add_star: course already been stared",
    }
  }
  if (user.stars.length >= 20) {
    return {
      status: 0,
      errMsg: "add_star: you can star no more than 20 courses",
    }
  }

  status = 0
  try {
    const _ = cloud.database().command
    res = await userDoc.update({
      data: {
        stars: _.push([event.courseid])
      },
    })
    status = 1
  }
  catch(e) {
    console.log(e.lineNumber + "行: " + e.message)
    errMsg = "add_star: user not existed"
  }

  return {
    status: status,
    errMsg: errMsg,
  }
}
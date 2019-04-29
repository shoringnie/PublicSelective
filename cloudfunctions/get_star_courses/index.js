// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const users = cloud.database().collection("users")
  var user, userDoc, status = 0, errMsg = "ok"
  userDoc = users.doc(wxContext.OPENID)
  var res
  try {
    res = await userDoc.get()
    status = 1
  }
  catch(e) {
    errMsg = "get_star_courses: user not existed"
    return {
      status: status,
      errMsg: errMsg,
    }
  }

  user = res.data
  return {
    status: status,
    errMsg: errMsg,
    courses: user.stars,
  }
}
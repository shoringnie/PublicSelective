// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const users = cloud.database().collection("users")

  var status = 0
  var errMsg = "ok"

  retUser = {}
  await users.doc(wxContext.OPENID).get().then(
    function (res) {
      status = 1
      retUser = res.data
      delete retUser._id
    },
    function (res) {
      status = 0
      errMsg = "get_user: doc().get() failed"
    }
  )

  if (status <= 0) {
    return {
      status: status,
      errMsg: errMsg,
    }
  }

  return {
    status: status,
    user: retUser,
    errMsg: errMsg,
  }
}
// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const users = cloud.database().collection("users")

  var status = 0
  var errMsg = "ok"
  await users.doc(wxContext.OPENID).get().then(
    function (res) {
      status = 1
    },
    function (res) {
      status = 0
    }
  )

  return {
    status: status,
    errMsg: errMsg,
  }
}
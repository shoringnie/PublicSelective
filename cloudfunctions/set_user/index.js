// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const users = cloud.database().collection("users")

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  var status = 1
  await users.doc(wxContext.OPENID).get().then(
    function (res) {
      status = 1
    },
    function (res) {
      status = -1
    }
  )

  if (!event.hasOwnProperty("user")) {
    status = -2
  }

  if (status <= 0) {
    return {
      status: status,
    }
  }

  status = -3
  srcUser = event.user
  desUser = {}
  var arr = ["nickname", "entranceYear", "profession", "stars"]
  for (var i in arr) {
    if (srcUser.hasOwnProperty(arr[i])) {
      desUser[arr[i]] = srcUser[arr[i]]
    }
  }
  
  await users.doc(wxContext.OPENID).update({
    data: desUser,
  }).then(function(res) {
    status = 1
  })

  return {
    status: status,
  }
}
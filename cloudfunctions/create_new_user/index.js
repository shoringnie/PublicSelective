// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: "release-19c65a" })
const users = cloud.database().collection("users")

function add_new(res) {

}

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  var status = 1
  var errMsg = "ok"
  await users.doc(wxContext.OPENID).get().then(
    function (res) {
      status = 0
      errMsg = "create_new_user: user already exists"
    },
    function (res) {

    }
  )

  const user = {
    _id: wxContext.OPENID,
    nickname: "李华",
    entranceYear: 2018,
    profession: "未知",
    stars: [],
    avatarUrl: "",
    likedComments: [],
    likedSubcomments: [],
    commentsLeft: 5,
    hasUnread: 0,
    unreadSubcomments: [],
  }
  if (event.hasOwnProperty("user")) {
    const caredKeys = ["nickname", "profession", "avatarUrl"]
    for (var i in caredKeys) {
      if (event.user.hasOwnProperty(caredKeys[i])) {
        user[caredKeys[i]] = event.user[caredKeys[i]]
      }
    }

  }
  if (status == 1) {
    await users.add({
      data: user
    }).then(
      function (res) {
        status = 1
      },
      function (res) {
        status = 0
        errMsg = "create_new_user: add() failed"
      }
    )
  }


  return {
    status: status,
    errMsg: errMsg,
    openid: wxContext.OPENID,
  }
}
// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: "release-19c65a" })

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  // if (!event.hasOwnProperty("subcommentid")) {
  //   return {
  //     status: 0,
  //     errMsg: "remove_unread: 'subcommentid' is necessary",
  //   }
  // }

  // const users = cloud.database().collection("users")
  // const subcommentid = event.subcommentid
  // var res
  // /* 获取用户所有未读 */
  // try {
  //   res = await users.doc(wxContext.OPENID).get()
  // }
  // catch(e) {
  //   console.error(e)
  //   return {
  //     status: 0,
  //     errMsg: "remove_unread: users.doc().get() failed",
  //   }
  // }
  // var unreads = res.data.unreadSubcomments

  // /* 移除该条未读 */
  // unreads = unreads.filter(function(x) {
  //   return x != subcommentid
  // })

  // /* 更新数据库 */
  // try {
  //   await users.doc(wxContext.OPENID).update({
  //     data: {
  //       unreadSubcomments: unreads,
  //     }
  //   })
  // }
  // catch(e) {
  //   console.error(e)
  //   return {
  //     status: 0,
  //     errMsg: "remove_unread: users.doc().update() failed",
  //   }
  // }
  
  const users = cloud.database().collection("users")
  try {
    await users.doc(wxContext.OPENID).update({
      data: {
        hasUnread: 0,
      }
    })
  }
  catch(e) {
    console.error(e)
    return {
      status: 0,
      errMsg: "remove_unread: users.doc().update() failed"
    }
  }

  return {
    status: 1,
    errMsg: "ok",
  }
}
// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: "release-19c65a" })

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const users = cloud.database().collection("users")
  const comments = cloud.database().collection("comments")
  const subcomments = cloud.database().collection("subcomments")

  var status = 0, errMsg = "ok"

  if (event.hasOwnProperty("commentid") ^ event.hasOwnProperty("subcommentid") ^ 1) {
    return {
      status: 0,
      errMsg: 'There must be either "commentid" or "subcommentid"',
    }
  }

  var operatedDB, id, likedArrayName
  if (event.hasOwnProperty("commentid")) {
    operatedDB = comments
    id = event.commentid
    likedArrayName = "likedComments"
  }
  else {
    operatedDB = subcomments
    id = event.subcommentid
    likedArrayName = "likedSubcomments"
  }

  /* 获取用户喜爱的数组（评论 or 二级评论？）*/
  var res
  try {
    res = await users.doc(wxContext.OPENID).get()
  }
  catch (e) {
    console.log(e.lineNumber + "行: " + e.message)
    return {
      status: 0,
      errMsg: "doc().get() failed",
    }
  }
  const likedArray = res.data[likedArrayName]

  /* 一边检查是否本来就未喜爱，一边为之后的更新做准备 */
  var newLikedArray = []
  status = 0
  for (var i in likedArray) {
    if (likedArray[i] == id) {
      status = 1
    }
    else {
      newLikedArray.push(likedArray[i])
    }
  }
  if (status == 0) {
    return {
      status: status,
      errMsg: "remove_like: no such (sub)comment liked",
    }
  }

  /* 将（二级）评论id从用户喜爱数组移除 */
  status = 0
  try {
    const _ = cloud.database().command
    if (event.hasOwnProperty("commentid")) {
      await users.doc(wxContext.OPENID).update({
        data: {
          likedComments: newLikedArray,
        }
      })
    }
    else {
      await users.doc(wxContext.OPENID).update({
        data: {
          likedSubcomments: newLikedArray,
        }
      })
    }
  }
  catch (e) {
    console.log(e.lineNumber + "行: " + e.message)
    return {
      status: 0,
      errMsg: "add_like: users.doc().update() failed",
    }
  }

  /* 维护（二级）评论数据库的点赞个数 */
  try {
    const _ = cloud.database().command
    await operatedDB.doc(id).update({
      data: {
        numLiked: _.inc(-1),
      },
    })
    status = 1
  }
  catch (e) {
    console.log(e.lineNumber + "行: " + e.message)
    return {
      status: 0,
      errMsg: "add_like: operateDB update() failed",
    }
  }

  return {
    status: status,
    errMsg: errMsg,
  }
}
// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const comments = cloud.database().collection('comments')

  var status = 1
  var errMsg = "ok"
  var comment = {}
  await comments.doc(event.commentid).get().then(
    function (res) {
      comment.commentid = res.data._id
      comment.openid = res.data.openid
      comment.courseid = res.data.courseid
      comment.time = res.data.time
      comment.overall = res.data.overall
      comment.difficulty = res.data.difficulty
      comment.hardcore = res.data.hardcore
      comment.tags = res.data.tags
      comment.content = res.data.content
      comment.subcomments = res.data.subcomments
      comment.numLiked = res.data.numLiked

      //console.log(comment)
    })
    .catch(function (res) {
      status = 0
      errMsg = res.errMsg;
    })
  
  /* 增加评论者nickname字段 */
  var res
  const users = cloud.database().collection("users")
  try {
    res = await users.doc(comment.openid).get()
  }
  catch(e) {
    console.log(e.lineNumber + "行: " + e.message)
    return {
      status: 0,
      errMsg: "get_comment: doc().get() failed",
    }
  }
  comment.nickname = res.data.nickname
  comment.avatarUrl = res.data.avatarUrl

  /* 增加doILike字段 */
  try {
    res = await users.doc(wxContext.OPENID).get()
  }
  catch (e) {
    console.log(e.lineNumber + "行: " + e.message)
    return {
      status: 0,
      errMsg: "get_comment: doc().get() failed",
    }
  }
  const likedComments = res.data.likedComments
  if (likedComments.some(x => {
    return x == event.commentid
  })) {
    comment.doILike = 1
  }
  else {
    comment.doILike = 0
  }

  return {
    status: status,
    errMsg: errMsg,
    comment: comment
  }
}
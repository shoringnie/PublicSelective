// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: "release-19c65a" })
const utility = require("public-selectives-utility")


// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  /* 检查数据格式是否合规 */
  if (!event.hasOwnProperty("comment")) {
    return {
      status: 0,
      errMsg: "submit_comment: there must be 'comment'",
    }
  }
  const comment = event.comment
  const needed = ["courseid", "overall", "difficulty", "hardcore", "content", "tags"]
  for (var i in needed) {
    if (!comment.hasOwnProperty(needed[i])) {
      return {
        status: 0,
        errMsg: "submit_comment: some necessary data fields omitted",
      }
    }
  }

  /* 检查用户是否已评过本课程 */
  const comments = cloud.database().collection("comments")
  var res
  try {
    res = await comments.where({
      openid: wxContext.OPENID,
      available: 1,
    }).get()
  }
  catch(e) {
    console.error(e)
    return {
      status: 0,
      errMsg: "submit_comment: you cannot submit a comment for one course for more than once",
    }
  }

  /* 检查用户是否已无剩余评论次数 */
  const users = cloud.database().collection("users")
  const userDoc = users.doc(wxContext.OPENID)
  try {
    res = await userDoc.get()
  }
  catch(e) {
    console.error(e)
    return {
      status: 0,
      errMsg: "submit_comment: users.doc().get() failed",
    }
  }
  if (res.data.commentsLeft == 0) {
    return {
      status: 0,
      errMsg: "submit_comment: you have no chance to submit this semester",
    }
  }

  /* 增加额外字段 */
  comment.openid = wxContext.OPENID
  comment.time = Date.now()
  comment.subcomments = []
  comment.numLiked = 0
  comment.available = 1

  /* 添加新评论进评论数据库 */
  try {
    await comments.add({
      data: comment,
    })
  }
  catch(e) {
    console.log("submit_comment: add() failed")
  }

  /* 用该评论维护课程数据 */
  try {
    res = await utility.update_course_with_new_comment(event.comment)
  }
  catch (e) {
    console.log("submit_comment: utility.update_course_with_new_comment() failed")
  }

  /* 维护用户数据库的commentsLeft字段 */
  const _ = cloud.database().command
  try {
    res = await userDoc.update({
      data: {commentsLeft: _.inc(-1)},
    })
  }
  catch(e) {
    console.log(e)
    return {
      status: 0,
      errMsg: "userDoc.update() failed",
    }
  }

  return res
}
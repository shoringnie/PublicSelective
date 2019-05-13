// 云函数入口文件
const cloud = require('wx-server-sdk')
const utility = require("public-selectives-utility")

cloud.init()

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

  /* 增加额外字段 */
  comment.openid = wxContext.OPENID
  comment.time = Date.now()
  comment.subcomments = []
  comment.numLiked = 0
  comment.available = 1

  /* 添加新评论进评论数据库 */
  const comments = cloud.database().collection("comments")
  try {
    await comments.add({
      data: comment,
    })
  }
  catch(e) {
    console.log("submit_comment: add() failed")
  }

  /* 用该评论维护课程数据 */
  var res
  try {
    res = await utility.update_course_with_new_comment(event.comment)
  }
  catch (e) {
    console.log("submit_comment: utility.update_course_with_new_comment() failed")
  }

  return res
}
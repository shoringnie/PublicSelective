// 云函数入口文件
const cloud = require('wx-server-sdk')
const utility = require("public-selectives-utility")

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  /* 检查数据格式是否合规 */
  if (!event.hasOwnProperty("subcomment")) {
    return {
      status: 0,
      errMsg: "there must be 'subcomment' in the input",
    }
  }
  const needed = ["commentid", "content"]
  const subcomment = event.subcomment
  for (var i in needed) {
    if (!subcomment.hasOwnProperty(needed[i])) {
      return {
        status: 0,
        errMsg: "data field '" + needed[i] + "' omitted",
      }
    }
  }

  /* 为子评论增加必要字段 */
  subcomment.openid = wxContext.OPENID
  subcomment.time = Date.now()
  subcomment.numLiked = 0

  /* 将新子评论添加到数据库 */
  const subcomments = cloud.database().collection("subcomments")
  var res
  try {
    res = await subcomments.add({
      data: subcomment,
    })
  }
  catch(e) {
    console.log("submit_subcomment: add() failed")
  }

  /* 维护评论数据库 */
  subcomment.subcommentid = res._id
  try {
    res = await utility.update_comment_with_new_subcomment(subcomment)
  }
  catch(e) {
    console.log("submit_subcomment: update_comment_with_new_subcomment() failed")
  }

  return res
}
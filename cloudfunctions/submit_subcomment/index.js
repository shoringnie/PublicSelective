// 云函数入口文件
const cloud = require('wx-server-sdk')
//cloud.init({ env: "release-19c65a" })
cloud.init()
const utility = require("public-selectives-utility")


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
  subcomment.available = 1
  if (!subcomment.hasOwnProperty("at")) {
    subcomment.at = ""
  }

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
  const newSubcommentid = res._id

  /* 维护评论数据库 */
  subcomment.subcommentid = res._id
  try {
    res = await utility.update_comment_with_new_subcomment(subcomment)
  }
  catch(e) {
    console.log("submit_subcomment: update_comment_with_new_subcomment() failed")
  }
  const retValue = res

  const users = cloud.database().collection("users")
  /* 更新二级评论用户的unreadSubcomments */
  var coresOpenid2 = ""  // 对应的二级评论者的openid
  if (subcomment.at != "") {
    try {
      res = await subcomments.doc(subcomment.at).get()
    }
    catch(e) {
      console.error(e)
      return {
        status: 0,
        errMsg: "submit_subcomment: subcomments.doc().get() failed",
      }
    }
    coresOpenid2 = res.data.openid
    if (coresOpenid2 != wxContext.OPENID) {
      try {
        const _ = cloud.database().command
        await users.doc(coresOpenid2).update({
          data: {
            unreadSubcomments: _.push(newSubcommentid),
            hasUnread: _.inc(1),
          }
        })
      }
      catch (e) {
        console.error(e)
        return {
          status: 0,
          errMsg: "submit_subcomment: users.doc().update() failed 1",
        }
      }
    }
    
  }

  /* 更新一级评论用户的unreadSubcomments */
  const comments = cloud.database().collection("comments")
  try {
    res = await comments.doc(subcomment.commentid).get()
  }
  catch(e) {
    console.error(e)
    return {
      status: 0,
      errMsg: "submit_subcomment: comments.doc().get() failed 2",
    }
  }
  const coresOpenid1 = res.data.openid  // 对应的一级评论的评价者openid
  if (coresOpenid1 != coresOpenid2 && coresOpenid1 != wxContext.OPENID) {
    const _ = cloud.database().command
    try {
      await users.doc(coresOpenid1).update({
        data: {
          unreadSubcomments: _.push(newSubcommentid),
          hasUnread: _.inc(1),
        }
      })
    }
    catch(e) {
      console.error(e)
      return {
        status: 0,
        errMsg: "submit_subcomment: users.doc().update() failed",
      }
    }
  }

  return retValue
}
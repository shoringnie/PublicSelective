// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  if (event.hasOwnProperty("commentid") == event.hasOwnProperty("subcommentid")) {
    return {
      status: 0,
      errMsg: "report_comment: input can contain either 'commentid' or 'subcommentid'",
    }
  }
  var targetDB, id
  if (event.hasOwnProperty("commentid")) {
    targetDB = cloud.database().collection("comments")
    id = event.commentid
  }
  else {
    targetDB = cloud.database().collection("subcomments")
    id = event.subcommentid
  }

  var res
  try {
    res = await targetDB.doc(id).update({
      data: {reported: 1},
    })
  }
  catch(e) {
    console.error(e)
    return {
      status: 0,
      errMsg: "report_comment: targetDB.doc().update() failed",
    }
  }

  return {
    status: 1,
    errMsg: "ok",
  }
}
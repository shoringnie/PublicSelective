// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const comments = cloud.database().collection('comments')

  var status = 1
  errMsg = "ok"
  comment = {}
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

      //console.log(comment)
    })
    .catch(function (res) {
      status = 0
      errMsg = res.errMsg;
    })

  return {
    status: status,
    errMsg: errMsg,
    comment: comment
  }
}
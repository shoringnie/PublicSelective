// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: "release-19c65a" })

// 云函数入口函数
exports.main = async (event, context) => {
  const subcomments = cloud.database().collection('subcomments')

  var status = 1
  var errMsg = "ok"
  var subcomment = {}
  await subcomments.doc(event.subcommentid).get().then(
    function (res) {
      subcomment.subcommentid = res.data._id
      subcomment.openid = res.data.openid
      subcomment.commentid = res.data.commentid
      subcomment.time = res.data.time
      subcomment.content = res.data.content
    })
    .catch(function (res) {
      status = 0
      errMsg = res.errMsg;
    })

  return {
    status: status,
    errMsg: errMsg,
    subcomment: subcomment
  }
}
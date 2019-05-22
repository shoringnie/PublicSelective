// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: "release-19c65a" })

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const comments = cloud.database().collection("comments")

  /* 获取自己的评论们 */
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
      errMsg: "get_comments_my: comments.where().get() failed",
    }
  }
  var retComments = res.data

  /* 去掉无用字段 */
  const caredKeys = ["commentid", "openid", "courseid", "time", "content"]
  const caredSet = new Set(caredKeys)
  for (var i in retComments) {
    retComments[i].commentid = retComments[i]._id
    delete retComments[i]._id
    for (var key in retComments[i]) {
      if (!caredSet.has(key)) {
        delete retComments[i][key]
      }
    }
  }

  /* 添加courseName字段 */
  const courses = cloud.database().collection("courses")
  const tasks = []
  for (var i in retComments) {
    const promise = courses.doc(retComments[i].courseid).get()
    tasks.push(promise)
  }
  try {
    res = await Promise.all(tasks)
  }
  catch(e) {
    console.error(e)
    return {
      status: 0,
      errMsg: "get_comments_my: Promise.all() failed",
    }
  }
  for (var i in retComments) {
    retComments[i].courseName = res[i].data.courseName
  }

  /* 按照时间后先排序 */
  retComments = retComments.sort(function(x, y) {
    return y.time - x.time
  })

  return {
    status: 1,
    errMsg: "ok",
    comments: retComments,
  }
}
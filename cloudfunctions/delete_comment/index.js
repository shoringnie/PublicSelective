// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const comments = cloud.database().collection("comments")
  if (!event.hasOwnProperty("commentid")) {
    return {
      status: 0,
      errMsg: "there must be 'commentid' in the input",
    }
  }

  var res
  try {
    res = await comments.doc(event.commentid).get()
  }
  catch(e) {
    return {
      status: 0,
      errMsg: "delete_comment: doc().get() failed",
    }
  }
  const comment = res.data
  if (comment.openid != wxContext.OPENID) {
    return {
      status: 0,
      errMsg: "delete_comment: you cannot delete other's comment!",
    }
  }
  if (comment.available == 0) {
    return {
      status: 0,
      errMsg: "delete_comment: comment already been deleted",
    }
  }

  /* 正式开始处理 */
  const courses = cloud.database().collection("courses")
  try {
    res = await courses.doc(comment.courseid).get()
  }
  catch(e) {
    return {
      status: 0,
      errMsg: "delete_comment: courses.doc().get() failed",
    }
  }
  const course = res.data

  /* 维护三维打分与计数 */
  --course.totalCount
  const key1 = ["overall", "difficulty", "hardcore"]
  const key2 = ["totalOverall", "totalDifficulty", "totalHardcore"]
  for (var i = 0; i < 3; ++i) {
    course[key2[i]] -= comment[key1[i]]
    if (course.totalCount > 0) {
      course[key1[i]] = course[key2[i]] / course.totalCount
    }
    else {
      course[key1[i]] = 0
    }
  }

  /* 维护标签结构 */
  for (var i in course.taginfos) {
    if (comment.tags.some(x => {
      return x == course.taginfos[i].tag
    })) {
      --course.taginfos[i].count
    }
  }
  course.taginfos = course.taginfos.filter(function(x) {
    return x.count > 0
  })
  course.taginfos = course.taginfos.sort(function(x, y) {
    return y.count - x.count
  })

  /* 上传到数据库 */
  const caredKeys = ["overall", "difficulty", "hardcore", "totalOverall", "totalDifficulty", "totalHardcore", "totalCount", "taginfos"]
  var newdata = {}
  for (var i in caredKeys) {
    newdata[caredKeys[i]] = course[caredKeys[i]]
  }
  try {
    await courses.doc(comment.courseid).update({
      data: newdata,
    })
  }
  catch(e) {
    return {
      status: 0,
      errMsg: "delete_comment: courses.update() failed",
    }
  }
  try {
    await comments.doc(event.commentid).update({
      data: {available: 0},
    })
  }
  catch(e) {
    return {
      status: 0,
      errMsg: "delete_comment: comments.update() failed",
    }
  }

  return {
    status: 1,
    errMsg: "ok",
  }
}
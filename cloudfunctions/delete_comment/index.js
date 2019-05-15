// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  if (!event.hasOwnProperty("commentid") && !event.hasOwnProperty("subcommentid")) {
    return {
      status: 0,
      errMsg: "there must be either 'commentid' or 'subcommentid' in the input",
    }
  }
  if (event.hasOwnProperty("commentid") && event.hasOwnProperty("subcommentid")) {
    return {
      status: 0,
      errMsg: "both 'commentid' and 'subcommentid' in the input is not allowed",
    }
  }
  var selectComments, id
  if (event.hasOwnProperty("commentid")) {
    selectComments = cloud.database().collection("comments")
    id = event.commentid
  }
  else {
    selectComments = cloud.database().collection("subcomments")
    id = event.subcommentid
  }

  var res
  try {
    res = await selectComments.doc(id).get()
  }
  catch(e) {
    return {
      status: 0,
      errMsg: "delete_comment: doc().get() failed",
    }
  }
  const selectComment = res.data
  if (selectComment.openid != wxContext.OPENID) {
    return {
      status: 0,
      errMsg: "delete_comment: you cannot delete other's (sub)comment!",
    }
  }
  if (selectComment.available == 0) {
    return {
      status: 0,
      errMsg: "delete_comment: (sub)comment already been deleted",
    }
  }

  if (event.hasOwnProperty("commentid")) {
    /* 正式开始处理 */
    const courses = cloud.database().collection("courses")
    try {
      res = await courses.doc(selectComment.courseid).get()
    }
    catch (e) {
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
      course[key2[i]] -= selectComment[key1[i]]
      if (course.totalCount > 0) {
        course[key1[i]] = course[key2[i]] / course.totalCount
      }
      else {
        course[key1[i]] = 0
      }
    }

    /* 维护标签结构 */
    for (var i in course.taginfos) {
      if (selectComment.tags.some(x => {
        return x == course.taginfos[i].tag
      })) {
        --course.taginfos[i].count
      }
    }
    course.taginfos = course.taginfos.filter(function (x) {
      return x.count > 0
    })
    course.taginfos = course.taginfos.sort(function (x, y) {
      return y.count - x.count
    })

    /* 上传到数据库 */
    const caredKeys = ["overall", "difficulty", "hardcore", "totalOverall", "totalDifficulty", "totalHardcore", "totalCount", "taginfos"]
    var newdata = {}
    for (var i in caredKeys) {
      newdata[caredKeys[i]] = course[caredKeys[i]]
    }
    try {
      await courses.doc(selectComment.courseid).update({
        data: newdata,
      })
    }
    catch (e) {
      return {
        status: 0,
        errMsg: "delete_comment: courses.update() failed",
      }
    }
  }
  
  /* 更新（二级）评论数据库 */
  try {
    await selectComments.doc(id).update({
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
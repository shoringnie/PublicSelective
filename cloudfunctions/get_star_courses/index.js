// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: "release-19c65a" })

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const users = cloud.database().collection("users")
  const courses = cloud.database().collection("courses")
  var userDoc, status = 0, errMsg = "ok"
  /* 获取用户信息（收藏课程id们） */
  userDoc = users.doc(wxContext.OPENID)
  var res
  try {
    res = await userDoc.get()
    status = 1
  }
  catch(e) {
    errMsg = "get_star_courses: user not existed"
    return {
      status: status,
      errMsg: errMsg,
    }
  }

  /* 判断区间合法性 */
  const stars = res.data.stars
  var start = 0
  var end = Math.min(start + 20, stars.length)
  if (event.hasOwnProperty("start")) {
    start = event.start
  }
  if (event.hasOwnProperty("end")) {
    end = Math.min(end, event.end)
  }
  if (start < 0 || start >= stars.length) {
    return {
      status: 0,
      errMsg: "get_star_courses: invalid start",
    }
  }
  if (end <= start) {
    return {
      status: 0,
      errMsg: "get_star_courses: end must be greater than start",
    }
  }
  if (end - start > 20) {
    return {
      status: 0,
      errMsg: "get_star_courses: end - start should be <= 20",
    }
  }
  const over = end >= stars.length? 1: 0

  /* 同时进行若干异步操作 */
  const tasks = []
  for (var i = start; i < end; ++i) {
    const promise = courses.doc(stars[i]).get()
    tasks.push(promise)
  }
  var retCourses
  try {
    retCourses = await Promise.all(tasks)
  }
  catch(e) {
    return {
      status: 0,
      errMsg: "get_star_courses: Promimse.all() failed",
    }
  }
  for (var i in retCourses) {
    retCourses[i] = retCourses[i].data
  }

  /* 修改字段以符合前端数据格式 */
  const careKeys = ["_id", "courseNumber", "courseName", "courseEngName", "creatorName", "credit", "totalHours", "weekHours", "overall", "difficulty", "hardcore", "taginfos", "campus", "wday", "time", "available"]
  const careSet = new Set(careKeys)
  for (var i in retCourses) {
    var toDelete = []
    for (var key in retCourses[i]) {
      if (!careSet.has(key)) {
        toDelete.push(key)
      }
    }
    for (var j in toDelete) {
      delete retCourses[i][toDelete[j]]
    }
    retCourses[i]["courseid"] = retCourses[i]._id;
    delete retCourses[i]._id
  }

  return {
    status: 1,
    errMsg: "ok",
    over: over,
    courses: retCourses,
  }
}
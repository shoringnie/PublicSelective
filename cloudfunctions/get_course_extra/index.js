// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: "release-19c65a" })

// 云函数入口函数
exports.main = async (event, context) => {
  const courses = cloud.database().collection("courses")
  var status = 0, errMsg = "ok", res
  try {
    res = await courses.doc(event.courseid).get()
    status = 1
  }
  catch(e) {
    return {
      status: 0,
      errMsg: "get_course_extra: no such courseid",
    }
  }

  const careKeys = ["establishUnitNumberName", "courseContent", "teachDemand", "majorReference", "scoreEvaluate", "campus", "wday", "time", "courseName", "taginfos"]
  var ret = {status: status, errMsg: errMsg}
  res = res.data
  for (var i in careKeys) {
    if (res.hasOwnProperty(careKeys[i])) {
      ret[careKeys[i]] = res[careKeys[i]];
    }
    else {
      ret[careKeys[i]] = ""
    }
  }

  const wxContext = cloud.getWXContext()
  const users = cloud.database().collection("users")
  var res
  try {
    res = await users.doc(wxContext.OPENID).get()
  }
  catch(e) {
    return {
      status: 0,
      errMsg: "get_course_extra: no such user",
    }
  }
  if (res.data.stars.indexOf(event.courseid) == -1) {
    ret["starred"] = 0
  }
  else {
    ret["starred"] = 1
  }

  return ret
}
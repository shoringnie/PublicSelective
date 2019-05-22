// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: "release-19c65a" })

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  var status = 0
  var errMsg = "ok"
  const users = cloud.database().collection("users")
  var res, user
  var userDoc = users.doc(wxContext.OPENID)

  try {
    res = await userDoc.get()
    status = 1
    user = res.data
  }
  catch (e) {
    console.log(e.lineNumber + "行: " + e.message)
    errMsg = "remove_star: user not existed"
  }
  if (status == 0) {
    return {
      status: status,
      errMsg: errMsg,
    }
  }

  // if (user.stars.some(x => {
  //   return x == event.courseid
  // })) {
  //   return {
  //     status: 0,
  //     errMsg: "add_star: course already been stared",
  //   }
  // }

  status = 0
  var newStars = []
  for (var i in user.stars) {
    if (user.stars[i] == event.courseid) {
      status = 1
    }
    else {
      newStars.push(user.stars[i])
    }
  }
  if (status == 0) {
    return {
      status: status,
      errMsg: "remove_star: no such course starred",
    }
  }

  status = 0
  try {
    res = await userDoc.update({
      data: {
        stars: newStars,
      },
    })
    status = 1
  }
  catch (e) {
    console.log(e.lineNumber + "行: " + e.message)
    errMsg = "add_star: user not existed"
  }

  /* 维护课程的numStarred */
  const courses = cloud.database().collection("courses")
  try {
    const _ = cloud.database().command
    res = await courses.doc(event.courseid).update({
      data: {
        numStarred: _.inc(-1),
      }
    })
    status = 1
  }
  catch (e) {
    console.log(e)
    return {
      status: 0,
      errMsg: "remove_star: courses.doc().update() failed"
    }
  }

  return {
    status: status,
    errMsg: errMsg,
  }
}
// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: "release-19c65a" })

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const courses = cloud.database().collection('courses')

  var status = 1
  var errMsg = "ok"
  var course = {}
  await courses.doc(event.courseid).get().then(
    function (res) {
      course.courseid = res.data._id
      course.courseNumber = res.data.courseNumber
      course.courseName = res.data.courseName
      course.courseEngName = res.data.courseEngName
      course.creatorName = res.data.creatorName
      course.credit = res.data.credit
      course.totalHours = res.data.totalHours
      course.weekHours = res.data.weekHours
      course.campus = res.data.campus
      course.wday = res.data.wday
      course.time = res.data.time
      course.overall = res.data.overall
      course.difficulty = res.data.difficulty
      course.hardcore = res.data.hardcore
      course.taginfos = res.data.taginfos
    })
    .catch(function (res) {
      status = 0
      errMsg = res.errMsg;
    })


  return {
    status: status,
    errMsg: errMsg,
    course: course
  }
}
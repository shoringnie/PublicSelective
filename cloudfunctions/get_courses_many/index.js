// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

var sortOrder = -1

function constructOverallCmd(selector) {
  var _ = cloud.database().command
  var rt = _
  if (selector.hasOwnProperty("overallLeft")) {
    rt = rt.and(_.gte(selector["overallLeft"]))
  }
  if (selector.hasOwnProperty("overallRight")) {
    rt = rt.and(_.lte(selector["overallRight"]))
  }
  return rt
}

function constructDifficultyCmd(selector) {
  var _ = cloud.database().command
  var rt = _
  if (selector.hasOwnProperty("difficultyLeft")) {
    rt = rt.and(_.gte(selector["difficultyLeft"]))
  }
  if (selector.hasOwnProperty("difficultyRight")) {
    rt = rt.and(_.lte(selector["difficultyRight"]))
  }
  return rt
}

function constructHardcoreCmd(selector) {
  var _ = cloud.database().command
  var rt = _
  if (selector.hasOwnProperty("hardcoreLeft")) {
    rt = rt.and(_.gte(selector["hardcoreLeft"]))
  }
  if (selector.hasOwnProperty("hardcoreRight")) {
    rt = rt.and(_.lte(selector["hardcoreRight"]))
  }
  return rt
}

function constructTaginfosCmd(selector) {
  var _ = cloud.database().command
  if (!selector.hasOwnProperty("tags")) {
    return _
  }
  var rt = _
  var tags = selector["tags"]
  // TODO: bug here
  for (var i in tags) {
    rt = rt.and(_.in([tags[i]]))
  }
  return rt
}

/* lexicography */
function sortby0(a, b) {
  if (a.courseEngName.toLowerCase() < b.courseEngName.toLowerCase()) {
    return sortOrder
  }
  return -sortOrder
}
function sortby1(a, b) {
  if (a.overall < b.overall) {
    return sortOrder
  }
  if (a.overall > b.overall) {
    return -sortOrder
  }
  if (a._id < b._id) {
    return -1
  }
  return 1
}
function sortby2(a, b) {
  if (a.difficulty < b.difficulty) {
    return sortOrder
  }
  if (a.difficulty > b.difficulty) {
    return -sortOrder
  }
  if (a._id < b._id) {
    return -1
  }
  return 1
}
function sortby3(a, b) {
  if (a.hardcore < b.hardcore) {
    return sortOrder
  }
  if (a.hardcore > b.hardcore) {
    return -sortOrder
  }
  if (a._id < b._id) {
    return -1
  }
  return 1
}

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const courses = cloud.database().collection("courses")
  const _ = cloud.database().command
  var status = 0
  var errMsg = "ok"
  var retCourses = {}

  var selector = {}
  if (event.hasOwnProperty("selector")) {
    selector = event.selector
  }

  /* 构造前端指定的条件 */
  var overallCmd = constructOverallCmd(selector)
  var difficultyCmd = constructDifficultyCmd(selector)
  var hardcoreCmd = constructHardcoreCmd(selector)
  var taginfosCmd = constructTaginfosCmd(selector)
  const needed = courses.where(
    _.and([
      { overall: overallCmd, },
      { difficulty: difficultyCmd, },
      { hardcore: hardcoreCmd, },
      { "taginfos.tag": taginfosCmd, },
    ])
  )

  /* 判断区间是否合法 */
  var start = 0
  const countResult = await needed.count()
  const total = countResult.total
  if (total == 0) {
    return {
      status: 1,
      errMsg: errMsg,
      over: 1,
      courses: [],
    }
  }
  if (event.hasOwnProperty("start")) {
    start = event.start
  }
  var end = Math.min(total, start + 20)
  if (event.hasOwnProperty("end")) {
    end = event.end
  }
  if (end - start <= 0 || end - start > 20) {
    errMsg = "get_courses_many: length must be <= 20 and > 0"
    return {
      status: status,
      errMsg: errMsg,
    }
  }
  if (start < 0) {
    errMsg = "get_courses_many: left bound must be >= 0"
    return {
      status: status,
      errMsg: errMsg,
    }
  }

  /* 分批获取全部记录 */
  var res
  try {
    const utility = require("public-selectives-utility")
    res = await utility.get_all_records(needed)
    status = res.status
    if (status == 0) {
      return {
        status: status,
        errMsg: res.errMsg,
      }
    }
  }
  catch(e) {
    status = 0
    errMsg = "utility.get_all_records() failed"
    return {
      status: status,
      errMsg: errMsg,
    }
  }
  retCourses = res.data

  /* 排序并切片 */
  if (event.hasOwnProperty("order")) {
    if (event.order != 0) {
      sortOrder = 1
    }
  }
  const sortbys = {
    "lexicography": sortby0,
    "overall": sortby1,
    "difficulty": sortby2,
    "hardcore": sortby3,
  }
  var sortby = "lexicography"
  if (event.hasOwnProperty("sortby") && sortbys.hasOwnProperty(event.sortby)) {
    sortby = event.sortby
  }
  retCourses = retCourses.sort(sortbys[sortby])
  retCourses = retCourses.slice(start, end)
  var over = 0
  if (end >= total) {
    over = 1
  }

  return {
    status: status,
    errMsg: errMsg,
    courses: retCourses,
    over: over,
  }
}
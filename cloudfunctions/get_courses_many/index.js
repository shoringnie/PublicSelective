// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

var sortOrder = -1

function constructOverallCmd(selector) {
  var rt = cloud.database().command
  if (selector.hasOwnProperty("overallLeft")) {
    rt = rt.gte(selector["overallLeft"])
  }
  if (selector.hasOwnProperty("overallRight")) {
    rt = rt.lte(selector["overallRight"])
  }
  return rt
}

function constructDifficultyCmd(selector) {
  var rt = cloud.database().command
  if (selector.hasOwnProperty("difficultyLeft")) {
    rt = rt.gte(selector["difficultyLeft"])
  }
  if (selector.hasOwnProperty("difficultyRight")) {
    rt = rt.lte(selector["difficultyRight"])
  }
  return rt
}

function constructHardcoreCmd(selector) {
  var rt = cloud.database().command
  if (selector.hasOwnProperty("hardcoreLeft")) {
    rt = rt.gte(selector["hardcoreLeft"])
  }
  if (selector.hasOwnProperty("hardcoreRight")) {
    rt = rt.lte(selector["hardcoreRight"])
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
    return sortOrder
  }
  return -sortOrder
}
function sortby2(a, b) {
  if (a.difficulty < b.overdifficultyall) {
    return sortOrder
  }
  if (a.difficulty > b.difficulty) {
    return -sortOrder
  }
  if (a._id < b._id) {
    return sortOrder
  }
  return -sortOrder
}
function sortby3(a, b) {
  if (a.hardcore < b.hardcore) {
    return sortOrder
  }
  if (a.hardcore > b.hardcore) {
    return -sortOrder
  }
  if (a._id < b._id) {
    return sortOrder
  }
  return -sortOrder
}

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const courses = cloud.database().collection("courses")
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
  const _ = cloud.database().command
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
  const batchTimes = Math.ceil(total / 100)
  const tasks = []
  for (let i = 0; i < batchTimes; ++i) {
    const promise = needed.skip(i * 100).limit(100).get()
    tasks.push(promise)
  }
  var merg = (await Promise.all(tasks)).reduce((acc, cur) => ({
    data: acc.data.concat(cur.data),
    errMsg: acc.errMsg,
  }))
  if (merg.errMsg != "collection.get:ok") {
    errMsg = merg.errMsg
    return {
      status: status,
      errMsg: errMsg,
    }
  }
  status = 1
  retCourses = merg.data

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
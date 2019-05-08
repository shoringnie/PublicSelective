// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const subcomments = cloud.database().collection("subcomments")
  const users = cloud.database().collection("users")

  if (!event.hasOwnProperty("subcommentids")) {
    return {
      status: 0,
      errMsg: "get_subcomments_many: there must be subcommentids in the input",
    }
  }
  if (event.subcommentids.length == 0) {
    return {
      status: 1,
      errMsg: "ok",
      over: 1,
      subcomments: [],
    }
  }

  /* 判断区间合法性 */
  var start = 0, end = Math.min(20, event.subcommentids.length)
  if (event.hasOwnProperty("start")) {
    start = event.start
  }
  if (event.hasOwnProperty("end")) {
    end = Math.min(end, event.end)
  }
  if (start < 0 || end > event.subcommentids.length || end - start > 20 || start >= end) {
    return {
      status: 0,
      errMsg: "get_subcomments_many: invalid range",
    }
  }
  const over = end >= event.subcommentids.length? 1: 0

  /* 将输入的id数组切片 */
  const ids = event.subcommentids.slice(start, end)

  /* 同时进行若干异步操作 */
  var tasks = []
  for (var i in ids) {
    const promise = subcomments.doc(ids[i]).get()
    tasks.push(promise)
  }
  var retSubcomments
  try {
    retSubcomments = await Promise.all(tasks)
  }
  catch(e) {
    return {
      status: 0,
      errMsg: "get_subcomments_many: doc().get() failed",
    }
  }

  /* 增加nickname字段 */
  for (var i in retSubcomments) {
    retSubcomments[i] = retSubcomments[i].data
    retSubcomments[i].subcommentid = retSubcomments[i]._id
    delete retSubcomments[i]._id

    var res
    try {
      res = await users.doc(retSubcomments[i].openid).get()
    }
    catch(e) {
      return {
        status: 0,
        errMsg: "doc().get() failed",
      }
    }
    retSubcomments[i].nickname = res.data.nickname
    retSubcomments[i].avatarUrl = res.data.avatarUrl
  }

  /* 增加doILike字段 */
  try {
    res = await users.doc(wxContext.OPENID).get()
  }
  catch(e) {
    return {
      status: 0,
      errMsg: "doc().get() failed",
    }
  }
  const likedSubcomments = res.data.likedSubcomments
  var subcommentSet = new Set()
  for (var i in likedSubcomments) {
    subcommentSet.add(likedSubcomments[i])
  }
  for (var i in retSubcomments) {
    if (subcommentSet.has(retSubcomments[i].subcommentid)) {
      retSubcomments[i].doILike = 1
    }
    else {
      retSubcomments[i].doILike = 0
    }
  }

  return {
    status: 1,
    errMsg: "ok",
    over: over,
    subcomments: retSubcomments,
  }
}
// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: "release-19c65a" })

var id2info = {}  // openid -> {nickname, avatarUrl}

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const subcomments = cloud.database().collection("subcomments")
  const users = cloud.database().collection("users")
  id2info = {}

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

  /* 同时进行若干异步操作 */
  const ids = event.subcommentids;
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
    console.error(e)
    return {
      status: 0,
      errMsg: "get_subcomments_many: doc().get() failed",
    }
  }

  /* 按照时间后先排序，滤出available为1的评论，并切片 */
  retSubcomments = retSubcomments.sort(function(x,y) {
    return y.data.time - x.data.time
  }).filter(function(x) {
    return x.data.available == 1
  }).slice(start, end)

  /* 试图增加targetContent字段 */
  var res
  if (event.hasOwnProperty("isUnread") && event.isUnread == 1) {
    const comments = cloud.database().collection("comments")
    for (var i in retSubcomments) {
      if (retSubcomments[i].data.at != "") {
        try {
          res = await subcomments.doc(retSubcomments[i].data.at).get()
        }
        catch (e) {
          console.error(e)
          return {
            status: 0,
            errMsg: "get_subcomments_many: subcomments.doc().get() failed",
          }
        }
        retSubcomments[i].data.targetContent = res.data.content
      }
      else {
        try {
          res = await comments.doc(retSubcomments[i].data.commentid).get()
        }
        catch (e) {
          console.error(e)
          return {
            status: 0,
            errMsg: "get_subcomments_many: comments.doc().get() failed",
          }
        }
        retSubcomments[i].data.targetContent = res.data.content
      }
    }
  }

  /* 增加nickname字段，修改at字段 */
  for (var i in retSubcomments) {
    retSubcomments[i] = retSubcomments[i].data
    retSubcomments[i].subcommentid = retSubcomments[i]._id
    delete retSubcomments[i]._id

    if (id2info.hasOwnProperty(retSubcomments[i].openid)) {
      const temp_info = id2info[retSubcomments[i].openid]
      retSubcomments[i].nickname = temp_info.nickname
      retSubcomments[i].avatarUrl = temp_info.avatarUrl
    }
    else {
      try {
        res = await users.doc(retSubcomments[i].openid).get()
      }
      catch (e) {
        return {
          status: 0,
          errMsg: "doc().get() failed",
        }
      }
      retSubcomments[i].nickname = res.data.nickname
      retSubcomments[i].avatarUrl = res.data.avatarUrl
      const temp_openid = retSubcomments[i].openid
      id2info[temp_openid] = {nickname: res.data.nickname, avatarUrl: res.data.avatarUrl}
    }
    
    if (retSubcomments[i].at != "") {
      try {
        res = await subcomments.doc(retSubcomments[i].at).get()
      }
      catch(e) {
        console.error(e)
        return {
          status: 0,
          errMsg: "get_subcomments_many: subcomments.doc().get() failed",
        }
      }
      retSubcomments[i].at = res.data.openid

      if (id2info.hasOwnProperty(retSubcomments[i].at)) {
        const temp_info = id2info[retSubcomments[i].at]
        retSubcomments[i].at = "@" + temp_info.nickname + " "
      }
      else {
        try {
          res = await users.doc(retSubcomments[i].at).get()
        }
        catch (e) {
          return {
            status: 0,
            errMsg: "doc().get() failed",
          }
        }
        retSubcomments[i].at = "@" + res.data.nickname + " "
        const temp_at = retSubcomments[i].at
        id2info[temp_at] = {nickname: res.data.nickname, avatarUrl: res.data.avatarUrl }
      }
    }
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
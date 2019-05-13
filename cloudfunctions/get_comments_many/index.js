// 云函数入口文件
const cloud = require('wx-server-sdk')
const utility = require('public-selectives-utility')
cloud.init()
const MAX_LIMIT = 100

// 云函数入口函数
exports.main = async (event, context) => {
  console.log("hehe")
  const wxContext = cloud.getWXContext()
  const comments = cloud.database().collection('comments')
  const users = cloud.database().collection('users')

  var status = 1
  var errMsg = "ok"
  var empty = 0
  var over = 0
  var retComments = {}
  
  //获取评论总数
  const countResult = await comments.where({
      courseid: event.courseid
    }).count()
  if (countResult.errMsg != "collection.count:ok") {
    status = 2
    errMsg = countResult.errMsg
    return {
      status: status,
      errMsg: errMsg
    }
  }
  const total = countResult.total

  //评论列表是否为空
  if (total == 0) {
    empty = 1
    over = 1
    return {
      status: status,
      errMsg: errMsg,
      empty: empty,
      over: over,
      comments: retComments,
      total: total
    } 
  }
  
  //判断区间是否越界
  var start = event.start
  var end = event.end
  if (end < start) {
    status = 0
    errMsg = "error: illegal length; requirement: start <= end"
    return {
      status: status,
      total: total,
      errMsg: errMsg
    }
  }
  else if (start < 0 || start >= total) {
    status = 0
    errMsg = "error: illegal start; requirement: start >= 0 and start < total"
    return {
      status: status,
      total: total,
      errMsg: errMsg
    }
  }
  else if (end - start > 20) {
    status = 0
    errMsg = "error: illegal length; requirement: end - start <= 20"
    return {
      status: status,
      total: total,
      errMsg: errMsg
    }
  }
  else if (end >= total) {
    over = 1
    end = total
  }


  //获取所有评论
  const batchTimes = Math.ceil(total / 100)
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    const promise = comments.where({
      courseid: event.courseid,
      available: 1,
    })
      .skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(promise)
  }
  const commentsResult = (await Promise.all(tasks)).reduce((acc, cur) => ({
    data: acc.data.concat(cur.data),
    errMsg: acc.errMsg,
  }))
  if (commentsResult.errMsg != "collection.get:ok") {
    status = 0
    errMsg = commentsResult.errMsg
    return {
      status: status,
      errMsg: errMsg
    }
  }
  var allComments = commentsResult.data

  //判断当前用户是否已进行过评论
  var commented = 0
  for (var i in allComments) {
    if (allComments[i].openid == wxContext.OPENID) {
      commented = 1
      break
    }
  }
  
  //排序：所有评论范围内，前五按照numLiked降序排列，其他按照评论时间先后倒序排列
  allComments.sort(function (a, b) {
   return -(a.numLiked - b.numLiked)
  })
  const topFiveNumLiked = allComments.splice(0, 5)
  allComments.sort(function (a, b) {
   return -(a.time - b.time)
  })
  const allCommentsSorted = topFiveNumLiked.concat(allComments)

  

  //取出相应区间评论
  retComments = allCommentsSorted.slice(start, end)

  //增加nickname字段
  for (var i = Object.keys(retComments).length - 1; i >= 0; i--) {
    const userid  = retComments[i].openid
    const userNickname = await users.doc(userid).get().then(
      function(res) {
        retComments[i].nickname = res.data.nickname
        retComments[i].avatarUrl = res.data.avatarUrl
      })
      .catch(function(res) {
        return {
          status: 0,
          errMsg: res.errMsg
        }
      })
  }

  //增加doILike字段
  var res
  try {
    res = await users.doc(wxContext.OPENID).get()
  }
  catch(e) {
    console.log(e.lineNumber + "行: " + e.message)
    return {
      status: 0,
      errMsg: "doc().get() failed",
    }
  }
  const likedComments = res.data.likedComments
  var commentSet = new Set()
  for (var i in likedComments) {
    commentSet.add(likedComments[i])
  }
  for (var i = Object.keys(retComments).length - 1; i >= 0; i--) {
    if (commentSet.has(retComments[i]._id)) {
      retComments[i].doILike = 1
    }
    else {
      retComments[i].doILike = 0
    }
  }

  //删除不需要的字段，并将_id替换为commentid
  const notNeed = ["overall", "difficulty", "hardcore", "tags", "subcomments"]
  for (var i in retComments) {
    for (var j in notNeed) {
      delete retComments[i][notNeed[j]]
    }
    retComments[i].commentid = retComments[i]._id
    delete retComments[i]._id
  }


  return {
    status: status,
    errMsg: errMsg,
    empty: empty,
    over: over,
    comments: retComments,
  	total: total,
    commented: commented,
  }
}
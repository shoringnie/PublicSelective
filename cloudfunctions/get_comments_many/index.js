// 云函数入口文件
const cloud = require('wx-server-sdk')
const utility = require('public-selectives-utility')
cloud.init()
const MAX_LIMIT = 100

// 云函数入口函数
exports.main = async (event, context) => {
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
  else if (end > total) {
    over = 0
    end = total
  }


  //获取所有评论
  const batchTimes = Math.ceil(total / 100)
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    const promise = comments.where({
      courseid: event.courseid
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
  const allComments = commentsResult.data
  
  //取出相应区间评论
  retComments = allComments.slice(start, end)

  //增加nickname字段
  for (var i = Object.keys(retComments).length - 1; i >= 0; i--) {
    const userid  = retComments[i].openid
    const userNickname = await users.doc(userid).get().then(
      function(res) {
        retComments[i].nickname = res.data.nickname
      })
      .catch(function(res) {
        status = 0
        errMsg = res.errMsg
      })
  }

  return {
    status: status,
    errMsg: errMsg,
    empty: empty,
    over: over,
    comments: retComments,
  	total: total
  }
}
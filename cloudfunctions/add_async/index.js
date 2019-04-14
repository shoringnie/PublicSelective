// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => new Promise(function(resolve, reject) {
  const wxContext = cloud.getWXContext()

  setTimeout(function() {
    resolve(event.a + event.b)
  }, event.delay)
})

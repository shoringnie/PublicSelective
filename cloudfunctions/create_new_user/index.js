// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const users = cloud.database().collection("users")

function add_new(res) {
  
}

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  var status = 1
  await users.doc(wxContext.OPENID).get().then(
    function (res) {
      status = 0
    },
    function(res) {
      
    }
  )

  if (status == 1) {
    await users.add({
      data: {
        _id: wxContext.OPENID,
        nickname: "LiHua",
        entranceYear: 2018,
        profession: "My profession",
        stars: [],
      }
    }).then(
      function (res) {
        status = 1
      },
      function (res) {
        status = 0
      }
    )
  }
  

  return {
    status: status,
  }
}
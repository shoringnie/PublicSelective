// miniprogram/pages/index/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    t_status: "origin_status",
    t_coursename: "origin_coursename",
    t_creatorname: "origin_creatorname"
  },

  navy1: function(e) {
    wx.navigateTo({url: '../greeting/greeting',})
  },
  navy2: function (e) {
    wx.reLaunch({
      url: "../main/main",
    })
  },
  navy3: function (e) {
    wx.navigateTo({ url: '../course/course?courseid=MAR304', })
  },
  navy4: function (e) {
    wx.navigateTo({ url: '../evaluation/evaluation?courseid=MAR304', })
  },
  navy5: function (e) {
    wx.navigateTo({ url: '../user/user', })
  },
  navy6: function (e) {
    wx.navigateTo({ url: '../about/about', })
  },
  navy7: function (e) {
    wx.navigateTo({ url: '../liked/liked', })
  },
  navy8: function (e) {
    wx.navigateTo({ url: '../setting/setting', })
  },
  navy9: function (e) {
    wx.navigateTo({ url: '../comment/comment?commentid=XNETYvdsX1oQerwE', })
  },
  navy10: function (e) {
    wx.navigateTo({
      url: '../authorization/authorization' })
  },
  on_delete_self: function() {
    wx.showModal({
      title: "删除自己",
      content: "确定要删除自己？",
      confirmColor: "#FF0000",
      confirmText: "删除",
      success: function(res) {
        if (res.confirm) {
          wx.cloud.callFunction({
            name: "tem_utility",
            success: function (res) {
              wx.showToast({
                title: "成功删除自己",
              })
            },
          })
        }
      }
    })
    
  },

  onLoad: function (options) {
   

    // wx.cloud.callFunction({
    //   name: "has_user_existed",
    // })
    // .then(function(res) {
    //   res = res.result
    //   if (res.status == 1) {
    //     return
    //   }
    //   wx.cloud.callFunction({
    //     name: "create_new_user",
    //   })
    // })

    // wx.getSetting({
    //   success(res) {
    //     if (res.authSetting['scope.userInfo']) {
    //       // 已经授权，可以直接调用 getUserInfo 获取头像昵称
    //       wx.getUserInfo({
    //         success(res) {
    //           wx.cloud.callFunction({
    //             name: "set_user",
    //             data: {
    //               user: {
    //                 avatarUrl: res.userInfo.avatarUrl,
    //               }
    //             },
    //           })
    //         }
    //       })
    //     }
    //   }
    // })
  },

})
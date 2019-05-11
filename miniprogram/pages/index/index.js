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
    wx.navigateTo({ url: '../main/main', })
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
  
  on_get_user_info: function(e) {
    e.detail.userInfo.avatarUrl
  },

  onLoad: function (options) {
    var _this = this
    wx.cloud.callFunction({
      name: "get_course",
      data: {
        courseid: "5cb9927581ae24ff5b8dcaf4",
      },
      success: res => {
        console.log("get_course : ", res),
        _this.setData({
          t_status: res.result.status,
          t_coursename: res.result.course.courseName,
          t_creatorname: res.result.course.creatorName
        })
      }
    })

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
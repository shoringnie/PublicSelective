// miniprogram/pages/setting/setting.js

var user
var created = false

function init() {
  user = {
    nickname: "李华",
    profession: "未知",
    avatarUrl: "",
  }
  created = false
}

function redirect() {
  wx.reLaunch({
    url: "../main/main",
  })
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    t_avatar_url: "",
    t_init_nickname: "",
  },

  on_change_avatar() {
    var that = this
    wx.chooseImage({
      count: 1,
      success: function(res) {
        that.setData({t_avatar_url: res.tempFilePaths[0],})
      },
    })
  },
  on_input(e) {
    user[e.target.dataset.key] = e.detail.value
  },
  on_next() {
    if (created) {
      console.warn("try to double create user")
      return
    }
    if (user.nickname.length > 20 || user.profession.length > 20) {
      wx.showModal({
        title: "输入过长",
        content: "请使用少于等于20字的昵称、专业",
        showCancel: false,
        confirmText: "我知道了",
      })
      return;
    }

    var that = this
    created = true
    if (this.data.t_avatar_url[0] != 'w') {
      user.avatarUrl = this.data.t_avatar_url
    }
    wx.cloud.callFunction({
      name: "create_new_user",
      data: {user: user,},
      success: function(res) {
        res = res.result
        if (res.status != 1) {
          console.error(res.errMsg)
          return
        }
        if (that.data.t_avatar_url[0] != 'w') {
          /* 头像为默认头像或微信头像，无需上传 */
          redirect()
          return
        }

        var url = that.data.t_avatar_url
        var suffix = ".png"
        for (var i = url.length - 1; i >= 0; --i) {
          if (url[i] == '.') {
            suffix = url.slice(i + 1)
          }
        }


        /* 上传云存储，更新数据库 */
        const filePath = that.data.t_avatar_url
        const cloudPath = res.openid + "_avatar." + suffix
        wx.cloud.uploadFile({
          cloudPath: cloudPath,
          filePath: filePath,
          success: function(res) {
            const fileID = res.fileID
            wx.cloud.callFunction({
              name: "set_user",
              data: {
                user: {avatarUrl: fileID,},
              },
              success: function(res) {
                res = res.result
                if (res.status != 1) {
                  console.error(res.errMsg);
                  return
                }
                redirect()
              }
            })
          },
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    init()
    wx.getSetting({
      success(res) {
        /* 已经授权，可以直接调用 getUserInfo 获取头像昵称 */
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success(res) {
              user.nickname = res.userInfo.nickName
              that.setData({
                t_avatar_url: res.userInfo.avatarUrl,
                t_init_nickname: res.userInfo.nickName,
              })
            }
          })
        }
        /* 未授权 */
        else {
          that.setData({ t_avatar_url: "cloud://debug-97554d.6465-debug-97554d/default_avatar.png" })
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      path: "/pages/main/main",
    }
  }
})
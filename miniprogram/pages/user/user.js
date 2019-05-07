// miniprogram/pages/user/user.js

var tempNickname = ""

Page({

  /**
   * 页面的初始数据
   */
  data: {
    nickname: "",
    profession: "专业：",
    nicknameDisabled: "disabled",
  },

  on_begin_edit_nickname: function(e) {
    tempNickname = this.data.nickname
    this.setData({
      nicknameDisabled: "",
    })
  },
  on_end_edit_nickname: function(e) {
    if (this.data.nickname == tempNickname) {
      this.setData({
        nicknameDisabled: "disabled",
      })
      wx.showToast({
        title: "昵称无变化",
        icon: "none",
      })
      return
    }
    var that = this
    this.setData({
      nicknameDisabled: "disabled",
      nickname: tempNickname
    })
    wx.cloud.callFunction({
      name: "set_user",
      data: {
        user: {
          nickname: tempNickname
        }
      },
      success: function(res) {
        res = res.result
        if (res.status <= 0) {
          wx.showToast({
            title: "昵称修改失败",
            icon: "none",
            duration: 3000,
          })
          console.log(res.errMsg)
          return
        }
        wx.showToast({
          title: "昵称修改成功",
          duration: 3000,
        })
      },
      fail: function(res) {
        console.error("set_user: unknown error occured")
        wx.showToast({
          title: "网络错误",
          icon: "none",
          duration: 3000,
        })
      },
    })
  },
  on_nickname_input: function(e) {
    tempNickname = e.detail.value
  },
  on_starbutton_click: function(e) {
    wx.navigateTo({
      url: '../liked/liked',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var _this = this
    wx.cloud.callFunction({
      name: "get_user",
      success: function(res) {
        res = res.result
        if (res.status <= 0) {
          console.error("get_user failed.", res.errMsg)
          return;
        }
        const user = res.user
        _this.setData({
          nickname: user.nickname,
          profession: user.profession,
        })
      },
      fail: function(res) {
        console.error("unknown error occured")
      },
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
    if (this.data.nicknameDisabled == "") {
      this.setData({
        nicknameDisabled: "disabled",
      })
      wx.showToast({
        title: "昵称未修改",
        icon: "none",
      })
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    if (this.data.nicknameDisabled == "") {
      this.setData({
        nicknameDisabled: "disabled",
      })
      wx.showToast({
        title: "昵称未修改",
        icon: "none",
      })
    }
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

  }
})
// miniprogram/pages/authorization/authorization.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    t_avatar_url: "",
    t_special: 0,
  },

  on_get_userinfo(e) {
    console.log(e)
    if (e.detail.errMsg == "getUserInfo:fail auth deny") {
      return
    }
    wx.showToast({
      title: "授权成功",
    })
  },

  on_next() {
    wx.navigateTo({
      url: "../setting/setting",
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const newData = { t_avatar_url: "cloud://debug-97554d.6465-debug-97554d/app_avatar_compressed.jpg"}
    if (options.hasOwnProperty("special")) {
      newData.t_special = options.special
    }
    this.setData(newData)
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
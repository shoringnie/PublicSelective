// miniprogram/pages/about/about.js

import Dialog from '../../dist/dialog/dialog';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    src: 'cloud://debug-97554d.6465-debug-97554d/app_avatar_compressed.jpg'
  },

  /**
   * 复制
   */
  copy: function (e) {
    const text = 'publicselectives@163.com';
    wx.setClipboardData({
      data: text,
      success: function (res) {
      }
    });
  },
  /**
   * 确认弹窗
   */
  declaration: function (e) {
    const text = 'IHAD以严谨的态度提供信息，但不对内容之准确性、完整性、可靠性、可用性和及时性做保证。\n用户在小程序发表的内容仅表明其个人的立场和观点，并不代表IHAD的立场或观点。';
    Dialog.alert({
      message: text,
      messageAlign: 'left'
    }).then(() => {
      // on close
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
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

  }
})
// miniprogram/pages/message/message.js

const blockSize = 20
var unreadlist, unreadids, startindex
var reachBottomFlag = 0

function init() {
  unreadlist = []
  unreadids = []
  startindex = 0
  reachBottomFlag = 0
}

function formatDate(stamp) {
  const now = new Date(stamp)
  var year = now.getFullYear();
  var month = now.getMonth() + 1;
  var date = now.getDate();
  var hour = now.getHours();
  var minute = now.getMinutes();
  const curr = new Date()
  const currstamp = curr.getTime()
  if (stamp <= currstamp - 365 * 3600000) {
    return year + "." + month + "." + date
  }
  if (date < curr.getDate() - 1) {
    return month + "." + date
  }
  if (minute < 10) {
    minute = "0" + minute
  }
  var whichday = ""
  if (date == curr.getDate()) {
    whichday = "今天"
  }
  else {
    whichday = "昨天"
  }
  return whichday + " " + hour + ":" + minute;
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    t_unreads: [],
    t_tip: "",
  },

  on_enter_comment: function(e) {
    const that = this
    const commentid = e.currentTarget.dataset.commentid
    // const subcommentid = e.currentTarget.dataset.subcommentid
    // wx.cloud.callFunction({
    //   name: "remove_unread",
    //   data: {subcommentid: subcommentid,},
    //   success: function(res) {
    //     res = res.result
    //     if (res.status != 1) {
    //       console.error(res.errMsg)
    //       return
    //     }
    //     --startindex
    //     unreadids = unreadids.filter(x => (x != subcommentid))
    //     unreadlist = unreadlist.filter(x => (x.subcommentid != subcommentid))
    //     that.setData({t_unreads: unreadlist})
    //     if (unreadids.length == 0) {
    //       that.setData({t_tip: "暂无相关消息"})
    //     }
    //   }
    // })
    wx.navigateTo({
      url: "../comment/comment?commentid=" + commentid,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    init()
    wx.cloud.callFunction({
      name: "get_user",
      success: function(res) {
        res = res.result
        if (res.status != 1) {
          console.error(res.errMsg)
          return
        }
        unreadids = res.user.unreadSubcomments
        that.loadlist()
      },
    })
  },

  loadlist: function() {
    const that = this
    wx.showLoading({
      title: "加载中",
    })
    wx.cloud.callFunction({
      name: "get_subcomments_many",
      data: {
        subcommentids: unreadids,
        isUnread: 1,
        start: startindex,
        end: startindex + blockSize,
      },
      success: function (res) {
        res = res.result
        if (res.status != 1) {
          console.error(res.errMsg)
          return
        }
        if (res.subcomments.length == 0) {
          that.setData({t_tip: "暂无相关消息"})
          wx.hideLoading()
          return
        }
        if (res.over == 1) {
          startindex += res.subcomments.length
          reachBottomFlag = 1
        }
        else {
          startindex += blockSize
        }
        for (var i in res.subcomments) {
          res.subcomments[i].time = formatDate(res.subcomments[i].time)
        }
        unreadlist = unreadlist.concat(res.subcomments)
        that.setData({ t_unreads: unreadlist })
        wx.hideLoading()
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
    if (reachBottomFlag == 2) {
      return
    }
    if (reachBottomFlag == 1) {
      reachBottomFlag = 2
      wx.showToast({
        title: "到底了",
      })
    }
    else {
      this.loadlist()
    }
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
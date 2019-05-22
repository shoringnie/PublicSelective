// miniprogram/pages/mycomment/mycomment.js

var selectedContent, selectedCommentid

function init() {
  selectedContent = ""
  selectedCommentid = ""
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
    t_comments: [],
    t_tipmessage: "",
    t_avatarUrl: "",
    t_popup_show: false,
  },

  on_enter_comment: function (e) {
    this.setData({ t_popup_show: false })
    wx.navigateTo({
      url: "../comment/comment?commentid=" + e.target.dataset.commentid
    })
  },
  on_popup_menu: function (e) {
    selectedCommentid = e.target.dataset.commentid
    selectedContent = e.target.dataset.content
    this.setData({ t_popup_show: true})
  },
  on_popup_close: function () {
    this.setData({ t_popup_show: false })
  },
  on_copy_content: function (e) {
    wx.setClipboardData({
      data: selectedContent,
      success(res) {
        wx.showToast({
          title: "已复制",
          icon: "none",
        })
      }
    })
    this.on_popup_close()
  },
  on_enter_comment2: function () {
    this.on_popup_close()
    wx.navigateTo({
      url: "../comment/comment?commentid=" + selectedCommentid,
    })
  },
  on_delete_comment: function () {
    this.on_popup_close()
    var that = this
    wx.showModal({
      title: "删除评论",
      content: "删除该评论后，您对该课程的评分、标签将一并删除。您可以重新评论本课程。确认删除吗？",
      confirmText: "删除",
      confirmColor: "#FF7256",
      success: function (res) {
        if (res.confirm) {
          wx.cloud.callFunction({
            name: "delete_comment",
            data: { commentid: selectedCommentid, },
            success: function (res) {
              res = res.result
              if (res.status != 1) {
                console.error(res.errMsg)
                return
              }
              wx.showToast({
                title: "删除成功",
              })
              that.onLoad()
            },
          })
        }
      }
    })

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    init()
    wx.cloud.callFunction({
      name: "get_comments_my",
      success: function(res) {
        res = res.result
        if (res.status != 1) {
          console.error(res.errMsg)
          return
        }
        const comments = res.comments
        for (var i in comments) {
          comments[i].time = formatDate(comments[i].time)
        }
        that.setData({
          t_comments: comments,
          t_tipmessage: comments.length == 0? "暂时无评论": "",
        })
      }
    })
    wx.cloud.callFunction({
      name: "get_user",
      success: function(res) {
        res = res.result
        if (res.status != 1) {
          console.error(res.errMsg)
        }
        that.setData({t_avatarUrl: res.user.avatarUrl})
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
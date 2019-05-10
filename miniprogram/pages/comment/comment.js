// miniprogram/pages/comment/comment.js

var commentid, subcommentids
var serverCommentLiked
var startindex = 0, over = 0, subcommentlist = []
var bottomReached = false
var serverLiked, subcommentid2index = {}
const blockSize = 20

function init() {
  commentid = ""
  subcommentids = []
  serverCommentLiked = 0
  startindex = 0
  over = 0
  subcommentlist = []
  bottomReached = false
  serverLiked = new Set
  subcommentid2index = {}
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
    t_commentAvatarUrl: "",
    t_commentNickname: "",
    t_commentTime: "",
    t_commentDoILike: 0,
    t_commentNumLiked: 0,
    t_commentContent: "",

    t_subcomments: []
  },

  on_like_comment: function() {
    if (serverCommentLiked == 1) {
      wx.showToast({
        title: "操作太频繁",
        icon: "none",
      })
      return
    }
    this.setData({t_commentDoILike: 1, t_commentNumLiked: this.data.t_commentNumLiked + 1})
    wx.cloud.callFunction({
      name: "add_like",
      data: {
        commentid: commentid,
      },
      success: res => {
        res = res.result
        if (res.status <= 0) {
          wx.showToast({
            title: "操作太频繁",
            icon: "none",
          })
          return
        }
        serverCommentLiked = 1
      },
    })
  },
  on_dislike_comment: function () {
    if (serverCommentLiked == 0) {
      wx.showToast({
        title: "操作太频繁",
        icon: "none",
      })
      return
    }
    this.setData({ t_commentDoILike: 0, t_commentNumLiked: this.data.t_commentNumLiked - 1 })
    wx.cloud.callFunction({
      name: "remove_like",
      data: {
        commentid: commentid,
      },
      success: res => {
        res = res.result
        if (res.status <= 0) {
          wx.showToast({
            title: "操作太频繁",
            icon: "none",
          })
          return
        }
        serverCommentLiked = 0
      },
    })
  },
  on_like_subcomment: function(e) {
    const subcommentid = e.target.dataset.subcommentid
    if (serverLiked.has(subcommentid)) {
      wx.showToast({
        title: "操作太频繁",
        icon: "none",
      })
      return
    }
    const index = subcommentid2index[subcommentid]
    var temp_subcomments = this.data.t_subcomments
    temp_subcomments[index].doILike = 1
    ++temp_subcomments[index].numLiked
    this.setData({ t_subcomments: temp_subcomments, })
    wx.cloud.callFunction({
      name: "add_like",
      data: {
        subcommentid: subcommentid,
      },
      success: res => {
        res = res.result
        if (res.status <= 0) {
          wx.showToast({
            title: "操作太频繁",
            icon: "none",
          })
          return
        }
        serverLiked.add(subcommentid)
      },
    })
  },
  on_dislike_subcomment: function (e) {
    const subcommentid = e.target.dataset.subcommentid
    if (!serverLiked.has(subcommentid)) {
      wx.showToast({
        title: "操作太频繁",
        icon: "none",
      })
      return
    }
    const index = subcommentid2index[subcommentid]
    var temp_subcomments = this.data.t_subcomments
    temp_subcomments[index].doILike = 0
    --temp_subcomments[index].numLiked
    this.setData({ t_subcomments: temp_subcomments, })
    wx.cloud.callFunction({
      name: "remove_like",
      data: {
        subcommentid: subcommentid,
      },
      success: res => {
        res = res.result
        if (res.status <= 0) {
          wx.showToast({
            title: "操作太频繁",
            icon: "none",
          })
          return
        }
        serverLiked.delete(subcommentid)
      },
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    init()
    commentid = options.commentid
    wx.cloud.callFunction({
      name: "get_comment",
      data: {
        commentid: options.commentid,
      },
      success: function(res) {
        const comment = res.result.comment
        serverCommentLiked = comment.doILike
        subcommentids = comment.subcomments
        that.setData({
          t_commentAvatarUrl: comment.avatarUrl,
          t_commentNickname: comment.nickname,
          t_commentTime: formatDate(comment.time),
          t_commentDoILike: comment.doILike,
          t_commentNumLiked: comment.numLiked,
          t_commentContent: comment.content,
        })
        that.loadlist()
      },
    })
  },

  loadlist: function() {
    var that = this
    wx.cloud.callFunction({
      name: "get_subcomments_many",
      data: {
        subcommentids: subcommentids,
        start: startindex,
        end: startindex + blockSize,
      },
      success: res => {
        res = res.result
        over = res.over
        if (!res.hasOwnProperty("subcomments")) {
          return
        }
        for (var i in res.subcomments) {
          res.subcomments[i].time = formatDate(res.subcomments[i].time)
          if (res.subcomments[i].doILike == 1) {
            serverLiked.add(res.subcomments[i].subcommentid)
          }
          subcommentid2index[res.subcomments[i].subcommentid] = startindex + parseInt(i)
        }
        subcommentlist = subcommentlist.concat(res.subcomments)
        that.setData({ t_subcomments: subcommentlist, })

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
    if (over == 0) {
      startindex += blockSize
      this.loadlist()
      wx.showToast({
        title: "加载中",
        icon: "loading",
      })
    }
    else if (!bottomReached) {
      bottomReached = true
      wx.showToast({
        title: "到底了",
      })
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
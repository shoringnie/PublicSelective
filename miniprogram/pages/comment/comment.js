// miniprogram/pages/comment/comment.js

var commentid, subcommentids
var serverCommentLiked
var startindex = 0, over = 0, subcommentlist = []
var bottomReached = false
var serverLiked, subcommentid2index = {}
const blockSize = 20
var tempContent, submitted
var initDoILike
var selectedContent, selectedSubcommentid, openid

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
  tempContent = ""
  submitted = false
  initDoILike = 0
  selectedContent = ""
  selectedSubcommentid = ""
  openid = ""
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

function is_space_string(s) {
  for (var i in s) {
    if (s[i] != ' ' && s[i] != '\n' && s[i] != '\t' && s[i] != '\r') {
      return false
    }
  }
  return true
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

    t_subcomments: [],
    t_sup_textarea: "",

    t_popup_show: false,
    t_showDelete: false,
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
    const str1 = "t_subcomments[" + index + "].doILike"
    const str2 = "t_subcomments[" + index + "].numLiked"
    this.setData({
      [str1]: 1,
      [str2]: temp_subcomments[index].numLiked,
    })
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
    const str1 = "t_subcomments[" + index + "].doILike"
    const str2 = "t_subcomments[" + index + "].numLiked"
    this.setData({
      [str1]: 0,
      [str2]: temp_subcomments[index].numLiked,
    })
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
  on_input: function(e) {
    tempContent = e.detail.value
  },
  on_submit: function(e) {
    var that = this
    if (submitted) {
      console.log("trying to resubmit!")
      return
    }
    submitted = true
    if (is_space_string(tempContent)) {
      wx.showModal({
        title: "回复为空",
        content: "请多回复几句吧",
        showCancel: false,
        confirmText: "我知道了",
        success(res) {
          submitted = false
        },
      })
      return
    }
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.userInfo']) {
          wx.cloud.callFunction({
            name: "submit_subcomment",
            data: {
              subcomment: {
                commentid: commentid,
                content: tempContent,
              },
            },
            success: function (res) {
              res = res.result
              if (res.status != 1) {
                console.error("提交子评论失败，错误信息：", res.errMsg)
                submitted = false
                return
              }
              submitted = true
              wx.showToast({
                title: "发布成功",
              })
              that.setData({ t_sup_textarea: "", t_sup_focus: "false" })
              that.onLoad({ commentid: commentid })
            },
            fail: function (res) {
              submitted = false
              console.error("提交子评论失败，未知错误", res.errMsg)
            }
          })
        }
        else {
          wx.showModal({
            title: "需要授权",
            content: "需要授权才可以回复评论，现在授权吗？",
            confirmText: "授权",
            success: function (res) {
              if (res.confirm) {
                wx.navigateTo({
                  url: "../authorization/authorization?special=1",
                })
              }
              submitted = false
            }
          })
        }
      }
    })
  },
  on_popup_menu: function(e) {
    selectedSubcommentid = e.target.dataset.subcommentid
    selectedContent = e.target.dataset.content
    this.setData({ t_popup_show: true, t_showDelete: openid == e.target.dataset.openid })
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
  on_delete_subcomment: function () {
    this.on_popup_close()
    var that = this
    wx.showModal({
      title: "删除回复",
      content: "确认要删除该回复吗？",
      confirmText: "删除",
      confirmColor: "#FF7256",
      success: function (res) {
        if (res.confirm) {
          wx.cloud.callFunction({
            name: "delete_comment",
            data: { subcommentid: selectedSubcommentid, },
            success: function (res) {
              res = res.result
              if (res.status != 1) {
                console.error(res.errMsg)
                return
              }
              wx.showToast({
                title: "删除成功",
              })
              that.onLoad({commentid: commentid})
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
    wx.showLoading({
      title: "加载中",
      mask: true,
    })
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
        initDoILike = comment.doILike
        that.setData({
          t_commentAvatarUrl: comment.avatarUrl,
          t_commentNickname: comment.nickname,
          t_commentTime: formatDate(comment.time),
          t_commentDoILike: comment.doILike,
          t_commentNumLiked: comment.numLiked,
          t_commentContent: comment.content,
        })
        wx.hideLoading()
        that.loadlist()
      },
    })
    wx.cloud.callFunction({
      name: "get_user",
      success: function(res) {
        res = res.result
        if (res.status != 1) {
          console.log(re.errMsg)
          return
        }
        openid = res.user.openid
      }
    })
  },

  loadlist: function() {
    var that = this
    wx.showLoading({
      title: "加载中",
    })
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
    if (this.data.t_commentDoILike != initDoILike) {
      const pages = getCurrentPages()
      pages[pages.length - 2].switch_doILike_from_comment()
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
    return {
      path: "/pages/main/main",
    }
  }
})
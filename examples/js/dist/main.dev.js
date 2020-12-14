"use strict";

var vm = null;
!function () {
  initHome();

  function initHome() {
    vm = new Vue({
      el: "#app",
      data: {
        Lists: [{
          'id': 1,
          'src': 'img/thumbnail/1.jpg',
          'name': '莱茵光伏实验室'
        }, {
          'id': 2,
          'src': 'img/thumbnail/2.jpg',
          'name': '实验室一楼'
        }, {
          'id': 3,
          'src': 'img/thumbnail/3.jpg',
          'name': '实验室二楼'
        }, {
          'id': 4,
          'src': 'img/thumbnail/4.jpg',
          'name': '零部件实验室'
        }, {
          'id': 5,
          'src': 'img/thumbnail/5.jpg',
          'name': 'TUV莱茵'
        }],
        pageNo: 1,
        // _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
        commentList: [],
        // 评论列表
        commentCount: "",
        // 评论数
        showList: 1,
        isShow: true,
        baseUrl: "http://localhost/open",
        // 登录之前的api前缀
        loginBaseUrl: "http://localhost/login_open",
        //登录之后的api前缀
        isLogin: "",
        //存储是否有用户登录的状态
        loginUser: {},
        // linkUrl: window.location.href.split('?')[0],
        encodeUrl: encodeURIComponent(window.location.href + "?time=1111")
      },
      created: function created() {
        var _this = this;

        var that = this;
        var token = this.getQueryVariable('token');
        this.setCookie("token", token, 7); // 检测当前是否有用户登录

        $.ajax({
          type: "get",
          url: this._data.baseUrl + '/api/user/weixin/login/isLogin/',
          async: false,
          beforeSend: function beforeSend(request) {
            request.setRequestHeader("token", token);
          },
          success: function success(res) {
            that._data.isLogin = res.result.islogin;
            that._data.loginUser = res.result;
          },
          error: function error(err) {
            console.log(err);
          }
        });
        window.addEventListener("storage", function (e) {
          if (e.storageArea.changeTo == "true") {
            // let currentSrc = (document.getElementsByClassName('ifm')[1] ? window.parent.document.getElementsByClassName('ifm')[1] : window.parent.document.getElementsByClassName('ifm')[0]).src;
            // that.showList = Number((currentSrc.split('=')[1]).split('.')[0]);
            if (that.showList + 1 < 14) {
              that.changeSelect(that.showList + 1);
            }
          }
        });

        window.onload = function () {
          _this.changeFontSize();

          _this.thumbnailNameScroll();

          _this.communicationValue();

          _this.selectDefinition();

          _this.turnOnGyro();
        };
      },
      mounted: function mounted() {
        var _this2 = this;

        var that = this;
        console.log(this.linkUrl);
        console.log(that.encodeUrl);

        if (!that.isLogin) {
          this.$refs.login.onclick = function () {
            window.location.href = 'http://backtest.cdflytu.com/open/api/user/weixin/login/userInfoLogin' + '?from=' + that.encodeUrl;
          };
        } // 登录成功


        if (that.isLogin) {
          var token = this.$options.methods.getCookie("token"); // 填充menu栏的用户信息

          $('#menu .top .avatar img').attr("src", that.loginUser.wxHeadImgUrl);
          $('#menu .top .nickName').text(that.loginUser.wxNickname); // 填充评论列表

          this.fillCommentList(); // let that = this;

          $("#commentPage .detail").scroll(function () {
            var a = document.getElementById("listBox");

            if ($(this).scrollTop() + $(this).height() - 20 > a.offsetHeight) {
              that.pageNo += 5;
              $.ajax({
                type: "get",
                url: that.loginBaseUrl + '/api/video/video-page/videoComment/' + '?videoKey=22e3fae115bd48a8b84db72a57eee061' + '&pageNo=' + that.pageNo + '&pageSize=5',
                async: false,
                beforeSend: function beforeSend(request) {
                  request.setRequestHeader("token", that.getCookie("token"));
                },
                success: function success(res) {
                  var a = res.result.list; // 评论解码

                  var b = a.map(function (item) {
                    var commentCont = item.commentContent;
                    item.commentContent = that.en_de_code().decode(commentCont);
                    return item;
                  });
                  that.commentList = that.commentList.concat(b);
                  that.commentCount = res.result.page.totalNum;
                },
                error: function error(err) {
                  console.log(err);
                }
              });
            } //     console.log(a.clientHeight);
            // console.log(a.offsetHeight);
            // console.log(a.scrollHeight);
            // console.log($(this).scrollTop());

          });
        } // 进入视频


        this.$refs.go.onclick = function () {
          _this2.$options.methods.openingPageDisappear();

          _this2.$refs.head.remove();
        }; // 操作指示


        this.$refs.btn.onclick = function () {
          _this2.$refs.pop.style.display = 'none';
        }; // 分享指示


        this.$refs.okay.onclick = function () {
          _this2.$refs.shareInstructionPage.style.display = "none";
        }; // menu栏的关闭按钮


        this.$refs.closeMenu.onclick = function () {
          _this2.$refs.menu.style.display = "none";
        }; // menu => 开启settingPage页


        this.$refs.setting.onclick = function () {
          _this2.$refs.menu.style.display = "none";
          _this2.$refs.settingPage.style.display = "block";
        }; // menu => 关闭settingPage页


        this.$refs.closeSetting.onclick = function () {
          _this2.$refs.settingPage.style.display = "none";
          _this2.$refs.menu.style.display = "block";
        }; // menu => 开启 definitionPage页


        this.$refs.definition.onclick = function () {
          _this2.$refs.menu.style.display = "none";
          _this2.$refs.definitionPage.style.display = "block";
        }; // menu => 关闭definitionPage页


        this.$refs.closeDefinition.onclick = function () {
          _this2.$refs.definitionPage.style.display = "none";
          _this2.$refs.menu.style.display = "block";
        }; // menu => 关闭commentPage页


        this.$refs.closeComment.onclick = function () {
          _this2.$refs.commentPage.style.display = "none";
        };

        this.$refs.k4.onclick = function () {
          sessionStorage.setItem("sharpness", "4K");
          sessionStorage.setItem("key", null);
          document.getElementById('ifm').contentWindow.location.reload(); // 播放状态下切换清晰度=>强制显示imglist

          _this2.$refs.imglist.style.display = "block";
        };

        this.$refs.p1080.onclick = function () {
          sessionStorage.setItem("sharpness", "1080");
          sessionStorage.setItem("key", null);
          document.getElementById('ifm').contentWindow.location.reload();
          _this2.$refs.imglist.style.display = "block";
        };

        this.$refs.p720.onclick = function () {
          sessionStorage.setItem("sharpness", "720");
          sessionStorage.setItem("key", null);
          document.getElementById('ifm').contentWindow.location.reload();
          _this2.$refs.imglist.style.display = "block";
        };
      },
      updated: function updated() {},
      methods: {
        // 填充评论列表
        fillCommentList: function fillCommentList() {
          var that = this;
          $.ajax({
            type: "get",
            url: this.loginBaseUrl + '/api/video/video-page/videoComment/' + '?videoKey=22e3fae115bd48a8b84db72a57eee061' + '&pageNo=1' + '&pageSize=5',
            async: false,
            cache: false,
            beforeSend: function beforeSend(request) {
              request.setRequestHeader("token", that.getCookie("token"));
            },
            success: function success(res) {
              // 评论解码
              var newCommentList = res.result.list.map(function (item) {
                var commentCont = item.commentContent;
                item.commentContent = that.en_de_code().decode(commentCont);
                return item;
              });
              that.commentList = newCommentList;
              that.commentCount = res.result.page.totalNum;
            },
            error: function error(err) {
              console.log(err);
            }
          });
        },
        sendComment: function sendComment() {
          var that = this;
          var contentOriginal = $("#commentPage .footer textarea").val(); // 清除空格

          content = contentOriginal.replace(/\s/g, "");

          if (content == null || content == "") {
            alert("评论不能为空!");
          } else {
            $.ajax({
              type: "post",
              url: this.loginBaseUrl + '/api/video/video-page/addComment/',
              contentType: "application/json",
              data: JSON.stringify({
                "videoKey": "22e3fae115bd48a8b84db72a57eee061",
                "content": contentOriginal
              }),
              async: false,
              beforeSend: function beforeSend(request) {
                request.setRequestHeader("token", that.$options.methods.getCookie("token"));
              },
              success: function success(res) {
                if (res.result) {
                  $("#commentPage .footer textarea").val(""); // that.commentList = "";
                  // console.log(that.commentList);

                  that.fillCommentList();
                  console.log(that.commentList);
                }
              },
              error: function error(err) {
                console.log(err);
              }
            });
          }
        },
        getCid: function getCid(e) {
          var that = this;
          var commentId = e.target.getAttribute('data-cid');

          if ($("[data-cid='" + commentId + "']").hasClass('active')) {
            // 取消评论点赞
            $.ajax({
              type: "post",
              url: this.loginBaseUrl + '/api/video/video-page/removeCommentLike/',
              contentType: "application/json",
              data: JSON.stringify({
                "commentId": commentId
              }),
              async: false,
              beforeSend: function beforeSend(request) {
                request.setRequestHeader("token", that.$options.methods.getCookie("token"));
              },
              success: function success(res) {
                if (res.result) {
                  var newCommentList = that.commentList.map(function (item) {
                    if (item.commentId == commentId) {
                      item.liked = false;
                      item.likeAmount = Number(item.likeAmount) - 1;
                    }

                    return item;
                  });
                  that.commentList = newCommentList;
                } // if ($("[data-cid='" + commentId + "']").hasClass('active')) {
                //     $("[data-cid='" + commentId + "']").removeClass('active');
                // }
                // let commentLikeAmount = Number($("[data-cid='" + commentId + "']").next().text());
                // $("[data-cid='" + commentId + "']").next().text(commentLikeAmount - 1);

              },
              error: function error(err) {
                console.log(err);
              }
            });
          } else {
            // 评论点赞
            $.ajax({
              type: "post",
              url: this.loginBaseUrl + '/api/video/video-page/addCommentLike/',
              contentType: "application/json",
              data: JSON.stringify({
                "commentId": commentId
              }),
              async: false,
              beforeSend: function beforeSend(request) {
                request.setRequestHeader("token", that.$options.methods.getCookie("token"));
              },
              success: function success(res) {
                if (res.result) {
                  var newCommentList = that.commentList.map(function (item) {
                    if (item.commentId == commentId) {
                      item.liked = true;
                      item.likeAmount = Number(item.likeAmount) + 1;
                      ;
                    }

                    return item;
                  });
                  that.commentList = newCommentList;
                } // if ($("[data-cid='" + commentId + "']").hasClass('active')) {
                // } else {
                //     $("[data-cid='" + commentId + "']").addClass('active');
                // }
                // let commentLikeAmount = Number($("[data-cid='" + commentId + "']").next().text());
                // $("[data-cid='" + commentId + "']").next().text(commentLikeAmount + 1);

              },
              error: function error(err) {
                console.log(err);
              }
            });
          }
        },
        // ==================================================================================
        setCookie: function setCookie(cname, cvalue, exdays) {
          var d = new Date();
          d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
          var expires = "expires=" + d.toGMTString();
          document.cookie = cname + "=" + cvalue + "; " + expires;
        },
        getCookie: function getCookie(cname) {
          var name = cname + "=";
          var ca = document.cookie.split(';');

          for (var i = 0; i < ca.length; i++) {
            var c = ca[i].trim();
            if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
          }

          return "";
        },
        en_de_code: function en_de_code() {
          return Base64 = {
            _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
            encode: function encode(e) {
              var t = "";
              var n, r, i, s, o, u, a;
              var f = 0;
              e = Base64._utf8_encode(e);

              while (f < e.length) {
                n = e.charCodeAt(f++);
                r = e.charCodeAt(f++);
                i = e.charCodeAt(f++);
                s = n >> 2;
                o = (n & 3) << 4 | r >> 4;
                u = (r & 15) << 2 | i >> 6;
                a = i & 63;

                if (isNaN(r)) {
                  u = a = 64;
                } else if (isNaN(i)) {
                  a = 64;
                }

                t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a);
              }

              return t;
            },
            decode: function decode(e) {
              var t = "";
              var n, r, i;
              var s, o, u, a;
              var f = 0;
              e = e.replace(/[^A-Za-z0-9+/=]/g, "");

              while (f < e.length) {
                s = this._keyStr.indexOf(e.charAt(f++));
                o = this._keyStr.indexOf(e.charAt(f++));
                u = this._keyStr.indexOf(e.charAt(f++));
                a = this._keyStr.indexOf(e.charAt(f++));
                n = s << 2 | o >> 4;
                r = (o & 15) << 4 | u >> 2;
                i = (u & 3) << 6 | a;
                t = t + String.fromCharCode(n);

                if (u != 64) {
                  t = t + String.fromCharCode(r);
                }

                if (a != 64) {
                  t = t + String.fromCharCode(i);
                }
              }

              t = Base64._utf8_decode(t);
              return t;
            },
            _utf8_encode: function _utf8_encode(e) {
              e = e.replace(/rn/g, "n");
              var t = "";

              for (var n = 0; n < e.length; n++) {
                var r = e.charCodeAt(n);

                if (r < 128) {
                  t += String.fromCharCode(r);
                } else if (r > 127 && r < 2048) {
                  t += String.fromCharCode(r >> 6 | 192);
                  t += String.fromCharCode(r & 63 | 128);
                } else {
                  t += String.fromCharCode(r >> 12 | 224);
                  t += String.fromCharCode(r >> 6 & 63 | 128);
                  t += String.fromCharCode(r & 63 | 128);
                }
              }

              return t;
            },
            _utf8_decode: function _utf8_decode(e) {
              var t = "";
              var n = 0;
              var r = c1 = c2 = 0;

              while (n < e.length) {
                r = e.charCodeAt(n);

                if (r < 128) {
                  t += String.fromCharCode(r);
                  n++;
                } else if (r > 191 && r < 224) {
                  c2 = e.charCodeAt(n + 1);
                  t += String.fromCharCode((r & 31) << 6 | c2 & 63);
                  n += 2;
                } else {
                  c2 = e.charCodeAt(n + 1);
                  c3 = e.charCodeAt(n + 2);
                  t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
                  n += 3;
                }
              }

              return t;
            }
          };
        },
        // =======================================================================================
        // 通过url获取token值
        getQueryVariable: function getQueryVariable(variable) {
          var query = window.location.search.substring(1);
          var vars = query.split("&");

          for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");

            if (pair[0] == variable) {
              return pair[1];
            }
          }

          return false;
        },
        changeSelect: function changeSelect(index) {
          if (index != this.showList) {
            console.log('热点事件函数changeselect()触发'); // this.isBefore = this.showList;
            // this.isBefore = index;

            this.showList = index; // 设置进入之后的视频状态 pause
            // localStorage.setItem("pause", true);

            document.getElementsByClassName("layout")[0].style.display = "flex";
            document.getElementsByClassName("img-list")[0].style.display = "block";
          }
        },
        // 缩略图 底部文字溢出 来回滚动
        thumbnailNameScroll: function thumbnailNameScroll() {
          var nameArray = document.getElementsByClassName('thumbnailName');

          var _loop = function _loop(i) {
            var ele = nameArray[i];
            var nameTrimSize = ele.offsetWidth;
            var nameTextSize = ele.scrollWidth;
            var control = true;
            var t = setInterval(rollLeft, 100);

            function rollLeft() {
              if (control) {
                ele.scrollLeft++;

                if (ele.scrollLeft >= nameTextSize - nameTrimSize) {
                  clearInterval(t);
                  t = setInterval(rollRight, 100);
                }
              }
            }

            function rollRight() {
              if (control) {
                ele.scrollLeft--;

                if (ele.scrollLeft <= 0) {
                  clearInterval(t);
                  t = setInterval(rollLeft, 100);
                }
              }
            }
          };

          for (var i = 0; i < nameArray.length; i++) {
            _loop(i);
          }
        },
        // 动态获取设备屏幕宽度=>Element adaptation
        changeFontSize: function changeFontSize() {
          document.querySelector('html').style.fontSize = document.documentElement.clientWidth / 750 * 16 + 'px';
        },
        // 开屏页消失
        openingPageDisappear: function openingPageDisappear() {
          var dom = document.getElementById('openingPage');
          dom.style.display = "none";
        },
        // 第一次进入项目设置通信值
        communicationValue: function communicationValue() {
          sessionStorage.setItem("key", "1");
          sessionStorage.setItem("sharpness", "4K");
        },
        // 清晰度选择 => css跟随
        selectDefinition: function selectDefinition() {
          $('#definitionPage .center .specific').map(function () {
            $(this).on('click', function () {
              $(this).siblings().removeClass('active');
              $(this).addClass('active');
            });
          });
        },
        turnOnGyro: function turnOnGyro() {
          $('#cmn-toggle').change(function () {
            if ($(this).prop("checked")) {
              //prop()函数用于设置或返回当前jQuery对象所匹配的元素的属性值,复选框被选中时
              sessionStorage.setItem("isTurnOn", true);
            } else {
              sessionStorage.setItem("isTurnOn", false);
            }
          });
        }
      },
      watch: {}
    });
  }
}();
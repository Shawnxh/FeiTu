let vm = null;

! function () {
    initHome();
    function initHome() {
        vm = new Vue({
            el: "#app",
            data: {
                // 登录之前的api前缀 + 登录之后的api前缀
                baseUrl: "http://192.168.100.178/open",
                loginBaseUrl: "http://192.168.100.178/login_open",
                // baseUrl: "https://backtest.cdflytu.com/open",
                // loginBaseUrl: "https://backtest.cdflytu.com/login-open",

                // 项目视频识别 videoKey
                videoKey: "22e3fae115bd48a8b84db72a57eee061",
                // 登录行为 => 跳转api
                loginNeed: "https://backtest.cdflytu.com/open/api/user/weixin/login/userInfoLogin/",
                // 评论页 => 页码
                pageNo: 1,
                // 评论总页数
                pageTotal: 0,
                // 评论页 => 单页评论量
                pageSize: 15,
                // 评论列表数据
                commentList: [],
                // 评论总条数
                commentCount: "",
                showList: 1,
                isShow: true,
                // 存储是否有用户登录的状态
                isLogin: "",
                // 存储登录用户数据
                loginUser: {},
                // 编码登录成功后的返回地址
                encodeUrl: encodeURIComponent(window.location.href + "?time=1111"),
                Lists: [{
                    'src': 'img/thumbnail/1.jpg',
                    'name': '莱茵光伏实验室'
                }, {
                    'src': 'img/thumbnail/2.jpg',
                    'name': '实验室一楼'
                }, {
                    'src': 'img/thumbnail/3.jpg',
                    'name': '实验室二楼'
                }, {
                    'src': 'img/thumbnail/4.jpg',
                    'name': '零部件实验室'
                }, {
                    'src': 'img/thumbnail/5.jpg',
                    'name': 'TUV莱茵'
                }]
            },
            beforeCreate: function () {
                if (navigator.userAgent.match(/(iPhone|iPod|Android|ios)/i)) {
                }
                // 防止 PC 端打开行为 => 跳转 PC 端(必填)
                else {
                    window.location.href = "http://192.168.100.70/PC/laiyin_pc/examples/main.html";
                    // window.location.href = "https://ftplayer.cdflytu.com/laiyinpc/examples/main.html";
                }
            },
            created: function () {
                let that = this;

                let token = this.getQueryVariable('token');
                this.setCookie("token", token, 7);

                // 检测当前是否有用户登录
                $.ajax({
                    type: "get",
                    url: this._data.baseUrl + '/api/user/weixin/login/isLogin/',
                    async: false,
                    beforeSend: function (request) {
                        request.setRequestHeader("token", token);
                    },
                    success: function (res) {
                        that._data.isLogin = res.result.islogin;
                        that._data.loginUser = res.result;
                    },
                    error: function (err) {
                        console.log(err)
                    }
                });

                window.addEventListener("storage", function (e) {
                    if (e.storageArea.changeTo == "true") {
                        if (that.showList + 1 < 15) {
                            that.changeSelect(that.showList + 1);
                        }
                    }
                });
                // 浏览器离线(断网行为)
                window.addEventListener('offline', () => {
                    this.offline();
                })
            },
            mounted: function () {
                this.changeFontSize();
                this.thumbnailNameScroll();
                this.communicationValue();
                this.selectDefinition();
                this.turnOnGyro();
                this.disabledNewlineCharacter();
                // 未登录
                if (!this.isLogin) {
                    this.$refs.login.onclick = () => {
                        $("#signIn").show();
                        window.location.href = this.loginNeed + '?from=' + this.encodeUrl;
                    }
                }

                // 登录成功
                if (this.isLogin) {
                    // 填充menu栏的用户信息
                    $('#menu .top .avatar img').attr("src", this.loginUser.wxHeadImgUrl);
                    $('#menu .top .nickName').text(this.loginUser.wxNickname);

                    // 填充评论列表
                    this.fillCommentList();

                    // 上拉加载更多
                    this.loadMore();
                    this.refresh();
                }

                // 进入视频
                this.$refs.go.onclick = () => {
                    this.$options.methods.openingPageDisappear();
                    this.$refs.head.remove();
                };

                // 操作指示
                this.$refs.btn.onclick = () => {
                    this.$refs.pop.style.display = 'none';
                };
                // 分享指示
                this.$refs.okay.onclick = () => {
                    this.$refs.shareInstructionPage.style.display = "none";
                };
                // menu栏的关闭按钮
                this.$refs.closeMenu.onclick = () => {
                    this.$refs.menu.style.display = "none";
                };
                // menu => 开启settingPage页
                this.$refs.setting.onclick = () => {
                    this.$refs.menu.style.display = "none";
                    this.$refs.settingPage.style.display = "block";
                };
                // menu => 关闭settingPage页
                this.$refs.closeSetting.onclick = () => {
                    this.$refs.settingPage.style.display = "none";
                    this.$refs.menu.style.display = "block";
                };
                // menu => 开启 definitionPage页
                this.$refs.definition.onclick = () => {
                    this.$refs.menu.style.display = "none";
                    this.$refs.definitionPage.style.display = "block";
                };
                // menu => 关闭definitionPage页
                this.$refs.closeDefinition.onclick = () => {
                    this.$refs.definitionPage.style.display = "none";
                    this.$refs.menu.style.display = "block";
                };
                // menu => 关闭commentPage页
                this.$refs.closeComment.onclick = () => {
                    this.$refs.commentPage.style.display = "none";
                    // $("#app #commentPage").fadeOut(300);
                };
                this.$refs.k4.onclick = () => {
                    this.switchingDefinition("4K");
                };
                this.$refs.p1080.onclick = () => {
                    this.switchingDefinition("1080");

                };
                this.$refs.p720.onclick = () => {
                    this.switchingDefinition("720");
                };
            },
            updated: function () { },
            methods: {
                // 下拉刷新
                refresh() {
                    let that = this;
                    let self = $("#commentPage .detail");
                    let _start, down_start, _end, down_end, down_selfTop;
                    self.on("touchstart", function (e) {
                        down_start = null;
                        down_end = null;

                        down_selfTop = $(this).scrollTop();
                        let touch = e.targetTouches[0];
                        _start = touch.pageY;
                        if (down_selfTop == 0) {
                            down_start = touch.pageY;
                        }
                    });

                    self.on("touchmove", function (e) {
                        e.preventDefault();
                        let touch = e.targetTouches[0];
                        _end = touch.pageY - _start;
                        down_start && (down_end = touch.pageY - down_start);
                        if (_end > 0 && $(this).scrollTop() > 0) {
                            down_selfTop > _end ? $(this).scrollTop(down_selfTop - _end) : $(this).scrollTop(0);
                        }
                        if (down_end && down_end > 0 && $(this).scrollTop() == 0) {
                            $("#commentPage .detail #pull-down").height(down_end);
                            if (down_end >= 60) {
                                $("#commentPage .detail .pull-down-content").text("释放立即刷新");
                            }
                        }
                    });

                    self.on("touchend", function (e) {
                        if (down_end && down_end >= 60) {
                            $("#commentPage .detail .pull-down-content").text("正在刷新...");
                            setTimeout(() => {
                                that.fillCommentList();
                            }, 300)
                        } else {
                            $("#commentPage .detail #pull-down").height(0);
                        }
                    })
                },
                // 上拉加载
                loadMore() {
                    let that = this;
                    let self = $("#commentPage .detail");
                    // listBox的实际高度
                    let obj = $("#commentPage #listBox");
                    let _start, up_start, _end, up_end, up_selfTop, _end_abs, up_end_abs;
                    self.on("touchstart", function (e) {
                        up_start = null;
                        up_end = null;
                        up_end_abs = null;

                        up_selfTop = $(this).scrollTop();
                        let touch = e.targetTouches[0];
                        _start = touch.pageY;
                        if (($(this).scrollTop() + $(this).height()) >= obj.outerHeight()) {
                            up_start = touch.pageY;
                        }
                    });

                    self.on("touchmove", function (e) {
                        e.preventDefault();
                        let touch = e.targetTouches[0];
                        _end = touch.pageY - _start;
                        up_start && (up_end = touch.pageY - up_start);
                        _end_abs = Math.abs(_end);
                        up_end && (up_end_abs = Math.abs(up_end));
                        if (_end < 0 && ($(this).scrollTop() + $(this).height()) < obj.outerHeight()) {
                            $(this).scrollTop(up_selfTop + _end_abs);
                        }
                        if (up_end && up_end < 0 && ($(this).scrollTop() + $(this).height()) >= obj.outerHeight() && that.pageNo < Number(that.pageTotal)) {
                            $("#commentPage .detail #pull-up").height(up_end_abs);
                            $(this).scrollTop(up_selfTop + up_end_abs);
                        }
                    });

                    self.on("touchend", function (e) {
                        // 所有评论 all-in => 继续上滑
                        if (($(this).scrollTop() + $(this).height()) == obj.outerHeight() && that.pageNo == Number(that.pageTotal)) {
                            let releaseStatus = $("#commentPage #releaseFeedback");
                            releaseStatus.text("没有更多内容啦!");
                            releaseStatus.show();
                            setTimeout(() => {
                                releaseStatus.hide();
                            }, 1200);
                        }
                        if (up_end_abs && up_end_abs >= 60 && that.pageNo < Number(that.pageTotal)) {
                            that.pageNo += 1;
                            $.ajax({
                                type: "get",
                                url: that.loginBaseUrl + '/api/video/video-page/videoComment/' + '?videoKey=' + that.videoKey + '&pageNo=' + that.pageNo + '&pageSize=' + that.pageSize,
                                async: false,
                                beforeSend: function (request) {
                                    request.setRequestHeader("token", that.getCookie("token"));
                                },
                                success: function (res) {
                                    let a = res.result.list;
                                    // 评论解码
                                    let b = a.map((item) => {
                                        let commentCont = item.commentContent;
                                        item.commentContent = that.en_de_code().decode(commentCont);
                                        return item;
                                    })
                                    that.commentList = that.commentList.concat(b);
                                    that.commentCount = res.result.page.totalNum;
                                    that.pageTotal = res.result.page.totalPage;
                                    if ($("#commentPage .detail #pull-up").height() > 0) {
                                        setTimeout(() => {
                                            $("#commentPage .detail #pull-up").height(0);
                                        }, 300);
                                    }
                                },
                                error: function (err) {
                                    console.log(err)
                                }
                            })
                        } else {
                            $("#commentPage .detail #pull-up").height(0);
                        }
                    });
                },
                // 填充评论列表
                fillCommentList() {
                    let that = this;
                    $.ajax({
                        type: "get",
                        url: this.loginBaseUrl + '/api/video/video-page/videoComment/' + '?videoKey=' + that.videoKey + '&pageNo=1' + '&pageSize=' + that.pageSize,
                        async: false,
                        cache: false,
                        beforeSend: function (request) {
                            request.setRequestHeader("token", that.getCookie("token"));
                        },
                        success: function (res) {
                            if ($("#commentPage .detail #pull-down").height() > 0) {
                                $("#commentPage .detail .pull-down-content").text("刷新成功");
                                setTimeout(() => {
                                    $("#commentPage .detail #pull-down").height(0);
                                    $("#commentPage .detail .pull-down-content").text("下拉刷新");
                                }, 800);
                            }
                            // 评论解码
                            let newCommentList = res.result.list.map((item) => {
                                let commentCont = item.commentContent;
                                item.commentContent = that.en_de_code().decode(commentCont);
                                return item;
                            })
                            that.commentList = newCommentList;
                            that.commentCount = res.result.page.totalNum;
                            that.pageTotal = res.result.page.totalPage;
                            // 移除暂无评论提示
                            if (Number(that.commentCount) > 0) {
                                $("#commentPage .detail").css("background-image", "url()");
                            }

                        },
                        error: function (err) {
                            console.log(err)
                        }
                    });
                },
                // 评论发布
                sendComment() {
                    let that = this;
                    let contentOriginal = $("#commentPage .footer textarea").val();

                    // 清除空格
                    content = contentOriginal.replace(/\s/g, "");

                    if (content == null || content == "") {
                        alert("评论不能为空!");
                    } else {
                        // 发布行为 => 添加评论api
                        $.ajax({
                            type: "post",
                            url: this.loginBaseUrl + '/api/video/video-page/addComment/',
                            contentType: "application/json",
                            data: JSON.stringify({
                                "videoKey": that.videoKey,
                                "content": contentOriginal
                            }),
                            async: false,
                            beforeSend: function (request) {
                                request.setRequestHeader("token", that.$options.methods.getCookie("token"));
                            },
                            success: function (res) {
                                if (res.result.success == true) {
                                    $("#commentPage .footer textarea").val("");
                                    // 重新拉取评论
                                    that.fillCommentList();
                                    // 重置 pageNo =>  发布评论之后重置上拉行为
                                    that.pageNo = 1;
                                    // 发布之后回到顶部
                                    $("#commentPage .detail").scrollTop(0);

                                    let releaseStatus = $("#commentPage #releaseFeedback");
                                    if (res.result.publishStatus === "apply") {
                                        releaseStatus.text("评论已经提交,等待审核中!")
                                        releaseStatus.show();
                                        setTimeout(() => {
                                            releaseStatus.hide();
                                        }, 2000)
                                    } else if (res.result.publishStatus === "published") {
                                        releaseStatus.text("评论发布成功!")
                                        releaseStatus.show();
                                        setTimeout(() => {
                                            releaseStatus.hide();
                                        }, 2000)
                                    }
                                }
                            },
                            error: function (err) {
                                console.log(err)
                            }
                        });
                    }
                },
                getCid(e) {
                    let that = this;
                    let commentId = e.target.getAttribute('data-cid');

                    if ($("[data-cid='" + commentId + "']").hasClass('active')) {
                        console.log("22222222222")
                        // 取消评论点赞
                        $.ajax({
                            type: "post",
                            url: this.loginBaseUrl + '/api/video/video-page/removeCommentLike/',
                            contentType: "application/json",
                            data: JSON.stringify({
                                "commentId": commentId
                            }),
                            async: false,
                            beforeSend: function (request) {
                                request.setRequestHeader("token", that.getCookie("token"));
                            },
                            success: function (res) {
                                if (res.result) {
                                    let newCommentList = that.commentList.map((item) => {
                                        if (item.commentId == commentId) {
                                            item.liked = false;
                                            item.likeAmount = Number(item.likeAmount) - 1;
                                        }
                                        return item;
                                    })
                                    that.commentList = newCommentList;
                                }
                            },
                            error: function (err) {
                                console.log(err)
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
                            beforeSend: function (request) {
                                request.setRequestHeader("token", that.getCookie("token"));
                            },
                            success: function (res) {
                                if (res.result) {
                                    let newCommentList = that.commentList.map((item) => {
                                        if (item.commentId == commentId) {
                                            item.liked = true;
                                            item.likeAmount = Number(item.likeAmount) + 1;;
                                        }
                                        return item;
                                    })
                                    that.commentList = newCommentList;
                                }
                            },
                            error: function (err) {
                                console.log(err)
                            }
                        });
                    }
                },

                // ==================================================================================

                setCookie(cname, cvalue, exdays) {
                    let d = new Date();
                    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
                    let expires = "expires=" + d.toGMTString();
                    document.cookie = cname + "=" + cvalue + "; " + expires;
                },

                getCookie(cname) {
                    let name = cname + "=";
                    let ca = document.cookie.split(';');
                    for (let i = 0; i < ca.length; i++) {
                        let c = ca[i].trim();
                        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
                    }
                    return "";
                },

                // 通过url获取token值
                getQueryVariable(variable) {
                    let query = window.location.search.substring(1);
                    let vars = query.split("&");
                    for (let i = 0; i < vars.length; i++) {
                        let pair = vars[i].split("=");
                        if (pair[0] == variable) {
                            return pair[1];
                        }
                    }
                    return (false);
                },

                en_de_code() {
                    return Base64 = {
                        _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
                        encode: function (e) {
                            let t = "";
                            let n, r, i, s, o, u, a;
                            let f = 0;
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
                                    u = a = 64
                                } else if (isNaN(i)) {
                                    a = 64
                                }
                                t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a)
                            }
                            return t
                        },
                        decode: function (e) {
                            let t = "";
                            let n, r, i;
                            let s, o, u, a;
                            let f = 0;
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
                                    t = t + String.fromCharCode(r)
                                }
                                if (a != 64) {
                                    t = t + String.fromCharCode(i)
                                }
                            }
                            t = Base64._utf8_decode(t);
                            return t
                        },
                        _utf8_encode: function (e) {
                            e = e.replace(/rn/g, "n");
                            let t = "";
                            for (let n = 0; n < e.length; n++) {
                                let r = e.charCodeAt(n);
                                if (r < 128) {
                                    t += String.fromCharCode(r)
                                } else if (r > 127 && r < 2048) {
                                    t += String.fromCharCode(r >> 6 | 192);
                                    t += String.fromCharCode(r & 63 | 128)
                                } else {
                                    t += String.fromCharCode(r >> 12 | 224);
                                    t += String.fromCharCode(r >> 6 & 63 | 128);
                                    t += String.fromCharCode(r & 63 | 128)
                                }
                            }
                            return t
                        },
                        _utf8_decode: function (e) {
                            let t = "";
                            let n = 0;
                            let r = c1 = c2 = 0;
                            while (n < e.length) {
                                r = e.charCodeAt(n);
                                if (r < 128) {
                                    t += String.fromCharCode(r);
                                    n++
                                } else if (r > 191 && r < 224) {
                                    c2 = e.charCodeAt(n + 1);
                                    t += String.fromCharCode((r & 31) << 6 | c2 & 63);
                                    n += 2
                                } else {
                                    c2 = e.charCodeAt(n + 1);
                                    c3 = e.charCodeAt(n + 2);
                                    t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
                                    n += 3
                                }
                            }
                            return t
                        }
                    }
                },
                // =======================================================================================

                changeSelect(index) {
                    $(".img-list").first().hide();
                    if (index != this.showList) {
                        console.log('热点事件函数changeselect()触发')
                        this.showList = index;
                    }
                },

                // 缩略图 底部文字溢出 => 来回滚动
                thumbnailNameScroll() {
                    let nameArray = document.getElementsByClassName('thumbnailName');
                    for (let i = 0; i < nameArray.length; i++) {
                        let ele = nameArray[i];
                        let nameTrimSize = ele.offsetWidth;
                        let nameTextSize = ele.scrollWidth;
                        let control = true;
                        let t = setInterval(rollLeft, 100);

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

                    }
                },

                // 动态获取设备屏幕宽度 => Element adaptation
                changeFontSize() {
                    document.querySelector('html').style.fontSize = document.documentElement.clientWidth / 750 * 16 + 'px';
                },

                // 开屏页消失
                openingPageDisappear() {
                    let dom = $('#openingPage');
                    dom.fadeOut();
                },

                // 第一次进入项目设置通信值
                communicationValue() {
                    sessionStorage.setItem("key", "1");
                    sessionStorage.setItem("sharpness", "4K");
                },

                // 清晰度选择 => css跟随
                selectDefinition() {
                    $('#definitionPage .center .specific').map(function () {
                        $(this).on('click', function () {
                            $(this).addClass('active').siblings().removeClass('active');
                        })
                    })
                },

                turnOnGyro() {
                    $('#cmn-toggle').change(function () {
                        // prop()函数用于设置或返回当前jQuery对象所匹配的元素的属性值,复选框被选中时
                        if ($(this).prop("checked")) {
                            sessionStorage.setItem("isTurnOn", true);
                        } else {
                            sessionStorage.setItem("isTurnOn", false);
                        }
                    })
                },
                // 清晰度切换
                switchingDefinition(param) {
                    if (sessionStorage.getItem("sharpness") !== param) {
                        document.getElementById('ifm').contentWindow.location.reload();
                        sessionStorage.setItem("sharpness", param);
                        // 设置key来告诉test,用户非首次进入
                        sessionStorage.setItem("key", null);
                        // pause状态下切换清晰度 => 强制隐藏imglist => 防止误触
                        this.$refs.imglist.style.display = "none";
                        $("#definitionPage").hide();
                    }
                },
                // 禁用换行符
                disabledNewlineCharacter() {
                    $("#commentPage .footer textarea").keypress(function (event) {
                        if (event.which == '13') {
                            return false;
                        }
                    })
                },
                // 离线工作提醒
                offline() {
                    $("#offline").show();
                    setTimeout(() => {
                        $("#offline").hide();
                    }, 2000);
                }
            },
            watch: {}
        });
    }
}();
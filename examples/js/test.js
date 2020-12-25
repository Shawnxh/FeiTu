// 登录之前的api前缀
const baseUrl = "http://192.168.100.70/open"; // https://backtest.cdflytu.com
//登录之后的api前缀
const loginBaseUrl = "http://192.168.100.70/login_open";
// 项目视频识别 videoKey
const videoKey = "22e3fae115bd48a8b84db72a57eee061";
// 登录行为 => 跳转api地址
const loginNeed = "https://backtest.cdflytu.com/open/api/user/weixin/login/userInfoLogin/";
//存储是否有用户登录的状态
let isLogin = "";
// 存储视频点赞数 => 用户操作 thumbUp 会用到
let likedAmount;
// 编码登录成功后的返回地址
let linkUrl = encodeURIComponent(window.parent.location.href + "?time=1111");

let vr = null
let scene = null
let renderer = null
let container = null
// 存取iphone端土司提示定时器 => 用于优化对用户不断点击产生过多一次性定时器的的问题
let toast;

window.onload = function () {
    initTest();
    setTimeout(() => {
        init(getParam(window.location.search, 'video'));
        PageAnimation();
        showPage();
        byValue();
        fullScreen();
        turnOnGyro();
        $('#full_feature1').swipeslider();
        $('#full_feature2').swipeslider();
        $('#full_feature3').swipeslider();
    }, 100)
}

let theUrl = '';

function init(url) {
    theUrl = url ? url : '1.mp4';
    //renderer = new THREE.WebGLRenderer();
    vr = null
    scene = null
    renderer = null
    container = null
    AVR.debug = true;
    if (!AVR.Broswer.isIE() && AVR.Broswer.webglAvailable()) {
        renderer = new THREE.WebGLRenderer();
    } else {
        renderer = new THREE.CanvasRenderer();
    }
    renderer.setPixelRatio(window.devicePixelRatio);
    container = document.getElementById('app');
    container.appendChild(renderer.domElement);
    let switchContainer = null;
    scene = new THREE.Scene();

    // fov 选项可调整初始视频远近
    vr = new VR(scene, renderer, container, {
        "fov": 90
    });

    vr.vrbox.radius = 600;
    if (AVR.isCrossScreen()) {
        // 调整vr视窗偏移量
        vr.effect.separation = 1.2;
    }

    // vr 视频源拉取完成
    vr.loadProgressManager.onLoad = function () {
        localStorage.setItem("changeTo", false);

        // 开屏页loading 消失 => 开屏页 go 显示
        if ($('#openingPage .loading', parent.document) || $('#openingPage .loading', parent.document).css("display") == "block") {
            $('#openingPage .loading', parent.document).hide();
            setTimeout(() => {
                $('#openingPage .go', parent.document).show();
            }, 300);
        }
    }
    vr.init(function () { });

    let sharpness = sessionStorage.getItem("sharpness");
    // 加载全景视频
    vr.play(('./video/' + sharpness + '/' + theUrl), vr.resType.video);

    window.addEventListener('resize', function () {
        let isHuawei = navigator.userAgent.match(/;\sHUAWEI\s[a-zA-Z0-9\-]+\sBuild\//);
        if (AVR.OS.isWeixin() && !AVR.OS.isiOS() && isHuawei) {
            if (vr.video.getAttribute('x5-video-orientation') == "landscape") {
                vr.toolBar.toolbar.style.width = document.body.clientWidth + "px";

            } else {
                vr.toolBar.toolbar.style.width = "100%";
            }
        }
    })

    if (theUrl.split(".")[0] < 6) {
        container.addEventListener('click', function (e) {
            hotIconEvt();
        });

        function hotIconEvt() {
            if (switchContainer && switchContainer.type == 'fromPopUp1') {
                showPop(1);
            } else if (switchContainer && switchContainer.type == 'fromBeacon2_left') {
                localStorage.setItem("changeTo", true);
            } else if (switchContainer && switchContainer.type == 'fromPopUp2_1') {
                showPop(1);
            } else if (switchContainer && switchContainer.type == 'fromPopUp2_2') {
                showPop(2);
            } else if (switchContainer && switchContainer.type == 'fromPopUp2_3') {
                showPop(3);
            }
        }

        vr.container.addEventListener("mousemove", function (e) {
            util.bindRaycaster(e, {
                success: function (obj) {
                    if (obj[0].object.name == "popUp1") {
                        document.body.style.cursor = "pointer";
                        switchContainer = {
                            'type': 'fromPopUp1'
                        }
                    } else if (obj[0].object.name == "beacon2_left") {
                        document.body.style.cursor = "pointer";
                        switchContainer = {
                            'type': 'fromBeacon2_left'
                        }
                    } else if (obj[0].object.name == "popUp2_1") {
                        document.body.style.cursor = "pointer";
                        switchContainer = {
                            'type': 'fromPopUp2_1'
                        }
                    } else if (obj[0].object.name == "popUp2_2") {
                        document.body.style.cursor = "pointer";
                        switchContainer = {
                            'type': 'fromPopUp2_2'
                        }
                    } else if (obj[0].object.name == "popUp2_3") {
                        document.body.style.cursor = "pointer";
                        switchContainer = {
                            'type': 'fromPopUp2_3'
                        }
                    } else {
                        switchContainer = null;
                        document.body.style.cursor = "auto";
                    }
                },
                empty: function () {
                    vr.cameraEvt.leave();
                    document.body.style.cursor = "auto";
                    switchContainer = null;
                }
            })
        }, false)

        let util = new VRUtils(vr);
        // 1.video
        util.markIcon("textures/discount.png", new THREE.Vector3(-4, 0, 12), 'popUp1', '莱茵集团', 1, 1);
        // 2.video
        util.markIcon("textures/right.png", new THREE.Vector3(-5, -2, 7), 'beacon2_left', '实验室二楼', 1, 1);
        util.markIcon("textures/discount.png", new THREE.Vector3(-5, 0, 10), 'popUp2_1', '环境测试', 1, 1);
        util.markIcon("textures/discount.png", new THREE.Vector3(5, 0, 10), 'popUp2_2', '稳态模拟器', 1, 1);
        util.markIcon("textures/discount.png", new THREE.Vector3(-6, -1, 10), 'popUp2_3', '机械载荷测试', 1, 1);


        animate();
        function animate() {
            requestAnimationFrame(animate);
            if (AVR.isCrossScreen()) {
                // cameraEvent.updatePosition();
            } else {
                util.markIconInViews();
                if (vr.markIconGroup) {
                    for (let i = 0; i < vr.markIconGroup.children.length; i++) {
                        vr.markIconGroup.children[i].lookAt(vr.vr.camera.position);
                    }
                }
            }
        }
    }

    // 热点logic => Fn处理
    getMarkIconObj();
    // 陀螺仪选中功能 => css表现Fn
    selected();

    // 用于测试热点添加的事件
    // setInterval(() => {
    //     console.log(vr.video.currentTime);
    // }, 1000)
}

// 热点逻辑处理
function getMarkIconObj() {
    // Mesh OBJ
    let popBeacon1 = scene.getObjectByName("popUp1");
    let popBeacon2_1 = scene.getObjectByName("popUp2_1");
    let popBeacon2_2 = scene.getObjectByName("popUp2_2");
    let popBeacon2_3 = scene.getObjectByName("popUp2_3");

    let hotBeacon2_left = scene.getObjectByName("beacon2_left");

    // Tip DOM
    let popBeaconTip1 = document.getElementById("popUp1");
    let popBeaconTip2_1 = document.getElementById("popUp2_1");
    let popBeaconTip2_2 = document.getElementById("popUp2_2");
    let popBeaconTip2_3 = document.getElementById("popUp2_3");

    let hotBeaconTip2_left = document.getElementById("beacon2_left");

    // 获取currentUrl,用于判断 hotBeacon的显示与隐藏
    let urlCurrent = (window.parent.document.getElementsByClassName('ifm')[1] ? window.parent.document.getElementsByClassName('ifm')[1] : window.parent.document.getElementsByClassName('ifm')[0]).contentWindow.location.href;
    // let urlC = Number(((urlCurrent.split('?')[1]).split('=')[1]).split('.')[0]);
    let urlC = Number((urlCurrent.split('=')[1]).split('.')[0]);

    console.log(urlC);
    // console.log(urlCurrent);

    // 控制热点在任意时间出现,传入三个参数
    // beacon: 热点dom对象;  tip:对应dom的tip文字注释; 
    // seconds1:显示时间(s为单位)
    // seconds2:隐藏时间
    function whenView(beacon, tip, seconds1, seconds2) {
        setInterval(() => {
            let time = vr.video.currentTime;
            // 在视频第3秒出现热点图标
            if (time > seconds1) {
                beacon.visible = true;
                tip.style.position = "absolute";
            }

            if (time > seconds2) {
                beacon.visible = false;
                tip.style.position = "";
            }


        }, 1000)
    }


    // 隐藏热点按钮Fn
    function hideHotBeacon() {
        popBeacon1.visible = false;
        popBeaconTip1.style.position = "";

        hotBeacon2_left.visible = false;
        hotBeaconTip2_left.style.position = "";
        popBeacon2_1.visible = false;
        popBeaconTip2_1.style.position = "";
        popBeacon2_2.visible = false;
        popBeaconTip2_2.style.position = "";
        popBeacon2_3.visible = false;
        popBeaconTip2_3.style.position = "";
    }

    if (urlC == 1) {
        $('#scenarioName').text('莱茵光伏实验室');
        afterPopUp(0, 1);

        hideHotBeacon();
        whenView(popBeacon1, popBeaconTip1, 25, 31);

        if (sessionStorage.getItem("key") == "1") {
            // firstPageAnimation();
        } else {
            removeImgListAnimation();
        }


    } else if (urlC == 2) {
        sessionStorage.setItem("key", "2");
        $('#scenarioName').text('实验室一楼');
        afterPopUp(1, 1);
        afterPopUp(2, 2);
        afterPopUp(3, 3);

        hideHotBeacon();
        whenView(hotBeacon2_left, hotBeaconTip2_left, 75, 91);
        whenView(popBeacon2_1, popBeaconTip2_1, 2, 17);
        whenView(popBeacon2_2, popBeaconTip2_2, 21, 29);
        whenView(popBeacon2_3, popBeaconTip2_3, 35, 47);

        removeImgListAnimation();
    } else if (urlC == 3) {
        sessionStorage.setItem("key", "3");
        $('#scenarioName').text('实验室二楼');
        hideHotBeacon();

        removeImgListAnimation();
    } else if (urlC == 4) {
        sessionStorage.setItem("key", "4");
        $('#scenarioName').text('零部件实验室');
        hideHotBeacon();

        removeImgListAnimation();
    } else if (urlC == 5) {
        sessionStorage.setItem("key", "5");
        $('#scenarioName').text('TUV莱茵');
        hideHotBeacon();

        removeImgListAnimation();
    } else {
        hideHotBeacon();

        removeImgListAnimation();
    }
}

function getParam(url, name) {
    let reg = new RegExp("[^\?&]?" + encodeURI(name) + "=[^&]+");
    let arr = url.match(reg);
    if (arr != null) {
        return decodeURI(arr[0].substring(arr[0].search("=") + 1));
    }
    return "";
}


function continuePlay() {
    document.getElementById("pop1").style.cssText = "display:none;";
    document.getElementById("pop2").style.cssText = "display:none;";
    document.getElementById("pop3").style.cssText = "display:none;";
}

// i : 显示第几个轮播图demo
function showPop(i) {
    // $(".playBtn1")[0].click();
    let popId = "#pop" + i;
    $(popId).css('display', 'flex');
}

/*
 *
 * Note:弹窗的内容填充发生在页面初始化时
 * Index:图片数据在数组中的的索引值
 * assign:指定将index的数据填充进入哪个pop中
 *
 */
function afterPopUp(index, assign) {
    // which存储轮播图内部相关dom的索引,即 索引= 实际的pop在pop序列中的位置 -1
    let which = assign - 1;
    let titleID = "#title" + assign;
    $(titleID).text(title[index]);
    document.getElementsByClassName('text')[which].innerText = text[index];
    let ul = $(".sw-slides")[which];
    for (let i = 0; i < imgUrl[index].length; i++) {
        let parent = $("<li></li>");
        parent.addClass("sw-slide");
        let child = $("<img>");
        child.attr("src", imgUrl[index][i]);

        child.appendTo(parent);
        parent.appendTo(ul);
    }
}


// 控制每次进入video时 => 工具栏的动画执行
function PageAnimation() {
    $('#openingPage .go', parent.document).on('click', () => {
        $('._toolBarBtn').click();
        $('._toolBarPV').css('animation', 'PV 0.5s ease 0.5s 1 forwards');
        $('._toolBarScenario').css('animation', 'scenario 0.5s ease 0.5s 1 forwards');

        $('._toolBarShare').css('animation', 'share 0.5s ease 0.5s 1 forwards');
        $('._toolBarMsg').css('animation', 'msg 0.5s ease 0.5s 1 forwards');
        $('._toolBarThumbUpBox').css('animation', 'thumbUpBox 0.5s ease 0.5s 1 forwards');
        $('._toolBarMore').css('animation', 'more 0.5s ease 0.5s 1 forwards');

        $('._toolBarBack').css('animation', 'back 0.5s ease 0.5s 1 forwards');
        $('._toolBarBtn').css('animation', 'btn 0.5s ease 0.5s 1 forwards');
        $('._toolBarMenu').css('animation', 'menu 0.5s ease 0.5s 1 forwards');

        $('.img-list', parent.document).css('animation', 'imgList 0.5s ease 0.1s 1 forwards');

    })
}

// 控制 main 页面的 img-list 在切换清晰度的时候不会被唤起
// 控制 test 页面在 video pause时刷新 => imgList始终显示
function removeImgListAnimation() {
    $('.img-list', parent.document).css('animation', '');
}

// 工具栏上的gyro功能 => css表现
function selected() {
    if ($('._toolBarGyro')) {
        $('._toolBarGyro').on('click', function () {
            let obj = $(this);
            if (obj.hasClass('active')) {
                obj.removeClass('active');
                resetEnable();
            } else {
                obj.addClass('active');
                resetDisabled();
            }
        })
    }
}

// 开启陀螺仪总开关
function turnOnGyro() {
    if (sessionStorage.getItem("isTurnOn") === "true") {
        $('._toolBarGyro').click();
    }
}

// 禁用 重置定位 
function resetDisabled() {
    let parent = $("._toolBarMore");
    let child = $("<div></div>");
    child.css({
        "width": "100%", "height": "3rem", "position": "absolute", "bottom": "1.4rem"
    });
    child.attr("id", "shelter");
    child.appendTo(parent);
    $('._toolBarReset').css({ "background": "url('./img/home/reset_disable.png') no-repeat", "backgroundSize": "2.625rem 2.625rem" });
}

// 恢复 重置定位
function resetEnable() {
    if ($("#shelter")) {
        $("#shelter").remove();
    };
    $('._toolBarReset').css({ "background": "url('./img/home/reset.png') no-repeat", "backgroundSize": "2.625rem 2.625rem" });
}

// 判断是否登录 给 test 页面的工具栏绑定事件
function showPage() {
    $('._toolBarShare').on('click', () => {
        $('#shareInstructionPage', parent.document).show();

    });

    $('._toolBarMenu').on('click', () => {
        $('#menu', parent.document).show();
    });

    // 判断登录状态
    loginLogic();

    $('._toolBarBack').on('click', () => {
        window.parent.location.href = 'https://ftplayer.cdflytu.com';
    });

}

// 全屏处理
function fullScreen() {
    let ua = navigator.userAgent;
    if (ua.match(/iPhone|iPod/i) != null) {
        $('._toolBarZoomIn').on('click', () => {
            $('#toast', parent.document).show();
            if (toast) {
                clearTimeout(toast);
            }
            toast = setTimeout(() => {
                $('#toast', parent.document).hide();
            }, 2500);
        })
    } else if (ua.match(/Android/i) != null) {
        $('._toolBarZoomIn').on('click', () => {
            requestFullScreen();

            $('._toolBarArea ._toolBarZoomOut').show();

            $('._toolBarArea ._toolBarPV').hide();
            $('._toolBarArea ._toolBarMsg').hide();
            $('._toolBarArea ._toolBarShare').hide();
            $('._toolBarArea ._toolBarThumbUpBox').hide();
            $('._toolBarArea ._toolBarMore').hide();
            $('._toolBarArea ._toolBarBack').hide();
            $('._toolBarArea ._toolBarBtn').hide();
            $('._toolBarArea ._toolBarMenu').hide();


            // 处理在pasue状态下的全屏
            $('.img-list', parent.document).css('animation', '');
        });
    } else if (ua.match(/iPad/i) != null) {
        console.log("ipad代码");
    }

    $('._toolBarZoomOut').on('click', () => {
        exitFullscreen();

        $('._toolBarArea ._toolBarZoomOut').hide();

        $('._toolBarArea ._toolBarPV').show();
        $('._toolBarArea ._toolBarMsg').show();
        $('._toolBarArea ._toolBarShare').show();
        $('._toolBarArea ._toolBarThumbUpBox').show();
        $('._toolBarArea ._toolBarMore').show();
        $('._toolBarArea ._toolBarBack').show();
        $('._toolBarArea ._toolBarBtn').show();
        $('._toolBarArea ._toolBarMenu').show();

        // 处理在pasue状态下的全屏
        $('.img-list', parent.document).css('animation', 'imgList 0.5s ease 0.1s 1 forwards');
    });
}


// ajax赋值 => video访问量/点赞数
function byValue() {
    $.ajax({
        type: "get",//这里还可以用于Post
        url: baseUrl + "/api/video/video-page/videoVisitAmount/" + "?videoKey=" + videoKey,
        success: function (data) {
            likedAmount = Number(data.result.likedAmount);
            $('._toolBarPV ._toolBarTotalPV').text("总访问量: " + data.result.totalAmount);
            $('._toolBarPV ._toolBarTodayPV').text("今日访问量: " + data.result.todayAmount);
            $('._toolBarThumbUpBox ._toolBarThumbUpValue').text(likedAmount);
        },
        error: function (err) {
            console.log(err);
        }
    });
}

// test每次刷新的初始化动画处理
function initTest() {
    document.querySelector('html').style.fontSize = document.documentElement.clientWidth / 750 * 16 + 'px';
    $('#openingPage', parent.document).show();
    $('#openingPage .go', parent.document).hide();
    $('#openingPage .loading', parent.document).show();
}


//进入全屏  
function requestFullScreen() {
    let element = document.documentElement;
    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
    } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
    }
}
//退出全屏  
function exitFullscreen() {
    let element = document;
    if (element.exitFullscreen) {
        element.exitFullscreen();
    } else if (element.msExitFullscreen) {
        element.msExitFullscreen();
    } else if (element.mozCancelFullScreen) {
        element.mozCancelFullScreen();
    } else if (element.webkitExitFullscreen) {
        element.webkitExitFullscreen();
    }

}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toGMTString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i].trim();
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}


// 用户登录
function loginLogic() {
    $.ajax({
        type: "get",
        url: baseUrl + '/api/user/weixin/login/isLogin/',
        async: false,
        beforeSend: function (request) {
            request.setRequestHeader("token", getCookie("token"));
        },
        success: function (res) {
            isLogin = res.result.islogin;
            // 未登录
            if (!isLogin) {
                $('._toolBarMsg').on('click', () => {
                    $("#signIn", parent.document).show();
                    window.parent.location.href = loginNeed + '?from=' + linkUrl;
                });
                $('._toolBarThumbUp').on('click', function () {
                    $("#signIn", parent.document).show();
                    window.parent.location.href = loginNeed + '?from=' + linkUrl;
                })
            }

            // 登录成功
            if (isLogin) {
                $('._toolBarMsg').on('click', () => {
                    $('#commentPage', parent.document).show();
                });
                thumbUpLogic();
                thumbUpSelect();

            }
        },
        error: function (err) {
            console.log(err)
        }
    });
}

// 该用户对于 video 是否点赞
function thumbUpLogic() {
    $.ajax({
        type: "get",
        url: loginBaseUrl + '/api/video/video-page/isVideoLike/' + "?videoKey=" + videoKey,
        async: false,
        beforeSend: function (request) {
            request.setRequestHeader("token", getCookie("token"));
        },
        success: function (res) {
            sessionStorage.setItem("videoLike", res.result);

            // 未点赞状态
            if (sessionStorage.getItem("videoLike") === "false") {
                if ($('._toolBarThumbUp').hasClass('active')) {
                    $('._toolBarThumbUp').removeClass('active');
                }
            };
            // 点赞状态
            if (sessionStorage.getItem("videoLike") === "true") {
                if ($('._toolBarThumbUp').hasClass('active')) {

                } else {
                    $('._toolBarThumbUp').addClass('active');
                }
            }
        },
        error: function (err) {
            console.log(err)
        }
    });
}


// 点赞 => 选择发起哪种请求
function thumbUpSelect() {
    $('._toolBarThumbUp').on('click', function () {
        if (sessionStorage.getItem("videoLike") === "false") {
            $.ajax({
                type: "post",
                url: loginBaseUrl + '/api/video/video-page/addVideoLike/',
                contentType: "application/json",
                data: JSON.stringify({ "videoKey": videoKey }),
                async: false,
                beforeSend: function (request) {
                    request.setRequestHeader("token", getCookie("token"));
                },
                success: function (res) {
                    let ThumbUp = res.result;
                    // 视频点赞
                    if (ThumbUp) {
                        if ($('._toolBarThumbUp').hasClass('active')) {

                        } else {
                            $('._toolBarThumbUp').addClass('active');
                        }
                        likedAmount += 1;
                        $('._toolBarThumbUpBox ._toolBarThumbUpValue').text(likedAmount);
                        sessionStorage.setItem("videoLike", true);
                    }
                },
                error: function (err) {
                    console.log(err)
                }
            });
        }
        else {
            $.ajax({
                type: "post",
                url: loginBaseUrl + '/api/video/video-page/removeVideoLike/',
                contentType: "application/json",
                data: JSON.stringify({ "videoKey": videoKey }),
                async: false,
                beforeSend: function (request) {
                    request.setRequestHeader("token", getCookie("token"));
                },
                success: function (res) {
                    let removeThumbUp = res.result;
                    // 取消视频点赞
                    if (removeThumbUp) {
                        if ($('._toolBarThumbUp').hasClass('active')) {
                            $('._toolBarThumbUp').removeClass('active');
                        }
                        likedAmount -= 1;
                        $('._toolBarThumbUpBox ._toolBarThumbUpValue').text(likedAmount);
                        sessionStorage.setItem("videoLike", false);
                    }
                },
                error: function (err) {
                    console.log(err)
                }
            });
        }
    })
}

// pop 赋值
var title = [];
title[0] = '莱茵集团';
title[1] = '环境测试';
title[2] = '稳态模拟器';
title[3] = '机械载荷测试';

var imgUrl = [];
imgUrl[0] = ['img/pop/laiyin1.jpg', 'img/pop/laiyin2.jpg', 'img/pop/laiyin3.jpg'];
imgUrl[1] = ['img/pop/laiyin4.jpg'];
imgUrl[2] = ['img/pop/laiyin5.jpg'];
imgUrl[3] = ['img/pop/laiyin6.jpg'];

var text = [];
text[0] = '自1872年成立以来，坚持为解决人类、环境和科技互动过程中出现的挑战开发安全持续的解决方案。德国莱茵TüV集团作为一个独立、公正和专业的机构，长期致力于营造一个同时符合人类和环境需要的美好未来。德国莱茵TÜV集团公司总部位于科隆，在全球61个国家设有490家分支机构，员工总数为17000人。集团共包含120多家公司。其中运营控股公司是TÜV Rheinland AG，TÜV Rheinland Berlin BrandenburgPfalz e.V.是单一股东。';
text[1] = '环境测试区可开展温度循环、光伏PID测试等服务，能模拟组件在极端恶劣条件下的工作表现。';
text[2] = '全亚洲最大的太阳能稳态模拟器，最多能容纳20块太阳能组建同时进行光筛测试，也能模拟出组建最真实的工作状态。';
text[3] = '机械载荷测试是为了确保光伏电站的可靠性，可测试组件在受到暴风、积雪等情况下的受力，并检测组件是否能够承受高强度的机械载荷，最高测试压强可达10000Pa。';

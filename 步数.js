// [rule: 刷步数]
// [rule: 步数]
var qq = GetUserID()
var tel1 = bucketGet('sbstel', qq)
var pwd1 = bucketGet('sbspwd', qq)
if (tel1 == '' || pwd1 == '') {
    sendText("未保存账号或密码，请根据提示操作！")
    tell()
} else {
    bs()
}
var MYAPP = {};

function tell() {
    sleep(1000)
    sendText("请在30秒内输入小米运动的手机号: ");
    mobile = input(30000);
    var arr = ['q', 'Q', '退出'];
    if (mobile && mobile.length === 11) {
        bucketSet('sbstel', qq, mobile)
        sendText("账号已记录\n如需修改请联系管理员")
        ps()
    } else if (arr.indexOf(mobile) != -1) {} else {
        sendText("输入有误, 请重新发送刷步数！");
    }
}

function ps() {
    sendText("请在30秒内输入密码: ")
    smscode = input(30000);
    sendText("密码已记录\n如需修改请联系管理员")
    bucketSet('sbspwd', qq, smscode)
    var arr = ['q', 'Q', '退出'];
    bs()
}

function bs() {
    sendText("请在30秒内输入刷取的步数: ")
    sbs = input(30000);
    var arr = ['q', 'Q', '退出'];
    main()
}

function main() {
    var tel = bucketGet('sbstel', qq)
    var pass = bucketGet('sbspwd', qq)
    var name = GetUsername()
    if (sbs > 90000) {
        var min = 19668,
                //最小步数
        max = 25000; //最大步数
        sbs = Math.floor(Math.random() * (max - min) + min); //随机步数
        sendText("不要超过90000\n给你改成随机步数+"sbs"+了")
    }
    var url2 = "https://api.kit9.cn/api/milletmotion/?mobile=" + tel + "&password=" + pass + "&step=" + sbs
    var date = request({
        url: url2,
        "dataType": "json"
    })
    if (date.code != 200) {
        sendText("用户名或密码输入错误")
        tell()
    } else if (date.code == 200) {
        sendText("用户名:" + name + "\n步数" + sbs + ",刷取成功")
    }
}
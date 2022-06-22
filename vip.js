// [rule: vip ?]
// [rule: vip ]
// 解析路线
var parseInterfaces = [{"name":"纯净/B站","url":"https://z1.m1907.cn/?jx=", "showType":3},
		{"name":"高速接口","url":"https://jsap.attakids.com/?url=", "showType":3},
		{"name":"综合/B站","url":"https://vip.parwix.com:4433/player/?url=", "showType":3},
		{"name":"OK解析","url":"https://okjx.cc/?url=", "showType":3},
		{"name":"夜幕","url":"https://www.yemu.xyz/?url=", "showType":3},
		{"name":"乐多资源","url":"https://api.leduotv.com/wp-api/ifr.php?isDp=1&vid=", "showType":3},
		{"name":"爱豆","url":"https://jx.aidouer.net/?url=", "showType":1},
		{"name":"虾米","url":"https://jx.xmflv.com/?url=", "showType":1},
		{"name":"M3U8.TV","url":"https://jx.m3u8.tv/jiexi/?url=", "showType":3},
		{"name":"人人迷","url":"https://jx.blbo.cc:4433/?url=", "showType":3},
		{"name":"全民","url":"https://jx.blbo.cc:4433/?url=", "showType":3},
		{"name":"七哥","url":"https://jx.mmkv.cn/tv.php?url=", "showType":3},
		{"name":"冰豆","url":"https://api.qianqi.net/vip/?url=", "showType":3},
		{"name":"迪奥","url":"https://123.1dior.cn/?url=", "showType":1},
		{"name":"CK","url":"https://www.ckplayer.vip/jiexi/?url=", "showType":1},
		{"name":"游艺","url":"https://api.u1o.net/?url=", "showType":1},
		{"name":"LE","url":"https://lecurl.cn/?url=", "showType":1},
		{"name":"ckmov","url":"https://www.ckmov.vip/api.php?url=", "showType":1},
		{"name":"playerjy/B站","url":"https://jx.playerjy.com/?url=", "showType":3},
		{"name":"ccyjjd","url":"https://ckmov.ccyjjd.com/ckmov/?url=", "showType":1},
		{"name":"爱豆","url":"https://jx.aidouer.net/?url=", "showType":1},
		{"name":"诺诺","url":"https://www.ckmov.com/?url=", "showType":1},
		{"name":"H8","url":"https://www.h8jx.com/jiexi.php?url=", "showType":1},
		{"name":"BL","url":"https://vip.bljiex.com/?v=", "showType":1},
		{"name":"解析la","url":"https://api.jiexi.la/?url=", "showType":1},
		{"name":"MUTV","url":"https://jiexi.janan.net/jiexi/?url=", "showType":1},
		{"name":"MAO","url":"https://www.mtosz.com/m3u8.php?url=", "showType":1},
		{"name":"老板","url":"https://vip.laobandq.com/jiexi.php?url=", "showType":1},
		{"name":"盘古","url":"https://www.pangujiexi.cc/jiexi.php?url=", "showType":1},
		{"name":"盖世","url":"https://www.gai4.com/?url=", "showType":1},
		{"name":"小蒋","url":"https://www.kpezp.cn/jlexi.php?url=", "showType":1},
		{"name":"YiTV","url":"https://jiexi.us/?url=", "showType":1},
		{"name":"星空","url":"http://60jx.com/?url=", "showType":1},
		{"name":"0523","url":"https://go.yh0523.cn/y.cy?url=", "showType":1},
		{"name":"17云","url":"https://www.1717yun.com/jx/ty.php?url=", "showType":1},
		{"name":"4K","url":"https://jx.4kdv.com/?url=", "showType":1},
		{"name":"云析","url":"https://jx.yparse.com/index.php?url=", "showType":1},
		{"name":"8090","url":"https://www.8090g.cn/?url=", "showType":1},
		{"name":"江湖","url":"https://api.jhdyw.vip/?url=", "showType":1},
		{"name":"诺讯","url":"https://www.nxflv.com/?url=", "showType":1},
		{"name":"PM","url":"https://www.playm3u8.cn/jiexi.php?url=", "showType":1},
		{"name":"奇米","url":"https://qimihe.com/?url=", "showType":1},
		{"name":"思云","url":"https://jx.ap2p.cn/?url=", "showType":1},
		{"name":"听乐","url":"https://jx.dj6u.com/?url=", "showType":1},
		{"name":"aijx","url":"https://jiexi.t7g.cn/?url=", "showType":1},
		{"name":"52","url":"https://vip.52jiexi.top/?url=", "showType":1},
		{"name":"黑米","url":"https://www.myxin.top/jx/api/?url=", "showType":1},
		{"name":"豪华啦","url":"https://api.lhh.la/vip/?url=", "showType":1},
		{"name":"凉城","url":"https://jx.mw0.cc/?url=", "showType":1},
		{"name":"33t","url":"https://www.33tn.cn/?url=", "showType":1},
		{"name":"180","url":"https://jx.000180.top/jx/?url=", "showType":1},
		{"name":"无名","url":"https://www.administratorw.com/video.php?url=", "showType":1},
		{"name":"黑云","url":"https://jiexi.380k.com/?url=", "showType":1},
		{"name":"九八","url":"https://jx.youyitv.com/?url=", "showType":1},
		{"name":"综合线路解析","url":"https://laisoyiba.com/mov/s/?sv=3&url=", "showType":1},
		{"name":"纯净/B站","url":"https://z1.m1907.cn/?jx=", "showType":1},
		{"name":"高速接口","url":"https://jsap.attakids.com/?url=", "showType":1},
		{"name":"综合/B站1","url":"https://vip.parwix.com:4433/player/?url=", "showType":1},
		{"name":"OK解析","url":"https://okjx.cc/?url=", "showType":1},
		{"name":"夜幕","url":"https://www.yemu.xyz/?url=", "showType":1},
		{"name":"虾米","url":"https://jx.xmflv.com/?url=", "showType":1},
		{"name":"全民","url":"https://jx.quanmingjiexi.com/?url=", "showType":1}]


function main() {
  var sec = param(1);
  var i = 0
  var reg = /^((ht|f)tps?):\/\/[\w-]+(\.[\w-]+)+([\w\-.,@?^=%&:/~+#]*[\w\-@?^=%&/~+#])?$/;
  var parseInterfacesName = parseInterfaces.map(function (v, i) {
    var num = i + 1
    return "" + num + "：" + v.name + ""
  }).join('\n')
  var parseInterfacesUrl = []

  while (sec == "" || sec) {
    i++
    if (i > 6) return sendText("输入错误次数过多，已退出。")
    if (sec === 'q') return sendText("已退出操作")
    if (!reg.test(sec) && !parseInterfacesUrl.length) {
      sendText("请输入正确的链接，输入q退出")
      sec = input()
    }
    else if (Number(sec) >= 0 && Number(sec) <= parseInterfaces.length) {
      sleep(1000)
      sendText("" + parseInterfacesUrl[Number(sec - 1)] + "")
      sec = input()
      return
    } else {
      !parseInterfacesUrl.length && (parseInterfacesUrl = parseInterfaces.map(function (v, i) {
        return parseInterfaces[i].url + sec
      }))
      sleep(1000)
      sendText("请您选择需要的线路(输入序号)，输入q退出\n" + parseInterfacesName + "")
      sec = input()
    }
  }

}

main()
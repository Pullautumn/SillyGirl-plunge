// [rule: epic]
// [rule: Epic]
// [cron: 30 11 * * *]

request('https://store-site-backend-static-ipv4.ak.epicgames.com/freeGamesPromotions?locale=zh-CN&country=CN&allowCountries=CN', function (error,response, body) {

    var data = JSON.parse(body)
    var games = data.data.Catalog.searchStore.elements
    var c = 0
    var a = games.length-1
    var f = games.length
    var d = ""
    var e = ""
    for(var i=0 ;i<games.length;i++) {
        c = c + 1
        a = a - 1
        var b = games[i].title
        d = c+"."+ b +"\n"
        e = e +d
  }
    sendText("今日共"+games.length+"款游戏限免\n请选择你要查看的游戏\n\n" + e)
    sec = input(30000)
    if(!sec){
        sendText("已超时。")
        return
    }
    if (sec > f) {
        sendText("没有找到对应的游戏")
        return
    }
    var freeGame = games[sec - 1]
    var title = freeGame.title
    var desp = freeGame.description
    var coverImg = freeGame.keyImages[1].url
    var shopUrl = "https://www.epicgames.com/store/zh-CN/p/" + freeGame.productSlug
    
    sendText("游戏名称：" + title + "\n游戏介绍:" + desp + "\n" + "领取地址：" + shopUrl + image(coverImg))
})

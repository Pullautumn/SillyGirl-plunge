//频道:https://t.me/sillyGirl_Plugin
//2022-6-9
//定时提醒所有失效客户，需搭配芝士plus插件使用
//默认通知QQ管理员,可自行修改通知渠道

// [cron:52 21 * * *] 定时任务


//可在""中间填入自己期望的通知方式,不填默认通知QQ管理员
var notify_to={
		imType:"", 	//qq,tg
		userID:"",	//账号id
		content:""	//通知内容
	}

function main(){
	if(notify_to.imType==""){
		notify_to.imType="qq",
		notify_to.userID=bucketGet("qq","masters").split("&")[0],
		notify_to.content="启动定时提醒所有失效客户\n"
	}
	notify_to.content=notify_to.content+sillyGirl.session("通知所有失效客户")().message
	push(notify_to)
}

main()
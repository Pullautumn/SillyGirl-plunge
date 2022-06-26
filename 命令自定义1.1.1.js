//频道:https://t.me/sillyGirl_Plugin，欢迎反馈
//傻妞命令重定向


//2022-6-25 v1.0 命令重定向，命令自定义
//2022-6-26 v1.1 修复导致非管理员无法正常使用其他傻妞命令的bug，为查看命令添加删除功能
//2022-6-26 v1.1.1 修复部分命令重定向失败的问题

//[rule:^修改命令 $[^$]+$[^$]+]
//例：修改命令 $ql cron run xxx $冲冲冲，将"ql cron run xxx"命令修改为"冲冲冲"
//注：不可用于修改交互式命令

//[rule:^查看重定向命令$]
//查看自定义命令

//[rule:^删除重定向命令 ?]
//例：删除命令 冲冲冲，删除自定义命令"冲冲冲"

//[rule:[\s\S]+]




var data=[{
	ori:"",
	redi:""
}]


function main(){
	let uid=GetUserID()
	if(bucketGet("qq","masters").indexOf(uid)==-1&&bucketGet("tg","masters").indexOf(uid)==-1&&bucketGet("wxmp","masters").indexOf(uid)==-1){
		Continue()
		return
	}
	let msg=GetContent()
	if(msg.indexOf("修改命令")!=-1){
		let temp=msg.split("$")
		if(temp.length!=3){
			sendText("设置重定向命令格式有误")
			return
		}
		command1=temp[1].trim()
		command2=temp[2].trim()
		sendText(SetRedirect(command1,command2,data))
	}
	
	else if(msg=="查看重定向命令"){
		GetAllRedirect()
	}
	
	else if(msg.indexOf("删除重定向命令")!=-1)
		sendText(DelRedirect(param(1)))
	
	else{
		let storage=bucketGet("sillyGirl","redirect")
		if(storage!=""){
			data=JSON.parse(storage)
			var index=GetOriginal(msg,data)
			if(index!=-1){
				sendText("执行命令:"+data[index].ori+"\n"+sillyGirl.session(data[index].ori)().message)
			}
		}
		if(index==-1)
			Continue()
	}
	return
}

function SetRedirect(com1,com2,data){
	let notify=""
	let storage=bucketGet("sillyGirl","redirect")
	if(storage==""){
		data[0].ori=com1
		data[0].redi=com2
		notify="已添加命令"+com1+"重定向为"+com2
	}
	else{
		data=JSON.parse(storage)
		let index=GetRedirect(com1,data)
		if(index!=-1){
			data[index].redi=com2
			notify="已更新命令"+com1+"重定向为"+com2
		}
		else if(GetOriginal(com2,data)!=-1){
			notify="该重定向命令已被占用,请更换其他命令"
		}
		else{
			data.push({ori:com1,redi:com2})
			notify="已添加命令"+com1+"重定向为"+com2
		}
	}
	bucketSet("sillyGirl","redirect",JSON.stringify(data))
	return notify
}

function GetRedirect(com,data){
	for(let i=0;i<data.length;i++)
		if(data[i].ori==com)
			return i
	return -1
}

function GetOriginal(com,data){
	for(let i=0;i<data.length;i++)
		if(data[i].redi==com)
			return i
	return -1
}

function GetAllRedirect(){
	let notify=""
	let num=0
	let storage=bucketGet("sillyGirl","redirect")
	if(storage==""||storage=="[]"){
		sendText("不存在重定向命令")
		return
	}
	else{
		data=JSON.parse(storage)
		num=data.length
		for(let i=0;i<data.length;i++)
			notify=notify+(i+1)+"、"+data[i].redi+":"+data[i].ori+"\n"
	}
	sendText("共"+num+"个重定向命令(\"-数字\"删除,\"q\"退出)\n"+notify)
	let choose=input(10000)
	if(choose==""||choose=="q"){
		sendText("已退出")
		return
	}
	let del=choose.match(/(?<=-)\d+$/g)
	if(del==null){
		sendText("选择命令有误，已退出")
		return
	}
	else if(del>data.length){
		sendText("超出选择范围，已退出")
		return
	}
	sendText("已删除重定向命令:"+data[del-1].redi)		
	data.splice(del-1,1)
	bucketSet("sillyGirl","redirect",JSON.stringify(data))
	return
}


function DelRedirect(com){
	let notify=""
	let storage=bucketGet("sillyGirl","redirect")
	if(storage=="")
		notify="不存在重定向命令"
	else{
		data=JSON.parse(storage)
		let index=GetOriginal(com,data)
		if(index==-1)
			notify="不存在该重定向命令"
		else{
			data.splice(index,1)
			bucketSet("sillyGirl","redirect",JSON.stringify(data))
			notify="已删除重定向命令:"+com		
		}
	}
	return notify
}

main()
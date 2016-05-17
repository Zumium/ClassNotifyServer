var db=require('./db');
var Promise=require('bluebird');

//读取个人通知
exports.getPersonalNotifications=function(id,options){
	return new Promise((resolve,reject)=>{
		//默认设置
		var allOptions={
			star: 2, //是否加星
	       		read: 2, //是否已读
	       		start: 0,//截取开始处
	       		end: -1, //截取结束处
	       		sent: false
		};
		//合并参数里的设置
		for(var key in options){
			allOptions[key]=options[key];
		}
		if(allOptions.sent){
			//作为发送者发送出去的通知
			db.StudentCache.findOne({where:{id:id}}).then((student)=>{
				student.getSentNotifications().then((notifications)=>{resolve(notifications);},(err)=>{reject(err);});
			},(err)=>{reject(err);});
		}
		else{
			//作为接受者收到的通知
			db.StudentCache.findOne({where:{id:id}}).then((student)=>{
				//已查询到接受者
				//开始读取制定信息
				student.getReceivedNotifications({
					through:{where:filterOptions(allOptions)},
					order:[['publishDate','DESC']],
					offset:allOptions['start'],
					limit: calculateLimit(allOptions)
				}).then((notifications)=>{resolve(notifications);},(err)=>{reject(err);});
			},(err)=>{reject(err);});
		}
	});
}

function filterOptions(opt){
	var options={};
	if(opt['star']!=2){
		if(opt['star']==1) options['star']=true;
		else options['star']=false;
	}
	if(opt['read']!=2){
		if(opt['read']==1) options['read']=true;
		else options['read']=false;
	}
	return options;
}

function calculateLimit(opt){
	if(opt['end']==-1) return undefined;
	else if(opt['start']>opt['end']) return undefined; //起始位置大于结束位置，输入有错误，按为定义结束位置处理
	else return opt['end']-opt['start']+1;
}

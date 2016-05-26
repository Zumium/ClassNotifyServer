var Promise=require('bluebird');
var util=require('util');
var ns=require('./notiservice');

exports.checkAttributes=function(includeAttrList,excludeAttrList,obj){
	return new Promise((resolve,reject)=>{
		var pass=true;
		if(includeAttrList){
			includeAttrList.forEach((attr)=>{
				if(!obj[attr]) pass=false;
			});
		}
		if(excludeAttrList){
			excludeAttrList.forEach((attr)=>{
				if(obj[attr]) pass=false;
			});
		}
		resolve(pass);
	});
}

exports.isOperateOnSelf=function(req,sid){
	return new Promise((resolve,reject)=>{
		if(!req.user) return reject(new Error('No user logged'));
		if(!sid) return reject(new Error('Empty \'sid\' argument'));
		resolve(req.user==sid);
	});
}

exports.isSender=function(nid,sid){
	return new Promise((resolve,reject)=>{
		ns.getNotificationById(nid).then((notification)=>{
			notification.getSender().then((student)=>{
				if(student.get('id')==sid) resolve(true);
				else resolve(false);
			},(err)=>{reject(err);});
		},(err)=>{reject(err);});
	});
}

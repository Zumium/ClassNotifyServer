var commentdb=require('../repositories/mongo');
var genError=require('../tools/gene-error');
var Promise=require('bluebird');
var _=require('underscore');

exports.getComments=function(notificationId,options={}){
	return new Promise((resolve,reject)=>{
		var op=_.defaults(options,{start:0,end:-1});
		var theQuery=commentdb.Comment.find({notificationId:notificationId});
		if(op.start!=0)
			theQuery=theQuery.skip(op.start);
		if(op.end!=-1)
			theQuery=theQuery.limit(op.end-op.start+1);

		theQuery.sort({time:-1}).exec()
		.then(resolve)
		.catch(reject);
	});
}

exports.appendComment=function(options){
	return new Promise((resolve,reject)=>{
		commentdb.Comment.create(options)
		.then(resolve)
		.catch(reject);
	});
}

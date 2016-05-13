var db=require('./db');
var Promise=require('bluebird');

//登录验证
exports.vertifyUserLogin=function(id,password){
	return new Promise((resolve,reject)=>{
		db.StudentCache.findOne({id:id}).then((student)=>{
			if(!student) return resolve(false,{message:'Username or password is wrong'});
			else if(student.password!=password) return resolve(false,{message:'Username or password is wrong'});
			else return resolve(true);
		},(err)=>{
			reject(err);
		});
	});
}

//返回同学是否是班委
exports.isAdmin=function(id){
	return new Promise((resolve,reject)=>{
		db.StudentCache.findOne({id:id}).then((student)=>{
			if(student.character=='同学') return resolve(false);
			else return resolve(true);
		},(err)=>{reject(err);});
	});
}

//更换密码
exports.changePassword=function(id,newPassword){
	return new Promise((resolve,reject)=>{
		db.StudentCache.findOne({id:id}).then((student)=>{
			student.password=newPassword;
			student.save();
		},(err)=>{reject(err);});
	});
}

//更改职位
exports.changeCharacter=function(id,newCharacter){
	return new Promise((resolve,reject)=>{
		db.StudentCache.findOne({id:id}).then((student)=>{
			student.character=newCharacter;
			student.save();
		},(err)=>{reject(err);});
	});
}

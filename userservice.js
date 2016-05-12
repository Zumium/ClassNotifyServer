var db=require('./db');
var Promise=require('bluebird');

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

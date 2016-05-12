var db=require('./db');
var Promise=require('bluebird');

exports.vertifyUserLogin=function(id,password){
	return new Promise((resolve,reject)=>{
		db.StudentCache.findOne({id:id}).then((student)=>{
			if(!student) return reject(new Error('Username or password is wrong'));
			else if(student.password==password) return reject('Username or password is wrong');
			else return resolve();
		},(err)=>{
			reject(err);
		});
	});
}

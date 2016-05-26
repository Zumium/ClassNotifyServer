var db=require('./db');
var Promise=require('bluebird');
var util=require('util');

//职务列表
var characterList=['班长','团支书','副班长','宣传委员','文体委员','学习委员','生活委员','科创委员','英语委员','心理委员','同学'];

//登录验证
exports.vertifyUserLogin=function(id,password){
	return new Promise((resolve,reject)=>{
		db.Student.findOne({where:{id:id}}).then((student)=>{
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
		db.Student.findOne({where:{id:id}}).then((student)=>{
			if(student.character=='同学') return resolve(false);
			else return resolve(true);
		},(err)=>{reject(err);});
	});
}

//更换密码
exports.changePassword=function(id,newPassword){
	return new Promise((resolve,reject)=>{
		db.Student.findOne({where:{id:id}}).then((student)=>{
			student.password=newPassword;
			student.save();
			resolve();
		},(err)=>{reject(err);});
	});
}

//更改职位
exports.changeCharacter=function(id,newCharacter){
	return new Promise((resolve,reject)=>{
		db.Student.findOne({where:{id:id}}).then((student)=>{
			student.character=newCharacter;
			student.save();
		},(err)=>{reject(err);});
	});
}

//获取个人信息
exports.getStudentInfo=function(ids){
	return new Promise((resolve,reject)=>{
		if(util.isString(ids)){
			if(ids==='all'){
				//获取所有学生信息
				db.Student.findAll({
					attributes:{exclude:['password','createdAt','updatedAt']}
				}).then((students)=>{
					if(!students){
						var NoSuchStudentError=new Error('No such student');
						NoSuchStudentError.suggestStatusCode=404;
						return reject(NoSuchStudentError);
					}
					resolve(students);
				},(err)=>{reject(err);});
			}
			else {
				//获取指定学生信息
				db.Student.findOne({
					where: {id: ids},
					attributes:{exclude:['password','createdAt','updatedAt']}
				}).then((student)=>{
					if(!student){
						var NoSuchStudentError=new Error('No such student');
						NoSuchStudentError.suggestStatusCode=404;
						return reject(NoSuchStudentError);
					}
					resolve(student);
				},(err)=>{reject(err);});
			}
		}
		else if(util.isArray(ids)){
			//获取指定学生的信息
			db.Student.findAll({
				where: {
					id:ids
				},
				attributes:{exclude:['password','createdAt','updatedAt']}
			}).then((students)=>{
				if(!students){
					var NoSuchStudentError=new Error('No such student');
					NoSuchStudentError.suggestStatusCode=404;
					return reject(NoSuchStudentError);
				}
				resolve(students);
			},(err)=>{reject(err);});
		}
		else return reject(new Error('Wrong argument type'));
	},(err)=>{reject(err);});
}

//添加新学生
exports.addNewStudent=function(studentInfo){
	return new Promise((resolve,reject)=>{
		//检查参数
		if(!studentInfo['name']){
			//没有姓名，reject
			var NoUserNameError=new Error('No user\'s name');
			NoUserNameError.suggestStatusCode=400;
			return reject(NoUserNameError);
		}
		if(!studentInfo['password']){
			var NoPasswordError=new Error('No user\'s password');
			NoPasswordError.suggestStatusCode=400;
			return reject(NoPasswordError);
		}
		if(!studentInfo['id']){
			var NoIdError=new Error('No user\'s id');
			NoIdError.suggestStatusCode=400;
			return reject(NoIdError);
		}
		if(!studentInfo['character'] || characterList.indexOf(studentInfo['character'])==-1){
			var NoSuchCharacterError=new Error('No such character');
			NoSuchCharacterError.suggestStatusCode=400;
			return reject(NoSuchCharacterError);
		}
		//验证成功
		db.Student.create(studentInfo).then(()=>{
			resolve();
		},(err)=>{
			err.suggestStatusCode=500;
			reject(err);
		});
	});
}

exports.isCharacterValid=function(character){
	return characterList.indexOf(character)!=-1;
}

exports.filtObject=function(keys,obj){
	var filtResult={};
	keys.forEach((eachKey)=>{
		if(obj[eachKey]!=undefined) filtResult[eachKey]=obj[eachKey];
	});
	return filtResult;
}

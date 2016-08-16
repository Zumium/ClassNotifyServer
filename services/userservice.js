var db=require('../repositories/db');
var genError=require('../tools/gene-error');
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
		},reject);
	});
}

//返回同学是否是班委
exports.isAdmin=function(id){
	return new Promise((resolve,reject)=>{
		db.Student.findOne({where:{id:id}}).then((student)=>{
			if(student.character=='同学') return resolve(false);
			else return resolve(true);
		},reject);
	});
}

//更换密码
exports.changePassword=function(id,newPassword){
	return new Promise((resolve,reject)=>{
		db.Student.findOne({where:{id:id}})
		.then((student)=>{
			student.password=newPassword;
			return student.save();
		})
		.then(resolve)
		.catch(reject);
	});
}

//更改职位
exports.changeCharacter=function(id,newCharacter){
	return new Promise((resolve,reject)=>{
		db.Student.findOne({where:{id:id}})
		.then((student)=>{
			student.character=newCharacter;
			return student.save();
		})
		.then(resolve)
		.catch(reject);
	});
}

//获取个人信息
var getStudentInfo=exports.getStudentInfo=function(ids){
	return new Promise((resolve,reject)=>{
		if(util.isString(ids)){
			if(ids==='all'){
				//获取所有学生信息
				db.Student.findAll({
					attributes:{exclude:['password','createdAt','updatedAt']}
				}).then((students)=>{
					if(!students)
						throw genError(404,'No such student');
					resolve(students);
				})
				.catch(reject);
			}
			else {
				//获取指定学生信息
				db.Student.findOne({
					where: {id: ids},
					attributes:{exclude:['password','createdAt','updatedAt']}
				}).then((student)=>{
					if(!student)
						throw genError(404,'No such student');
					resolve(student);
				})
				.catch(reject);
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
				if(!students)
					throw genError(404,'No such student');
				resolve(students);
			})
			.catch(reject);
		}
		else
			return reject(genError(500,'Wrong argument type'));
	});
}

//添加新学生
exports.addNewStudent=function(studentInfo){
	return new Promise((resolve,reject)=>{
		//检查参数
		if(!studentInfo['name'])
			//没有姓名，reject
			return reject(genError(400,'No user\'s name'));
		if(!studentInfo['password'])
			return reject(genError(400,'No user\'s password'));
		if(!studentInfo['id'])
			return reject(genError(400,'No user\'s id'));
		if(!studentInfo['character'] || characterList.indexOf(studentInfo['character'])==-1)
			return reject(genError(400,'No such character'));

		//验证成功
		db.Student.create(studentInfo).then(resolve,reject);
	});
}

exports.isCharacterValid=function(character){
	return characterList.indexOf(character)!=-1;
}

//替换ID为用户信息
exports.replaceUserIdToInfo=function(src,keyName){
	return new Promise((resolve,reject)=>{
		if(util.isArray(src))
			Promise.all(src.map((each)=>getSenderConvertingPromise(each,keyName))).then(resolve,reject);
		else
			getSenderConvertingPromise(src,keyName).then(resolve,reject);
	});
}
//helper function to 'replaceUserIdToInfo' function
function getSenderConvertingPromise(src,keyName){
	return new Promise((resolve,reject)=>{
		getStudentInfo(src[keyName]).then((sender)=>{
			src[keyName]=sender.get();
			resolve(src);
		},reject);
	});
}

var Promise=require('bluebird');
var mongo=Promise.promisifyAll(require('mongodb'));
var grid=require('gridfs-stream');

const prefix='PORTRAIT_';
const emptyPortrait=prefix+'DEFAULT';
const databaseName='classnotifyPortrait';

var isDbOpened=false;

var db=new mongo.Db(databaseName,new mongo.Server('mongodb',27017));
var gfs=null;

function getFileName(username){
	return prefix+username;
}

exports.init=function(){
	return (req,res,next)=>{
		if(isDbOpened) return next();
		else{
			db.openAsync()
			.then(()=>{
				gfs=Promise.promisifyAll(grid(db,mongo));
				isDbOpened=true;
				next();
			})
			.catch(next);
		}
	};
}

exports.setPortrait=function(username,instream){
	return new Promise((resolve,reject)=>{
		if(!username || !instream)
			return reject(new Error('username or instream is empty'));
		var gfsWriteStream=gfs.createWriteStream({filename:getFileName(username)});
		gfsWriteStream.on('finish',resolve);
		gfsWriteStream.on('error',reject);
		instream.on('error',reject);
		instream.pipe(gfsWriteStream);
	});
}

exports.getPortrait=function(username,outstream){
	return new Promise((resolve,reject)=>{
		if(!username || !outstream)
			return reject(new Error('username or outstream is empty'));
		gfs.existAsync({filename:getFileName(username)})
		.then((found)=>{
			if(!found)
				gfs.createReadStream({filename:emptyPortrait}).pipe(outstream);
			else
				gfs.createReadStream({filename:getFileName(username)}).pipe(outstream);
			outstream.on('error',reject);
			outstream.on('finish',resolve);
		})
		.catch(reject);
	});
}

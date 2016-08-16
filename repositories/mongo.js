var mongoose=require('mongoose');

mongoose.Promise=require('bluebird');
mongoose.connect('mongodb://mongodb/classnotify');

var commentSchema=mongoose.Schema({
	notificationId:{type:String,required:true},
	comment:{type:String,required:true},
	time:{type:Date,default:Date.now},
	sender:{type:String,required:true}
},{
	toJSON:{
		transform:function(doc,ret,options){
			delete ret._id;
			delete ret.__v;
			delete ret.notificationId;
			return ret;
		}
	}
});

var Comment=mongoose.model('Comment',commentSchema);

exports.Comment=Comment;

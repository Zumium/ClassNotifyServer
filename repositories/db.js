var Sequelize=require('sequelize');
//var EventEmitter=require('events');
var Promise=require('bluebird');

//Connection to the DB
var sequelize=new Sequelize('mariadb://martin:123456@mariadb/ClassNotify',{
	logging:false
});

//Model: Student
var Student=sequelize.define('student',{
	id: {
	   	type: Sequelize.STRING,
   		field: 'ID',
   		primaryKey: true
	},
    	name: {
		type: Sequelize.STRING,
    		field: 'StuName'
	},
    	character: {
		type: Sequelize.STRING,
    		field: 'StuCharacter'
	},
	password: {
		type: Sequelize.STRING,
   		field: 'StuPassword'
	}
},{
	charset: 'utf8'
});

//Model: Notification
var Notification=sequelize.define('notification',{
	id: {  //代理键做主键
		type: Sequelize.UUID,
    		field: 'NtfID',
    		defaultValue: Sequelize.UUIDV4,
    		primaryKey: true
	},
    	title: {
		type: Sequelize.STRING,
		defaultValue: '(无)',
    		field: 'NtfTitle'
	},
    	content: {
		type: Sequelize.TEXT,
    		field: 'NtfContent',
    		allowNull: false
	},
    	publishDate: {
		type: Sequelize.DATE,
    		field: 'NtfPublishDate',
    		defaultValue: new Date(),
    		allowNull: false
	},
	sender: {
		type: Sequelize.STRING,
		field: 'SenderID',
		references: {
			model: Student,
			key: 'id'
		}
	}
},{
	charset: 'utf8'
});

//Model: ReadingState(join table)
var NotificationStatus=sequelize.define('notificationStatus',{
	id: {
		type: Sequelize.UUID,
    		field: 'NotificationStatusID',
    		defaultValue: Sequelize.UUIDV4,
    		primaryKey: true
	},
    	read: {
		type: Sequelize.BOOLEAN,
    		field: 'ReadFlag',
		defaultValue: false,
		allowNull: false
	},
    	star: {
		type: Sequelize.BOOLEAN,
    		field: 'StarFlag',
		defaultValue: false,
		allowNull: false
	}
},{
	charset: 'utf8'
});
//Defining relactions
//A Student has many NotificationStatus as ReceivedNotifications
//Student.hasMany(NotificationStatus,{as: 'ReceivedNotifications',constrains: false});
//A Student has many Notification as SentNotifications
//Student.hasMany(Notification,{as: 'SentNotifications',constrains: false});
//A NotificationStatus has one Student as Receiver
//NotificationStatus.hasOne(Student,{as: 'Receiver',constrains: false});
//A NotificationStatus has one Notification as Content
//NotificationStatus.hasOne(Notification,{as: 'Content',constrains: false});
//A Notification has one Student as Sender
//Notification.hasOne(Student,{as: 'Sender',constrains: false});
//A Notification has many NotificationStatus as ReceiverStatuses
//Notification.hasMany(NotificationStatus,{as: 'ReceiverStatuses',constrains: false});
Notification.belongsToMany(Student,{as:'Receivers',through:NotificationStatus,constraints:false});
Student.belongsToMany(Notification,{as:'ReceivedNotifications',through:NotificationStatus,constraints:false});

Notification.belongsTo(Student,{as:'Sender',foreignKey:'sender',constraints:false});
Student.hasMany(Notification,{as:'SentNotifications',foreignKey:'sender',constraints:false});

//exports all models
exports.Student=Student;
exports.Notification=Notification;
exports.NotificationStatus=NotificationStatus;

//sync all models
exports.syncAll=()=>new Promise((resolve,reject)=>
	Promise.resolve()
	.then(()=>Student.sync())
	.then(()=>Notification.sync())
	.then(()=>NotificationStatus.sync())
	.then(resolve)
	.catch(reject)
);

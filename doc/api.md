# API文档
## 1. 学生信息
### 1. 查看全部学生信息

方法：GET <br>
路径：/users<br>
说明：查看该服务器上的全部学生信息<br>
返回： 200 OK

    [
        {学生信息（见下）}, ...
    ]

### 2. 添加学生
方法：POST<br>
路径：/users<br>
说明：向服务器中添加新的学生<br>
请求：

    {
        "id": <学生学号>,
        "name": <姓名>,
        "character": <角色，同学或班委>,
        "password": <密码>
    }

返回：201 Created
### 3. 查看指定学生的信息
方法：GET<br>
路径：/users/(studentID) <br>
说明：查看指定学号的学生的信息<br>
返回：200 OK

    {
        "id": <学生学号>,
        "name": <姓名>,
        "character": <角色，同学或班委>
    }

### 4. 删除指定的学生
方法：DELETE<br>
路径：/users/(studentID)<br>
说明：从服务器上删除指定的学生<br>
返回：200 OK

### 5. 修改密码
方法：PUT<br>
路径：/users/(studentID)/password<br>
说明：修改账户密码<br>
请求：

    {
        "password": <新密码>
    }

返回：200 OK
### 6. 获取头像
方法：GET<br>
路径：/users/(studentID)/portrait<br>
说明：从服务器中获取用户头像<br>
返回：200 OK

    二进制图片数据

### 7. 修改头像
方法：PUT<br>
路径：/users/(studentID)/portrait<br>
说明：向服务器上传用户的新头像，替换原来的旧头像<br>
请求：

    二进制图片数据

返回：200 OK

### 8. 获取通知
方法：GET<br>
路径：/users/(studentID)/notifications<br>
说明：获取指定用户收到的通知，用户只被允许查看自己接收的通知<br>
返回：200 OK

    {
        "id": <通知ID>,
        "title": <通知标题>,
        "content": <通知内容>,
        "publishDate": <发布时间>,
        "sender": <发布者>
    }

### 9. 获取所有通知
方法：GET<br>
路径：/notifications<br>
说明：获取系统中的所有通知<br>
返回：200 OK

    [
        {通知内容}, ...
    ]

### 10. 新建通知
方法：POST<br>
路径：/notifications<br>
说明：创建新的通知<br>
请求：

    {
        "title": <通知标题>,
        "content": <通知内容>,
        receivers:[<接受者ID>]
    }

返回：201 Created

### 11. 获取通知内容
方法：GET<br>
路径：/notifications/(notificationID)<br>
说明：获取具有指定通知号的通知的内容<br>
返回：200 OK

    [
        {通知内容}, ...
    ]

### 12. 删除通知
方法：DELETE<br>
路径：/notifications/(notificationID)<br>
路径：删除具有指定通知号的通知<br>
返回：200 OK

### 13. 获取评论
方法：GET<br>
路径：/notifications/(notificationID)/comments<br>
说明：获取指定通知的相关评论<br>
返回：200 OK

    [
        {
            "comment": <评论内容>,
            "publishDate": <发布时间>,
            "sender": <发布者>
        }, ...
    ]

### 14. 发表评论
方法：POST<br>
路径：/notifications/(notificationID)/comments<br>
说明：发表关于某一通知的评论<br>
请求：

    {
        "comment": <评论>
    }

返回： 201 Created

### 15. 获取通知状态
方法：GET<br>
路径：/notifications/(notificationID)/status<br>
说明：获取指定通知的阅读状态信息<br>
返回：200 OK

    [
        {
            "receiver": <接收者>,
            "read": <是否阅读>,
            "star": <是否收藏>
        }, ...
    ]

### 16. 获取指定接收者的阅读状态信息
方法：GET<br>
路径：/notifications/(notificationID)/status/(studentID)<br>
说明：获取指定通知的指定接收者的阅读状态信息<br>
返回：200 OK

    {
        "read": <是否阅读>,
        "star": <是否收藏>
    }

### 17. 修改阅读状态信息
方法：PATCH<br>
路径：/notifications/(notificationID)/status/(studentID)<br>
说明：修改某一个接收者对通知的状态信息<br>
请求：200 OK

    {
        "read": <阅读状态>,
        "star": <收藏状态>
    }

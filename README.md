# chatroom
## 线上地址
http://kekeaiai.wang

## 本地环境搭建
#### centos安装nodejs
```
-- 新建路径
mkdir /usr/software && cd /usr/software

-- 下载官网中的Linux二进制文件 (x64)（不是源码）（https://nodejs.org/zh-cn/download/）
wget https://nodejs.org/dist/v14.15.5/node-v14.15.5-linux-x64.tar.xz

-- 解压
tar xf node-v14.15.5-linux-x64.tar.xz

-- 改路径名
mv node-v14.15.5-linux-x64 nodejs

-- 添加个软链接
ln -s /usr/software/nodejs/bin/npm   /usr/local/bin/ 
ln -s /usr/software/nodejs/bin/node   /usr/local/bin/

ll /usr/local/bin/

-- 查看版本
node -v
npm -v
```

#### centos安装redis
```
-- 安装
yum install redis

-- 启动、停止、重启
service redis start  
service redis stop  
service redis restart
  
-- 配置位置
vi /etc/redis.conf
  
-- 修改配置：注释ip绑定（让外网可以访问）
bind 127.0.0.1
  
-- 修改配置：密码(修改后重启)
requirepass a123456
  
-- 外网连接
redis-cli -h 115.159.xxx.xxx -p 6379 -a "a123456"

-- 查看进程
ps -ef | grep redis
```

#### 新增生产配置
```
-- 配置路径
cd config  

-- 公共配置(可以不用管)  
cp common.js common-prod.js

-- 邮件通知配置(可以不用管)  
cp mail.js mail-prod.js   

-- redis配置(此处需要更改为本机的redis密码)
cp redis.js redis-prod.js 
```
#### 步骤
```
-- 拉取代码
git clone git@github.com:ddmmddmm/chatroom.git

-- 安装依赖模块
cd chatroom  
npm install

-- 安装pm2（如果报找不到pm2可以加个软链，示例：ln -s /usr/software/nodejs/bin/pm2 /usr/local/bin/）
npm install -g pm2

-- 启动服务
pm2 start ./bin/www --name 'chatroom' --watch --ignore-watch="uploads"

-- 重启服务
pm2 restart chatroom

-- 查看日志
pm2 log chatroom

-- 详细信息
pm2 show chatroom

-- 监控信息
pm2 monit

-- 本地访问
http://127.0.0.1
```

## 目录结构
		.
		├── app.js 中间件、路由等
		├── bin
		│   └── www 程序入口，引进了初始化js，以及实例化socketio，将实例(io)传给chatroom.js服务类
		├── package.json
		├── public 资源文件目录
		│   ├── images
		│   ├── javascripts
		│   └── stylesheets
		└── service
		│   ├── chatroom.js 聊天室主要服务类
		│   ├── common.js 公共方法类
		│   ├── redis.js redis服务类，注意这里需要先调用此类的init方法等到redis实例取到之后再往下执行，后面可以改成promise等方案
		│   └── init.js 程序初始化操作，直接放在www引进并执行
		│
		├── routes
		│   ├── chatroom.js 路由，目前只传递了链接给到的roomId，和title
		│   
		└── views
		    └── chatroom.ejs 聊天室前端页面，// todo 后面需要做模块化拆分

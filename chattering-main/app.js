'use strict';

/**
 * Module dependencies.
 */
const bodyParser = require('body-parser');
var express = require('express');
const morgan = require('morgan');
var http = require('http');
var path = require('path');
const fs = require('fs');

var app = express();
var server = http.createServer(app);

/* Configuration */
app.use(morgan('combined'));
app.set('views', path.join(__dirname, "/views"));
app.get('/', (req, res) => {
  // Send the HTML file as the response
  res.sendFile(path.join(__dirname, 'public/login.html'));
});
app.use(express.static(__dirname + '/public'));
app.set('port', 3000);

app.use(bodyParser.urlencoded({ extended: true }));

// 사용자 정보를 저장하고 있는 JSON 파일 경로
const usersFilePath = 'USER_DB.json';

app.post('/signup', (req, res) => {
  const { username, password } = req.body;

  // 사용자 정보를 JSON 파일에서 읽어옴
  const users = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));

  // 사용자 중복 검사
  const existingUser = users.find(user => user.username === username);
  if (existingUser) {
      res.send('이미 존재하는 사용자 이름입니다.');
      return;
  }
  
  else{
  // 새로운 사용자 정보 생성
  const newUser = {
      username: username,
      password: password
  };

  // 새로운 사용자 정보를 배열에 추가
  users.push(newUser);

  // 업데이트된 사용자 정보를 JSON 파일에 쓰기
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.write("<script>alert('회원가입 성공~')</script>");
  res.write("<script>window.location=\"login.html\"</script>")
  }
});


app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // 사용자 정보를 JSON 파일에서 읽어옴
  const users = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));

  // 사용자 검색
  const user = users.find(user => user.username === username && user.password === password);

  // 사용자가 존재하는지 확인
  if (user) {
    res.redirect(`index.html?username=${user.username}`);
  } else {
      res.send('로그인 실패: 유저 정보가 일치하지 않습니다.');
  }
});


if (process.env.NODE_ENV === 'development') {
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
}

app.use(bodyParser.urlencoded({ extended: true }));

/* Socket.io Communication */
var io = require('socket.io').listen(server);

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('joinRoom', ({ room, username }) => {
    socket.join(room);
    console.log(`${username} joined room: ${room}`);
    
    // Broadcast to other users in the room that a user has joined
    socket.to(room).emit('message', { user: username, text: `${username} has joined the chat` });
  });

  socket.on('send:message', (message) => {
    io.to(message.room).emit('send:message', message);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});


/* Start server */
server.listen(app.get('port'), function (){
  console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});

module.exports = app;

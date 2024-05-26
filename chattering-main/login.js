const bodyParser = require('body-parser');
const fs = require('fs');
const morgan = require('morgan');

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
      res.redirect('index.html');
  
  } else {
      res.send('로그인 실패: 유저 정보가 일치하지 않습니다.');
  }
});

const express = require('express');
const app = express();
const bodyParser = require('body-parser'); // body-parser로 client가 보내는 정보를 받아와 req의 body에 담아줌
const cookieParser = require('cookie-parser');
const config = require('./config/key');
const { auth } = require('./middleware/auth');
const { User } = require('./models/User');

//application/x-www-form-urlencoded 의 데이터를 분석해서 가져옴
app.use(bodyParser.urlencoded({ extended: true }));
//application/json 의 데이터를 분석해서 가져옴
app.use(bodyParser.json());
app.use(cookieParser());

const mongoose = require('mongoose');
mongoose
  .connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('MongoDB connected..'))
  .catch((err) => console.log(err));

app.get('/', (req, res) => res.send('Hello World! ~~ hello~ hihi'));

app.get('/api/hello', (req, res) => res.send('Hello word'));

app.post('/api/users/register', (req, res) => {
  //회원가입 할 때 필요한 정보들을 client에서 가져오면
  //그것들을 DB에 넣어줌
  const user = new User(req.body);
  user.save((err, userInfo) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).json({ success: true });
  });
});

app.post('/api/users/login', (req, res) => {
  //요청된 email을 DB에 있는지 찾기
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) {
      return res.json({
        loginSuccess: false,
        message: '입력한 email에 해당하는 user가 없음',
      });
    }

    //요청한 email이 있을 때 password가 맞는지 확인
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch)
        return res.json({
          loginSuccess: false,
          message: '비밀번호가 틀렸습니다',
        });

      //pw까지 맞다면 user를 위한 token 생성
      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);
        //token을 저장. 어디에? 쿠키, local starage, session ...
        res
          .cookie('x_auth', user.token)
          .status(200)
          .json({ loginSuccess: true, userId: user._id });
      });
    });
  });
});

// auth route - 페이지 이동 때마다 로그인이 되어 있는지, 관리자 유저인지 등을 체크
// 글을 쓸 때나 지울 때 권한이 있는지 등을 체크
// token을 server에서는 user DB에, client는 cookie에 있을 때,
// 해당 token이 일치하는지 client에서 cookie(token의 secret token)를
// server에 전달하여 token의 유효성을 확인
// cookie의 token을 가져와 복호화
// 중간의 auth는 auth.js에서 가져오는 것
app.get('/api/users/auth', auth, (req, res) => {
  // 여기까지 middle ware를 통과해 왔다는 얘기 -> authentication이 true라는 말
  // 즉, auth에서 next()를 통해 req, res에 각각 정보들이 담겨져 있음
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true, // role = 0이면 일반 user, 0이 아니면 관리자
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image,
  });
});

//logout
//logout하려는 user를 DB에서 찾아 그 user의 token을 지움

app.get('/api/users/logout', auth, (req, res) => {
  User.findOneAndUpdate({ _id: req.user._id }, { token: '' }, (err, user) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).send({ success: true });
  });
});

const port = 5050;
app.listen(port, () => console.log(`Example app listening at ${port}!`));

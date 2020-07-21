const { User } = require('../models/User');

let auth = (req, res, next) => {
  //인증 처리를 하는 곳
  //client cookie에서 token을 가져온다.
  let token = req.cookies.x_auth;

  //token을 복호화 한 후 user를 찾는다
  User.findByToken(token, (err, user) => {
    if (err) throw err;
    if (!user)
      return res.js({
        isAuth: false,
        error: true,
      });

    req.token = token;
    req.user = user;
    //middleware에서 인증 처리를 다 완료하면
    //다음 call back function으로 넘어가게 해줌
    next();
  });
  //user가 있으면 인증 O
  //user가 없으면 인증 x
};

module.exports = { auth };

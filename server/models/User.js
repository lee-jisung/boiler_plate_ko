const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { JsonWebTokenError } = require('jsonwebtoken');
const saltRounds = 10; //salt가 몇 글자 인지 나타냄
//salt를 생성 -> salt를 이용해서 비밀번호 암호화
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50,
  },
  email: {
    type: String,
    trim: true,
    unique: 1,
  },
  password: {
    type: String,
    minlength: 5,
  },
  lastname: {
    type: String,
    maxlength: 50,
  },
  role: {
    type: Number,
    default: 0,
  },
  image: String,
  token: {
    type: String,
  },
  tokenExp: {
    type: Number,
  },
});

userSchema.pre('save', function (next) {
  var user = this;

  //user schema에서 password를 바꿀 때만 암호화
  if (user.isModified('password')) {
    //비밀 번호를 암호화
    // salt 생성
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) return next(err);

      bcrypt.hash(user.password, salt, function (err, hash) {
        //store hash in your password DB.
        if (err) return next(err);
        user.password = hash;
        next(); //위의 pre를 통해 next()를 하면 index.js에 user.save로 감
      });
    });
  } else {
    // 비밀번호 이외의 내용들을 바꿀 때
    next();
  }
});

userSchema.methods.comparePassword = function (plainPasswrod, cb) {
  //plainPassword, DB pw (hash된) 를 비교
  bcrypt.compare(plainPasswrod, this.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

userSchema.methods.generateToken = function (cb) {
  var user = this;
  //jsonwebtoken을 이용해서 token을 생성
  var token = jwt.sign(user._id.toHexString(), 'secretToken');
  //user._id + 'secretToken = token ->
  //'secretToekn'을 이용해서 user._id를 확인 할 수 있음
  user.token = token;
  user.save(function (err, user) {
    if (err) return cb(err);
    cb(null, user);
  });
};

userSchema.statics.findByToken = function (token, cb) {
  var user = this;
  //가져온 token을 decode
  jwt.verify(token, 'secretToken', function (err, decoded) {
    // decoded = userid
    //user id를 이용해서 user를 찾은 후
    //client에서 가져온 token과 DB에 보관된 token이 일치하는 지 확인

    user.findOne({ _id: decoded, token: token }, function (err, user) {
      if (err) return cb(err);
      cb(null, user);
    });
  });
};

const User = mongoose.model('User', userSchema);

module.exports = { User };

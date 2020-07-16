const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser'); // body-parser로 client가 보내는 정보를 받아와 req의 body에 담아줌

const config = require('./config/key');

const { User } = require('./models/User');

//application/x-www-form-urlencoded 의 데이터를 분석해서 가져옴
app.use(bodyParser.urlencoded({ extended: true }));
//application/json 의 데이터를 분석해서 가져옴
app.use(bodyParser.json());

const mongoose = require('mongoose');
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('MongoDB connected..')).catch(err => console.log(err));

app.get('/', (req, res) => res.send('Hello World! ~~ hello'))

app.post('/register', (req, res) => {
    //회원가입 할 때 필요한 정보들을 client에서 가져오면 
    //그것들을 DB에 넣어줌
    const user = new User(req.body);
    user.save((err, userInfo) => {
        if (err) return res.json({ success: false, err });
        return res.status(200).json({ success: true });
    });
});



app.listen(port, () => console.log(`Example app listening at ${port}!`))
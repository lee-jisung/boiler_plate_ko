const express = require('express')
const app = express()
const port = 5000

const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://jisung:1234@boilerplate.j1s75.mongodb.net/<dbname>?retryWrites=true&w=majority', {
    useNewUrlParser : true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('MongoDB connected..')).catch(err => console.log(err));

app.get('/', (req, res) => res.send('Hello World! ~~ hello'))

app.listen(port, () => console.log(`Example app listening at ${port}!`))
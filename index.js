const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const authRoute = require('./routes').auth;
const courseRoute = require('./routes').course;
const passport = require('passport')
// require的是function,所以可以直接執行
require('./config/passport')(passport)

//
mongoose.connect('mongodb://127.0.0.1/mernDB').then(()=>{
  console.log('Connecting to mongodb...');
}).catch((e)=>{
  console.log(e)
})

//middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/api/user', authRoute)
// course route只有講師可以使用,應該被JWT保護
// 如果request header內部沒有jwt, 則 request就會被視為是 unauthorized
app.use('/api/courses',passport.authenticate('jwt',{session: false}), courseRoute)

// 只有登入系統的人才能夠去新增或是註冊課程

app.listen(8080,()=>{
  console.log('後端伺服器運行在port 8080')
})
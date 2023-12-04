const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const authRoute = require('./routes').auth;

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

app.listen(8080,()=>{
  console.log('後端伺服器運行在port 8080')
})
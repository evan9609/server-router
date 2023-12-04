const router = require('express').Router();
const {
  registerValidation,
  loginValidation,
  courseValidation,
} = require('../validation')
const User = require('../models').user;
const jwt = require('jsonwebtoken')

router.use((req,res,next)=>{
  console.log('正在接收一個跟auth有關的請求');
  next()
})

router.get('/testAPI',(req,res)=>{
  return res.send('成功連結auth route')
})

router.post('/register', async (req,res)=>{
  // 註冊資料格式驗證
  console.log('格式驗證...')
  let { error } = registerValidation(req.body);
  if(error) return res.status(400).send(error.details[0].message)

  // 確認信箱是否被註冊過
  console.log('確認信箱是否重複...')
  const emailExist =  await User.findOne({ email: req.body.email});
  if (emailExist) return res.status(400).send('此信箱已被註冊過了');


  // 製作新用戶
  let { email, username, password, role} = req.body;
  let newUser = new User({ email, username, password, role});
  try{
    console.log('儲存中...')
    let savedUser = await newUser.save();
    console.log('儲存成功')
    return res.send({
      msg: '使用者成功儲存',
      savedUser,
    })
  }catch(e){
    return res.status('無法儲存使用者')
  }
})

router.post('/login', async(req,res)=>{
  // 註冊資料格式驗證
  console.log('格式驗證...')
  let { error } = loginValidation(req.body);
  if(error) return res.status(400).send(error.details[0].message)

  // 確認信箱是否被註冊過
  console.log('確認信箱是否重複...')
  const foundUser =  await User.findOne({ email: req.body.email});
  if (!foundUser) return res.status(401).send('無法找到使用者');
  foundUser.comparePassword(req.body.password, function(err,isMatch){
    if(err) return res.status(500).send(err)
    if(isMatch){
      console.log('已找到資料')
      // 製作json web token
      const tokenObject = {_id: foundUser._id, email: foundUser.email};
      const token = jwt.sign(tokenObject, process.env.PASSPORT_SECRET);
      return res.send({
        msg:'成功登入',
        token: 'JWT '+ token,
        user: foundUser,
      })
    }else{
      return res.status(401).send('密碼錯誤')
    }

  })

})

module.exports = router;
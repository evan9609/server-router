const router = require('express').Router();

router.use((req,res,next)=>{
  console.log('正在接收一個跟auth有關的請求');
  next()
})

router.get('/testAPI',(req,res)=>{
  return res.send('成功連結auth route')
})

module.exports = router;
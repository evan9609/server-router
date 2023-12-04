const router = require('express').Router();
const Course = require('../models').course;
const courseValidation = require('../validation').courseValidation;

router.use((req,res,next)=>{
  console.log('course route正在接受一個request');
  next()
})

router.post('/',async (req,res)=>{
  // 驗證數據符合規範
  let {error} =  courseValidation(req.body);
  if(error) return res.status(400).send(error.details[0].message);

  if(req.user.isStudent()){
    return res.status(400).send('只有講師才能發布新課程,若你已經是講師,請透過講師帳號登入')
  }

  try{
    let {title, description, price} = req.body;
    let newCourse = new Course({title, description, price, instructor: req.user._id});
    console.log('課程創建中...',newCourse)
    let savedCourse = await newCourse.save();
    return res.send({
      msg: '新課程已經保存',
      savedCourse
    })
  }catch(e){
    return res.status(500).send('創建失敗')
  }
  

})
module.exports = router;

const router = require('express').Router();
const Course = require('../models').course;
const courseValidation = require('../validation').courseValidation;

router.use((req,res,next)=>{
  console.log('course route正在接受一個request');
  next()
})

// 獲得系統中的所有課程
router.get('/',async(req,res)=>{
  try{
    let courseFound = await Course.find().populate('instructor',['username','email']).exec();
    console.log(courseFound)
    return res.send(courseFound)
  }catch(e){
    return res.status(500).send(e)
  }
})
//透過學生id尋找課程
router.get('/student/:_student_id', async(req,res)=>{
  let { _student_id } = req.params;
  let courseFound = await Course.find({students: _student_id}).populate('instructor',['username','email']).exec()
  return res.send(courseFound)
})


//用講師id來尋找課程
router.get('/instructor/:_instructor_id',async(req,res)=>{
  let { _instructor_id } = req.params;
  let coursesFound = await Course.find({instructor: _instructor_id }).populate('instructor',['username','email']).exec()
  return res.send(coursesFound)

})

//用課程id尋找課程
router.get('/:_id',async(req,res)=>{
  let { _id }= req.params;
  try{
    let courseFound = await Course.findOne({ _id }).populate('instructor',['email']).exec()
    return res.send(courseFound)
  }catch(e){
    return res.status(500).send(e)
  }

})

//用課程名稱尋找課程
router.get('/findByName/:name', async(req,res)=>{
  try{
    let { name }  = req.params;
    let courseFound = await Course.find({$or: [{title: new RegExp(name)},{description: new RegExp(name)}]}).populate('instructor',['email','username']).exec();
    return res.send(courseFound)
  } catch(e){
    return res.status(500).send(e)
  }
})

// 新增課程
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

// 讓學生透過id來註冊新課程
router.post('/enroll/:_id', async(req,res)=>{
  let { _id } = req.params;
  console.log('課程註冊')
  try{
    let course = await Course.findOne({_id});
    let userId = req.user._id;
    console.log(typeof String(userId))
    if(course.students.find(name=>name === String(userId))){
      console.log('您已經註冊過了')
      return res.send({msg:'您已經註冊過了',result: false})
    }else{
      course.students.push(userId)
      if(!course.title){
        course.title = course.description
      }
      await course.save();
      return res.send({msg:'註冊成功',result: true})
    }
  }catch(e){
    console.log(e)
    return res.status(400).send('發生錯誤')
  }
})

// 更改課程
router.patch('/:_id',async(req,res)=>{
  let { error } = courseValidation(req.body);
  if(error) return res.status(400).send(error.details[0].message)

  let { _id } = req.params;

  try{
    let courseFound = await Course.findOne({_id});
    console.log(courseFound)
    if(!courseFound){
      return res.status(400).send('找不到相關課程,無法更新課程內容')
    }
    // 使用者必須是此課程講師才能編輯課程
    console.log('確認講師身分...')
    if(courseFound.instructor.equals(req.user._id)){
      let updatedCourse = await Course.findOneAndUpdate({_id},req.body,{
        new: true,
        runValidators: true
      })
      return res.send({
        msg: '課程更新成功',
        updatedCourse
      })
    }else{
      return res.status(403).send('只有此課程講師才能編輯課程')
    }
  }catch(e){
    return res.status(500).send(e)
  }
})

// 刪除課程
router.delete('/:_id', async(req,res)=>{
  let { error } = courseValidation(req.body);
  if(error) return res.status(400).send(error.details[0].message)

  let { _id } = req.params;

  try{
    let courseFound = await Course.findOne({_id});
    console.log(courseFound)
    if(!courseFound){
      return res.status(400).send('找不到相關課程,無法刪除')
    }
    // 使用者必須是此課程講師才能刪除課程
    console.log('確認講師身分...')
    if(courseFound.instructor.equals(req.user._id)){
      await Course.deleteOne({ _id }).exec()
      return res.send('課程已被刪除')
      
    }else{
      return res.status(403).send('只有此課程講師才能刪除課程')
    }
  }catch(e){
    return res.status(500).send(e)
  }
})

module.exports = router;
const mongoose = require('mongoose')
const { Schema } = mongoose;
const bcrypt = require('bcrypt');

const userSchema = new Schema({
  username: {
    type: String,
    require: true,
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    require: true,
    minlength: 6,
    maxlength: 50,
  },
  role: {
    type: String,
    enum: [
      'student','instructor'
    ],
  },
  date: {
    type: Date,
    default: Date.now,
  }
})

// instance methods
userSchema.methods.isStudent = function(){
  return this.role == 'student'
}

userSchema.methods.isInstructor = function(){
  return this.role == 'instructor'
}

userSchema.method.comparePassword = async function(password,cb){
  let result = await bcrypt.compare(password, this.password)
  return cb(null, result)
}

//mongoose middlewares
//若使用者為新用戶或正在更改密碼,則幫密碼進行雜湊處裡
userSchema.pre('save', async function(next){
  // this 代表mongoDB內的document
  if(this.isNew || this.isModified('password')){
    //將密碼進行湊處理
    const hashValue = await bcrypt.hash(this.password, 10);
    this.password = hashValue;
  }
  next()
})

module.exports = mongoose.model('User', userSchema)
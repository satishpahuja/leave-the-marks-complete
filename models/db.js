var chalk = require('chalk');
var mongoose = require('mongoose');

//Salt Factor is No of iterations to hash the password
var SALT_WORK_FACTOR = 10;
const crypto = require('crypto');


//URI without port is deprecated in latest releases and earlier code should be replaced with these two lines
//var dbURI = 'mongodb://localhost:27017/test';

var dbURI = 'mongodb://signupmarks:lovenode2018@ds137631.mlab.com:37631/leavethemarks';

mongoose.connect(dbURI, {useNewUrlParser: true});

mongoose.connection.on('connected',function(){
    console.log(chalk.yellow('Mongoose connected to ' +dbURI));
})

mongoose.connection.on('error',function(err){
    console.log(chalk.yellow('Mongoose Error ' +err));
})

mongoose.connection.on('disconnected',function(){
    console.log(chalk.yellow('Mongoose connected to ' +dbURI));
})


var userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    email: { type: String, unique: true },
    password: String
  });

  //These are hooks will be invoked before saving operation
userSchema.pre('save', function (next) {
    var user = this;
    
    // generate salt
    salt = crypto.randomBytes(32).toString('base64');
    console.log("Before registering the user");

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();
  
    //128 is no of characters should be in the hash and algorithm is sha512
    const key = crypto.pbkdf2Sync(user.password, salt, SALT_WORK_FACTOR, 128, 'sha512');
    user.password = '$2a$' + SALT_WORK_FACTOR + '$' + salt + '$' + key.toString('hex');
    next();
  });
  
  userSchema.methods.comparePassword = function (candidatePassword, cb) {
  
    var salt = this.password.split("$")[3];
    const key = crypto.pbkdf2Sync(candidatePassword, salt, SALT_WORK_FACTOR, 128, 'sha512');
    console.log("Hash key value", key.toString('hex'));
    console.log("Password", this.password.toString('hex'));
    if ('$2a$' + SALT_WORK_FACTOR + '$' + salt + '$' + key.toString('hex') === this.password) {
      return cb(null, true)
    }
    else {
      return cb(new Error("Invalid password!"));
    }
  };

  // Build the User model
  mongoose.model('User', userSchema);

  // Stories Schema

var storiesSchema = new mongoose.Schema({
  author:String,
  title: {type: String,unique:true},
  created_at:{type:Date,default:Date.now},
  summary:String,
  content: {type: String},
  imageLink:String,
  comments:[{body:String,commented_by:String,date:Date}],
  slug:String
});

// Build the User model

mongoose.model( 'Story', storiesSchema,'stories');


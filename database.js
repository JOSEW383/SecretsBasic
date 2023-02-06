const mongoose = require('mongoose');
var encrypt = require('mongoose-encryption');
const passportLocalMongoose = require('passport-local-mongoose');
const findOrCreate = require('mongoose-findorcreate');


const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    googleId: String,
    picture: String,
    name: String,
    secret: String
  });
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
const User = mongoose.model("User", userSchema);
module.exports.User = User;


module.exports.main = main;
async function main() {
  mongoose.set('strictQuery', true);
  
  const mongoURL = 'mongodb+srv://Admin:'+process.env.MONGODB_ATLAS_SECRET+'@'+process.env.MONGODB_ATLAS_URL+'/secretsBasicDB'
  await mongoose.connect(mongoURL); // Cloud
  // await mongoose.connect('mongodb://127.0.0.1:27017/secretsBasicDB'); // Local
  
  console.log("MongoDB conected");
  initDatabase();
}


function initDatabase(){ 
    User.find({},async function(err, data){
      if(err){
        console.log("Error: "+err)
      }else{
        if(!data || data.length === 0){
          const userEmail = "a@a.a"
          const userPassword = "a"
          const userSecret = "Jack Bauer is my hero."
          const userId = await createUser(userEmail, userPassword)
          setUserSecret(userId, userSecret)
          console.log("Database initied");
        }
      }
    });
}


module.exports.createUser = createUser;
function createUser(username, password){
  return new Promise((resolve, reject) => {
    User.register({username: username}, password, function(err, user){
      if(err){
        reject(err);
      }else{
        resolve(user.id);
      }
    });
  });
};


module.exports.getUser = getUser;
function getUser(username){
  return new Promise((resolve, reject) => {
    User.findOne({username: username},
      function(err, user) {
        if (err) reject(err);
        if(user){
          resolve(user);
        }else{
          resolve("No user found");
        }
    });
  });
}


module.exports.setUserSecret = setUserSecret;
function setUserSecret(userId, secret){
  User.findById(userId, function(err, foundUser){
    if (err) {
        console.log(err);
    } else {
        if (foundUser) {
          // console.log("foundUser: "+userId);
            foundUser.secret = secret;
            foundUser.save();
        }
    }
  });
};

module.exports.getAllSecrets = getAllSecrets;
function getAllSecrets(){
  return new Promise((resolve, reject) => {
    User.find({secret: {$ne: null}}, function(err, users){
      if(err){
        reject(err);
      }else{
        const secrets = [];
        users.forEach(function(user){
          secrets.push(user.secret);
        })
        resolve(secrets);
      }
    });
  });
};
var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
var passwordHash = require('password-hash');
var unirest = require('unirest');
var API_URL = 'https://teddinodeapp.azurewebsites.net/';
// var API_URL = 'http://localhost:3005/';
// cosmos
const cosmosClient = require('../cosmosConnection')
const config = require('../config')
const UserList = require('../controller/userlist')
const UserDao = require('../models/userDao')

//Todo App:
const userDao = new UserDao(cosmosClient, config.databaseId, config.containerUserId)
const userList = new UserList(userDao)

userDao
  .init(err => {
    console.error(err)
  })
  .catch(err => {
    console.error(err)
    console.error(
      'Shutting down because there was an error settinig up the database.'
    )
    process.exit(1)
  })

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.put('/registration', [
  // check('name').isLength({ min: 5 }).withMessage('Must be at least 5 chars long'),
  check('email').isEmail().withMessage('Invalid Email Id'),
  check('password','Password is required').not().isEmpty(),
  // check('child_dob','Child DOB is required').not().isEmpty(),
  // check('child_age_range','Child Age Range is required').not().isEmpty(),
  // check('child_gender','Child Gender is required').not().isEmpty(),
  check('child_data','Child Data is required').not().isEmpty(),
  check('parent_age_range','Parent Age Range is required').not().isEmpty(),
  check('parent_gender','Parent Gender is required').not().isEmpty(),
  check('zip_code','Zip code is required').not().isEmpty(),
  check('occupation','Occupation is required').not().isEmpty(),
  check('ethnicityMaster','Ethnicity Master is required').not().isEmpty(),
  check('ethnicityChild','Ethnicity Child is required').not().isEmpty()
], (req,res)=>{
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ 
      status:422,
      errors: errors.array() 
    })
  }
  // var conversationId = await userList.checkConversationId(req, res);
  // if(conversationId.length>0){
    userList.checkEmail(req, res).then(async(getData)=>{
      // res.json(data)
      if(getData.length>0){
        res.status(400).json({
          status:400,
          msg:'Email id already registered'
        })
      }else{
        let conversationId = req.body.conversationId;
        var userData = await userList.checkConversationId(conversationId);
        if(userData.length>0){
          req.body.id = userData[0].id
          req.body.password = passwordHash.generate(req.body.password);
          userList.userRegister(req, res).then(addData=>{
            res.status(200).json({
              status:200,
              msg:'Registered Successfully',
              userData: addData
            })
          })
          .catch(err =>{
            console.log("err",err)
            res.status(400).json({
              status:400,
              msg:'Oops!! Something Went Wrong.'
            })
            
          })
        }else{
          res.status(400).json({
            status:400,
            msg:'Invalid Conversation Id'
          })
        }
      }
    })
    .catch(err => {
      res.json(err)
    })
  // }
  
})

router.post('/login',[
  check('email').isEmail().withMessage('Invalid Email Id'),
  check('password','Password is required').not().isEmpty()
], (req,res)=>{
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ 
      status:422,
      errors: errors.array() 
    })
  }
  userList.checkEmail(req, res).then(getData=>{
    // res.json(data)
    if(getData.length>0){
      if(passwordHash.verify(req.body.password, getData[0].password)){
        res.status(200).json({
          status:200,
          msg:'Login Successfully',
          userData: getData
        })
      }else{
        res.status(400).json({
          status:400,
          msg:'Password not matched'
        })
      }
      
    }else{
      res.status(400).json({
        status:400,
        msg:'Email id not found'
      })
    }
  })
  .catch(err => {
    res.json(err)
  })
})

router.post('/addUser', [
  check('conversationId','Conversation Id is required').not().isEmpty(),
  check('lat','Latitude value is required').not().isEmpty(),
  check('long','Longitude value is required').not().isEmpty(),
  check('zip_code','Zip code is required').not().isEmpty(),
], async(req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ 
      status:422,
      errors: errors.array() 
    })
  }

  let conversationId = req.body.conversationId;
  var checkConversationId = await userList.checkConversationId(conversationId);
  if(checkConversationId.length>0){
    res.status(400).json({
      status:400,
      msg:'Conversation Id already exists'
    })
  }else{
    userList.addUser(req, res).then(addData=>{
      res.status(200).json({
        status:200,
        msg:'User Added Successfully',
        userData: addData
      })
    })
    .catch(err =>{
      res.json(err)
    })
  }
})

router.post('/forgotpassword',[
  check('email').isEmail().withMessage('Invalid Email Id')
], (req, res)=>{
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ 
      status:422,
      errors: errors.array() 
    })
  }

  userList.checkEmail(req, res).then(async(getData)=>{
    // res.json(data)
    if(getData.length>0){
      userList.forgotPassword(getData[0].id).then(data =>{
        res.status(200).json({
          status:200,
          msg:'New password send to your email id'
        })
      })
      .catch(err=>{
        res.json(err)
      })
    }else{
      res.status(400).json({
        status:400,
        msg:'please check your email id'
      })
    }
  })
  .catch(err => {
    res.json(err)
  })
})

router.post('/resetPassword',[
  check('email').isEmail().withMessage('Invalid Email Id'),
  check('oldPassword','Old Password is required').not().isEmpty(),
  check('newPassword','New Password is required').not().isEmpty()
], (req, res)=>{
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ 
      status:422,
      errors: errors.array() 
    })
  }
  //check user's mail
  userList.checkEmail(req, res).then(async(getData)=>{
    if(getData.length>0){
      //check old password
      if(passwordHash.verify(req.body.oldPassword, getData[0].password)){
        //reset password
        userList.resetPassword(getData[0].id, req.body.newPassword).then(data =>{
          res.status(200).json({
            status:200,
            msg:'Password reset successfully'
          })
        })
        .catch(err=>{
          res.json(err)
        })
      }else{
        res.status(400).json({
          status:400,
          msg:'Password not matched'
        })
      }
      
    }else{
      res.status(400).json({
        status:400,
        msg:'please check your email id'
      })
    }
  })
  .catch(err => {
    res.json(err)
  })
})

router.post('/setName', async(req, res)=>{
  try{
    let conversationId = req.body.conversationId;
    var userData = await userList.checkConversationId(conversationId);
    if(userData.length>0){
      // req.body.id = userData[0].id;
      userList.setName(userData[0].id, req.body.fname, req.body.lname).then(async(getData)=>{
        res.status(200).json({
          status:200,
          msg:'Saved Full Name'
        })
      })
      .catch(err => {
        res.json(err)
      })
      
    }else{
      res.status(400).json({
        status:400,
        msg:'Invalid Conversation Id'
      })
    }
  }catch(err){
    res.json(err)
  }
})

router.get('/getSingleUser',[
  check('conversationId','Conversation Id is required').not().isEmpty()
], async(req, res)=>{
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ 
      status:422,
      errors: errors.array() 
    })
  }

  try{
    let conversationId = req.query.conversationId;
    var userData = await userList.checkConversationId(conversationId);
    if(userData.length>0){
      await userList.updateLastActiveTime(userData[0].id);
      res.status(200).json({
        status:200,
        userData: userData[0]
      })
      
    }else{
      res.status(400).json({
        status:400,
        msg:'Invalid Conversation Id'
      })
    }
  }catch(err){
    res.json(err)
  }
})

router.put('/updateUserProfile', [
  check('conversationId','Conversation Id is required').not().isEmpty(),
  // check('firstName','First Name is required').not().isEmpty(),
  // check('lastName','Last Name is required').not().isEmpty(),
  check('child_data','Child Data is required').not().isEmpty(),
  check('parent_age_range','Parent Age Range is required').not().isEmpty(),
  check('parent_gender','Parent Gender is required').not().isEmpty(),
  check('zip_code','Zip code is required').not().isEmpty(),
  check('occupation','Occupation is required').not().isEmpty(),
  check('ethnicityMaster','Ethnicity Master is required').not().isEmpty(),
  check('ethnicityChild','Ethnicity Child is required').not().isEmpty()
], async(req,res)=>{
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ 
      status:422,
      errors: errors.array() 
    })
  }
  try{
    let conversationId = req.body.conversationId;
    var userData = await userList.checkConversationId(conversationId);
    if(userData.length>0){
      req.body.id = userData[0].id;
      var updateData = await userList.updateUserDetails(req, res);
      // console.log(updateData)
      setNameInUserSession(updateData, req, res)
    }else{
      res.status(400).json({
        status:400,
        msg:'Invalid Conversation Id'
      })
    }
  }catch(e){
    res.status(400).json({
      status:400,
      msg:'Oops!! Something Went Wrong.'
    })
  }
})

var setNameInUserSession = (updateData, req, res)=>{
  console.log('host', req.headers.host);

    unirest
    .post(API_URL+'userSession/setNameInUserSession')
    .headers({'Content-Type': 'application/json'})
    .send({ 
      "conversationId": updateData.conversationId,
      "firstName": updateData.firstName,
      "lastName": updateData.lastName
    })
    .then(async(response) => {
        // console.log(response.body)
        res.status(200).json({
          status:200,
          userData: updateData
        })
    })
    .catch(err => {
      console.log('dsds')
        console.log(err)
    })
}

router.get('/getUsersList', async(req, res)=>{
  try{
    var userData = await userList.getUsersList(req, res);
    if(userData.length>0){
      res.status(200).json({
        status:200,
        userData: userData
      })
      
    }else{
      res.status(400).json({
        status:400,
        msg:'No data found'
      })
    }
  }catch(err){
    res.json(err)
  }
})

router.put('/updateLatLongOfExistingUser', [
  check('conversationId','Conversation Id is required').not().isEmpty(),
  check('lat','Latitude value is required').not().isEmpty(),
  check('long','Longitude value is required').not().isEmpty(),
  check('zip_code','Zip code is required').not().isEmpty(),
], async(req,res)=>{
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ 
      status:422,
      errors: errors.array() 
    })
  }
  try{
    let conversationId = req.body.conversationId;
    var userData = await userList.checkConversationId(conversationId);
    // console.log(userData)
    if(userData.length>0){
      req.body.id = userData[0].id;
      var updateData = await userList.updateLatLongOfExistingUser(req, res);
      res.status(200).json({
        status:200,
        msg:'Updated Successfully'
      })
    }else{
      res.status(400).json({
        status:400,
        msg:'Invalid Conversation Id'
      })
    }
  }catch(e){
    res.status(400).json({
      status:400,
      msg:'Oops!! Something Went Wrong.'
    })
  }
})

router.get('/getUsersListByPostcode',[
  check('zip_code','Zip code is required').not().isEmpty(),
], async(req, res)=>{
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ 
      status:422,
      errors: errors.array() 
    })
  }
  try{
    var userData = await userList.getUsersListByPostcode(req, res);
    res.status(200).json({
      status:200,
      userData: userData
    })
  }catch(err){
    res.json(err)
  }
})

module.exports = router;

var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
var passwordHash = require('password-hash');
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
  check('child_dob','Child DOB is required').not().isEmpty(),
  check('child_age_range','Child Age Range is required').not().isEmpty(),
  check('child_gender','Child Gender is required').not().isEmpty(),
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
        var userData = await userList.checkConversationId(req, res);
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
  check('conversationId','Conversation Id is required').not().isEmpty()
], async(req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ 
      status:422,
      errors: errors.array() 
    })
  }

  var checkConversationId = await userList.checkConversationId(req, res);
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

module.exports = router;

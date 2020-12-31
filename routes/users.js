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
const BotDataList = require('../controller/botdataList')
const BotDataDao = require('../models/botDataDao')

//Todo App:
const userDao = new UserDao(cosmosClient, config.databaseId, config.containerUserId)
const userList = new UserList(userDao)
const botDataDao = new BotDataDao(cosmosClient, config.databaseId, config.containerUserSessionId)
const botDataList = new BotDataList(botDataDao)

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

botDataDao
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
  // check('lat','Latitude value is required').not().isEmpty(),
  // check('long','Longitude value is required').not().isEmpty(),
  // check('zip_code','Zip code is required').not().isEmpty(),
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
      let countDays = await botDataList.lastChatDaysCount(req, res)
      if(countDays>14){
        res.status(200).json({
          status:200,
          directlineStatus:'Expired',
          userData: userData[0]
        })
      }else{
        res.status(200).json({
          status:200,
          userData: userData[0]
        })
      } 
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

// router.put('/updateLatLongOfExistingUser', [
router.put('/addNewParamsOfExistingUser', [
  check('conversationId','Conversation Id is required').not().isEmpty(),
  check('lat','Latitude value is required').not().isEmpty(),
  check('long','Longitude value is required').not().isEmpty(),
  check('zip_code','Zip code is required').not().isEmpty(),
  check('fcmToken','FCM token is required').not().isEmpty(),
  check('deviceType','Device Type is required').not().isEmpty(),
  // check('notificationEnabled','notificationEnabled is required').not().isEmpty(),
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
      // var updateData = await userList.updateLatLongOfExistingUser(req, res);
      var updateData = await userList.addNewParamsOfExistingUser(req, res);
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

router.post('/iosReceiptValidator', [
  check('isSandbox','isSandbox field is required').not().isEmpty()
 ], (req, res)=>{
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ 
      status:422,
      errors: errors.array() 
    })
  }
  
  let iosValidatorURL =  (req.body.isSandbox === 'true')? 'https://sandbox.itunes.apple.com/verifyReceipt':'https://buy.itunes.apple.com/verifyReceipt';
  
  unirest
    // .post(process.env.IOS_VALIDATOR_URL)
    .post(iosValidatorURL)
    .headers({'Content-Type': 'application/json'})
    .send({ 
      "receipt-data": req.body.appReceipt,
      "password": '3974dc4c76034bd8ba85a31da0fe2751',
      "exclude-old-transactions": true
    })
    .then(async(response) => {
        res.status(200).json({
          data: response.body
        })
    })
    .catch(err => {
      console.log('dsds')
      console.log(err)
    })
})

router.put('/updateAccessEnabledBy', [
  check('conversationId','Conversation Id is required').not().isEmpty(),
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
      // req.body.id = userData[0].id;
      var updateData = await userList.updateAccessEnabledBy(userData[0].id, 'inapppurchase');
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
    res.status(500).json({
      msg:'Oops!! Something Went Wrong.'
    })
  }
})

router.post('/reminderAllUserForTeddiExpiration', async(req,res)=>{
  try{
    let dataList = await botDataList.reminderAllUserForTeddiExpiration(req, res)
    let fcmTokenArr = [];
    for(var i=0; i<dataList.length; i++){
      var userData = await userList.checkConversationId(dataList[i].conversationId);
      if(userData[0].fcmToken){
        fcmTokenArr.push(userData[0].fcmToken)
      }
    }
    
    let msg = "It looks like you have been away for a while. Teddi is still here to support you. Come on in!"
    
    unirest
    .post('https://fcm.googleapis.com/fcm/send')
    .headers({'Content-Type': 'application/json', "Authorization": 'key='+process.env.FIREBASE_SERVER_KEY})
    .send({ 
      "notification": {
        "title": "Teddi",
        "body": msg,
        "sound": "default",
        "visibility": 1
      },
      "registration_ids": fcmTokenArr
    })
    .then((response) => {
      res.status(200).json(response.body)
    })
    .catch(error => {
      console.log(error)
    })
  }catch(e){
    res.json(e)
  }
})

router.post('/sentDailyNotification', async(req,res)=>{
  try{
    let dataList = await userList.getAllFcmListForDailyNotification(req, res)
    // res.status(200).json(dataList)
    let msgList = [
      "The years between birth and starting school are a time of amazing growth and development. I’m here to help 😊 ",
      "Take some time for yourself too. It’s not always easy. Come on in and talk to me about ‘valuing me’.",
      "How’s it going, user name?",
      "Your early years robo support has some helpful advice for you! Come and explore!",
      "How are you feeling today?",
      "Early years are an important time to help your child to discover healthy habits. Come on in and find out how!",
      "Need some support on being active as a family? Come on in and let’s talk about it!",
      "Need some support on breast or bottle feeding? Come on in and let’s talk about it!",
      "Would you like to learn about the Healthy Start Scheme or vaccinations? Come on in and explore giving the healthiest start!",
      "You’re doing great! Take this moment to smile 😊 ",
      "How are mealtimes? Come on in and explore how eating can be fun and healthy!",
      "How have the last few days been for you, user name?",
      "The early years between 0-5 are so important and play a crucial role in laying the foundations for a future healthy life. I’m here to help!",
      "It may feel like everyone has an opinion on what you should be doing. I can offer evidence-based support on a range of issues and topics. Let’s talk!"
    ]
    let getOneMsg = msgList[Math.floor(Math.random() * msgList.length)];
    for(var i=0; i< dataList.length; i++){
      var msg = getOneMsg.replace("user name", dataList[i].firstName)
      // console.log(msg)
      await sendDailyNotificationToEveryUser(msg, dataList[i].fcmToken)
    }
    // console.log('Sent Daily Notification To Every User')
    res.status(200).json('Sent Daily Notification To Every User')
  }catch(e){
    res.json(e)
  }
})

var sendDailyNotificationToEveryUser = (msg, fcmToken)=>{
  unirest
    .post('https://fcm.googleapis.com/fcm/send')
    .headers({'Content-Type': 'application/json', "Authorization": 'key='+process.env.FIREBASE_SERVER_KEY})
    .send({ 
      "notification": {
        "title": "Teddi",
        "body": msg,
        "sound": "default",
        "visibility": 1
      },
      "to": fcmToken
    })
    .then((response) => {
      console.log(response.body)
    })
    .catch(error => {
      console.log(error)
    })
}

router.post('/updateNotificationEnabled', async(req, res)=>{
  try{
    var userData = await userList.getUsersList(req, res);
    if(userData.length>0){
      for(var i=0; i<userData.length; i++){
        if(!userData[i].notificationEnabled){
          console.log(userData[i].conversationId)
          await userList.updateNotificationEnabled(userData[i].conversationId);         
        }
      }
      console.log('update all NotificationEnabled to true')
      res.status(200).json({
        status:200,
        msg: 'update all NotificationEnabled to true'
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

module.exports = router;

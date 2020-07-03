var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
var passwordHash = require('password-hash');
// cosmos
const cosmosClient = require('../cosmosConnection')
const config = require('../config')
const BotDataList = require('../controller/botdataList')
const BotDataDao = require('../models/botDataDao')

//Todo App:
const botDataDao = new BotDataDao(cosmosClient, config.databaseId, config.containerUserSessionId)
const botDataList = new BotDataList(botDataDao)

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


router.get('/getAll', function(req, res, next) {
  botDataList.getAllList(req, res).then(getData=>{
    if(getData.length > 0){
      res.status(200).json({
        status:200,
        data: getData
      })
    }else{
      res.status(400).json({
        status:400,
        msg: 'no data found'
      })
    }
    
  })
  .catch(err =>{
    res.status(500).json(err)
  })
});



router.post('/setNameInUserSession', async(req, res)=>{
  try{
    var userData = await botDataList.checkConversationId(req, res);
    if(userData.length>0){
      console.log(userData[0].id)
      
      botDataList.setUserName(userData[0]._etag, req.body.firstName, req.body.lastName).then(async(getData)=>{
        res.status(200).json({
          status:200,
          msg:'Saved Full Name'
        })
      })
      .catch(err => {
        res.json(err)
      })
      
      // res.json(userData)
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


module.exports = router;

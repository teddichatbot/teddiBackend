var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
var multer  = require('multer');
var xlsxj = require("xlsx-to-json");
// cosmos
const cosmosClient = require('../cosmosConnection')
const config = require('../config')
const Feedbacklist = require('../controller/feedbacklist')
const FeedbackDao = require('../models/feedbackDao')

const UserList = require('../controller/userlist')
const UserDao = require('../models/userDao')

//Todo App:
const feedbackDao = new FeedbackDao(cosmosClient, config.databaseId, config.containerFeedbackId)
const feedbacklist = new Feedbacklist(feedbackDao)

const userDao = new UserDao(cosmosClient, config.databaseId, config.containerUserId)
const userList = new UserList(userDao)

feedbackDao
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

router.post('/addFeedback', [
  check('conversationId','Conversation Id is required').not().isEmpty(),
  // check('feedbackMsg','Message is required').not().isEmpty(),
], async(req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ 
      status:422,
      errors: errors.array() 
    })
  }

  if(!req.body.chapterType){
    req.body.chapterType = 'global'
  }

  if(!req.body.isSmiled){
    req.body.isSmiled = ''
  }
  if(!req.body.qa){
    req.body.qa = []
  }

  if(req.body.chapterType == 'global'){
    addFeedbackFunc(req, res)
  }else{
    try{
      let feedbackData = await feedbacklist.getUserFeedbackOfASingleChapter(req,res);
      
      if(feedbackData.length>0){
        await feedbacklist.updateFeedback(feedbackData[0].id, req.body);
        let getData = await feedbacklist.getUserFeedbackOfASingleChapter(req,res);
        res.status(200).json({
          status:200,
          msg:'Updated feedback Successfully',
          feedbackData: getData[0]
        })
      }else{
        addFeedbackFunc(req, res)
      }
    }catch(err){
      res.json(err)
    }
  }
  // await feedbacklist.getUserFeedbackOfASingleChapter(req,res);

  
})

async function addFeedbackFunc(req, res){

  feedbacklist.addFeedback(req, res).then(async(addData)=>{ 
    try{
      let conversationId = req.body.conversationId;
      var userData = await userList.checkConversationId(conversationId);
      var giveFeedback = await userList.giveFeedback(userData[0].id);
      res.status(200).json({
        status:200,
        msg:'Add feedback Successfully',
        feedbackData: addData,
        // giveFeedback: giveFeedback
      })
    }catch(e){
      console.log('eeeee')
      res.json(err)
    }
  })
  .catch(err =>{
    res.json(err)
  })
}


router.get('/getAllFeedback', (req,res)=>{
  feedbacklist.getAll(req, res).then(getData=>{
    res.status(200).json({
      status:200,
      feedbackList: getData
    })
  })
  .catch(err =>{
    res.json(err)
  })
})

router.get('/giveFeedbackUserList', async(req, res)=>{
  try{
    let userData = await userList.giveFeedbackUsersList(req,res);
    res.status(200).json({
      status:200,
      userData: userData
    })
  }catch(err){
    res.json(err)
  }
})

router.get('/getFeedbackByUser/:catrgotyId', async(req, res)=>{
  
  try{
    let feedbackData = await feedbacklist.getFeedbackListBySingleUser(req,res);
    let appFeedBack = feedbackData.filter(data => data.chapterType == 'global')
    let chatFeedBack = feedbackData.filter(data => data.chapterType !== 'global')
    res.status(200).json({
      status:200,
      appFeedBack: appFeedBack,
      chatFeedBack: chatFeedBack
    })
  }catch(err){
    res.json(err)
  }
})

router.post('/findUserFeedbackOfASingleChapter', [
  check('conversationId','Conversation Id is required').not().isEmpty(),
  check('chapterType','Chapter Type is required').not().isEmpty(),
], async(req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ 
      status:422,
      errors: errors.array() 
    })
  }

  try{
    let feedbackData = await feedbacklist.getUserFeedbackOfASingleChapter(req,res);
    if(feedbackData.length>0){
      res.status(200).json({
        status:200,
        feedbackData: feedbackData[0]
      })
    }else{
      res.status(200).json({
        msg: 'No data found'
      })
    }
    
  }catch(err){
    res.json(err)
  }

})

router.post('/getFeedbacklistForExporting',[
  check('chapterType','Chapter Type is required').not().isEmpty(),
  check('startDate','Start Date is required').not().isEmpty(),
  check('endDate','End Date is required').not().isEmpty(),
], async(req, res)=>{
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ 
      status:422,
      errors: errors.array() 
    })
  }
  feedbacklist.getListForExporting(req, res).then(getData=>{
    res.status(200).json({
      status:200,
      feedbackList: getData
    })
  })
  .catch(err =>{
    res.json(err)
  })
})

router.post('/feedBackListByConvIds', async(req, res)=>{
  try{
    let feedbackData = await feedbacklist.feedBackListByConvIds(req,res);
    // let appFeedBack = feedbackData.filter(data => data.chapterType == 'global')
    let chatFeedBack = feedbackData.filter(data => data.chapterType !== 'global')
    res.status(200).json({
      status:200,
      feedbackData: chatFeedBack
    })
  }catch(err){
    res.json(err)
  }
})

module.exports = router;

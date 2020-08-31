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

//Todo App:
const feedbackDao = new FeedbackDao(cosmosClient, config.databaseId, config.containerFeedbackId)
const feedbacklist = new Feedbacklist(feedbackDao)

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


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a feeback');
});

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

  feedbacklist.addFeedback(req, res).then(addData=>{
    res.status(200).json({
      status:200,
      msg:'Add feedback Successfully',
      feedbackData: addData
    })
  })
  .catch(err =>{
    res.json(err)
  })
})


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

// router.get('/getSinglePostcodeDetails', [
//   check('postcode','Postcode is required').not().isEmpty(),
// ], (req,res)=>{
//   const errors = validationResult(req)
//   if (!errors.isEmpty()) {
//     return res.status(422).json({ 
//       status:422,
//       errors: errors.array() 
//     })
//   }
//   postcodeslist.getSinglePostcodeDetails(req, res).then(getData=>{
//     if(getData.length > 0){
//       res.status(200).json({
//         status:200,
//         postcodeData: getData[0]
//       })
//     }else{
//       res.status(400).json({
//         status:400,
//         msg: 'No data found'
//       })
//     }
    
//   })
//   .catch(err =>{
//     res.json(err)
//   })
// })


module.exports = router;

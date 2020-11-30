var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
var multer  = require('multer');
var xlsxj = require("xlsx-to-json");
// cosmos
const cosmosClient = require('../cosmosConnection')
const config = require('../config')
const FeedbackQAlist = require('../controller/feedbackQAlist')
const FeedbackQADao = require('../models/feedbackQADao')

//Todo App:
const feedbackQADao = new FeedbackQADao(cosmosClient, config.databaseId, config.containerFeedbackQAId)
const feedbackQAlist = new FeedbackQAlist(feedbackQADao)

feedbackQADao
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

router.post('/addFeedbackQA', [
  check('feedbackQuestion','Question is required').not().isEmpty(),
  check('answerOptions','Options Id is required').not().isEmpty(),
  check('chapter','Chapter is required').not().isEmpty(),
], async(req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ 
      status:422,
      errors: errors.array() 
    })
  }

  feedbackQAlist.addFeedbackQA(req, res).then(async(addData)=>{
    res.status(200).json({
      data: addData,
    })
  })
  .catch(err =>{
    res.json(err)
  })
})


// router.get('/getAllFeedback', (req,res)=>{
//   feedbacklist.getAll(req, res).then(getData=>{
//     res.status(200).json({
//       status:200,
//       feedbackList: getData
//     })
//   })
//   .catch(err =>{
//     res.json(err)
//   })
// })

router.get('/getFeedbackQAbyChapter',[
  check('chapter','Chapter is required').not().isEmpty(),
], (req,res)=>{
  feedbackQAlist.getQAbyChapter(req, res).then(getData=>{
    // if(getData.length>0){
    //   res.status(200).json(getData)
    // }else{
    //   res.status(200).json({ msg: 'No data found' })
    // }
    res.status(200).json(getData)
  })
  .catch(err =>{
    res.status(400).json(err)
  })
})



module.exports = router;

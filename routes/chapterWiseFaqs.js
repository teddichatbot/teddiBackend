var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
// cosmos
const cosmosClient = require('../cosmosConnection')
const config = require('../config')
const Chapterwisefaqlist = require('../controller/chapterwisefaqlist')
const ChapterWiseFaqDao = require('../models/chapterWiseFAQDao')

//Todo App:
const chapterWiseFaqDao = new ChapterWiseFaqDao(cosmosClient, config.databaseId, config.containerChapterWiseFaqId)
const chapterwisefaqlist = new Chapterwisefaqlist(chapterWiseFaqDao)

chapterWiseFaqDao
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

router.post('/addChapterWiseFaq', [
    check('faq','FAQ is required').not().isEmpty(),
    check('answer',"FAQ's answer is required").not().isEmpty(),
    check('chapterName','Chapter Name is required').not().isEmpty(),
  ],async(req, res) => {
  chapterwisefaqlist.addChapterWiseFaq(req, res).then(addData=>{
    res.status(200).json({
      status:200,
      data: addData
    })
  })
  .catch(err =>{
    res.json(err)
  })
})

router.post('/checkFaq',[
  check('faq','FAQ is required').not().isEmpty(),
], async(req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ 
      status:422,
      errors: errors.array() 
    })
  }
    
  chapterwisefaqlist.checkFaq(req, res).then(getData=>{
    if(getData.length > 0){
      res.status(200).json({
        status:200,
        chatData: getData[0]
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
})



module.exports = router;

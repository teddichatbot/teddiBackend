var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
var multer  = require('multer');
var xlsxj = require("xlsx-to-json");
// cosmos
const cosmosClient = require('../cosmosConnection')
const config = require('../config')
const RandomMsglist = require('../controller/randomMsglist')
const RandomMsgDao = require('../models/randomMsgDao')

//Todo App:
const randomMsgDao = new RandomMsgDao(cosmosClient, config.databaseId, config.containerRandomMsgId)
const randomMsglist = new RandomMsglist(randomMsgDao)

randomMsgDao
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

  

router.post('/addRandomMsg', [
  check('respMsg','Message is required').not().isEmpty(),
  check('chapterType','Chapter Type is required').not().isEmpty(),
], async(req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ 
      status:422,
      errors: errors.array() 
    })
  }

  randomMsglist.addRandomMsg(req, res).then(addData=>{
    res.status(200).json({
      status:200,
      msg:'Add Random Message Successfully',
      msgData: addData
    })
  })
  .catch(err =>{
    res.json(err)
  })
})

router.post('/bulkInsertRandomMsg', async(req, res)=>{
  let addData = await bulkInsertFunc(req, res);
  res.send('Bulk insert complete')
})
const bulkInsertFunc = async(req, res)=>{
  for(var i=0; i<req.body.msgList.length; i++){
    // console.log(req.body.msgList[i].respMsg)
    try{
      await randomMsglist.addRandomMsgForBulkInsert(req.body.msgList[i].respMsg, req.body.msgList[i].predict, req.body.chapterType);
    }catch(err){
      console.log('error'+i, req.body.msgList[i].respMsg)
    }
  }
}

router.get('/msgListByChapter', [
  check('chapterType','Chapter Type is required').not().isEmpty(),
], (req, res)=>{
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ 
      status:422,
      errors: errors.array() 
    })
  }
  // res.send(req.query.chapterType)
  randomMsglist.getMsgListByChapter(req, res).then(getData=>{
    res.status(200).json({
      status:200,
      msgData: getData
    })
  })
  .catch(err =>{
    res.json(err)
  })
})

module.exports = router;

var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
var multer  = require('multer');
var xlsxj = require("xlsx-to-json");
var unirest = require('unirest');
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
      msg:'Message Added Successfully',
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

router.get('/getAllRandomMsg', (req,res)=>{
  randomMsglist.getAllMsgList(req, res).then(getData=>{
    res.status(200).json({
      status:200,
      msgData: getData
    })
  })
  .catch(err =>{
    res.json(err)
  })
})

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

router.post('/UpdateRandomMsg', [
  check('respMsg','Message is required').not().isEmpty(),
  check('chapterType','Chapter Type is required').not().isEmpty(),
  check('msgId','Messsage Id is required').not().isEmpty(),
], async(req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ 
      status:422,
      errors: errors.array() 
    })
  }

  randomMsglist.updateRandomMsg(req, res).then(updateData=>{
    res.status(200).json({
      status:200,
      msg:'Updated Successfully',
      msgData: updateData
    })
  })
  .catch(err =>{
    res.json(err)
  })
})

router.post('/randMsgMigrateIntoLiveServer', async(req, res)=>{

  unirest
    .get('https://teddinodeapp.azurewebsites.net/randomMsg/getAllRandomMsg')
    // .headers({'Content-Type': 'application/json'})
    .then(async(response) => {
        // console.log(response.body.msgData.length) 
        for(var i=0; i<response.body.msgData.length; i++){
          await randomMsglist.addRandomMsgForBulkInsert(response.body.msgData[i].respMsg, response.body.msgData[i].predict, response.body.msgData[i].chapterType)
          console.log('length',i);
        } 
        console.log('bulk insert random msg in live server')
        res.json('bulk insert random msg in live server')
    })
    .catch(err => {
        // console.log(" id: "+id)
      res.json(err)
    })
  
})

// router.post('/deleteRandomMsg', (req, res)=>{
//   randomMsglist.deleteRandMsg(req.body.msgId).then(succres=>{
//     res.send(succres)
//   })
//   .catch(err=>{
//     res.json(err)
//   })
// })

// router.post('/bulkDeleteRandomMsg', (req,res)=>{
  // randomMsglist.getAllMsgList(req, res).then(async(result)=>{
    
//     for(var i=result.length-1; i>539; i--){
//       await randomMsglist.deleteRandMsg(result[i].id)
//       console.log('length',i);
//     }
//     console.log('All data deleted');
//     res.json('All data deleted')
//   })
//   .catch(err=>{
//     res.json(err)
//   })
// })

module.exports = router;

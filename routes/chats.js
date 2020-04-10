var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
// cosmos
const cosmosClient = require('../cosmosConnection')
const config = require('../config')
const ChatList = require('../controller/chatlist')
const ChatDao = require('../models/chatDao')

//Todo App:
const chatDao = new ChatDao(cosmosClient, config.databaseId, config.containerChatHistoryId)
const chatList = new ChatList(chatDao)

chatDao
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

router.post('/saveChat', async(req, res) => {
    
  chatList.saveChat(req, res).then(addData=>{
    res.status(200).json({
      status:200,
      msg:'Save chat Successfully',
      chatData: addData
    })
  })
  .catch(err =>{
    res.json(err)
  })
})



module.exports = router;

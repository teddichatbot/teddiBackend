var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
// cosmos
const cosmosClient = require('../cosmosConnection')
const config = require('../config')
const QuotesList = require('../controller/quoteslist')
const QuotesDao = require('../models/quotesDao')

//Todo App:
const quotesDao = new QuotesDao(cosmosClient, config.databaseId, config.containerLoadingScreenQuotesId)
const quoteslist = new QuotesList(quotesDao)

quotesDao
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

router.post('/addQuotes', async(req, res) => {
  quoteslist.addQuotes(req, res).then(addData=>{
    res.status(200).json({
      status:200,
      msg:'Add Quotes Successfully',
      quotesData: addData
    })
  })
  .catch(err =>{
    res.json(err)
  })
})

router.get('/getAllQuotes', (req,res)=>{
  quoteslist.getAllQuotes(req, res).then(getData=>{
    res.status(200).json({
      status:200,
      quotesData: getData
    })
  })
  .catch(err =>{
    res.json(err)
  })
})


router.get('/motivationalMessages', (req,res)=>{
  quoteslist.getAllQuotes(req, res).then(getData=>{
    var respVal = getData[Math.floor(Math.random() * getData.length)];
    res.status(200).json({
      status:200,
      quotesData: respVal
    })
  })
  .catch(err =>{
    res.json(err)
  })
})

module.exports = router;

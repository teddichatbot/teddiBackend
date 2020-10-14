var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
var unirest = require('unirest');
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
        data: getData[0]
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

router.put('/updateChapterwiseFaq', [
  check('faqId','FAQ id is required').not().isEmpty(),
  check('faq','FAQ is required').not().isEmpty(),
  check('answer',"FAQ's answer is required").not().isEmpty(),
  check('chapterName','Chapter Name is required').not().isEmpty(),
] , (req, res)=>{

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ 
      status:422,
      errors: errors.array() 
    })
  }

  chapterwisefaqlist.updateChapterWiseFaq(req.body).then(getData=>{
    res.status(200).json({
      status:200,
      msg: 'updated successfuly'
    })
    
  })
  .catch(err =>{
    res.status(500).json(err)
  })
})

router.get('/getAllFaq', async(req, res) => {
    
  chapterwisefaqlist.faqList(req, res).then(getData=>{
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
})

router.get('/faqListByChapterName', [
  check('chapterName','Chapter Name is required').not().isEmpty(),
], async(req, res) => {

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ 
      status:422,
      errors: errors.array() 
    })
  }
    
  chapterwisefaqlist.faqListByChapterName(req, res).then(getData=>{
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
})

router.post('/checkFaqBySelectiveWords', async(req, res) => {
    
  chapterwisefaqlist.faqList(req, res).then( async (getData)=>{
    let getFaq = await findFaq(getData, req, res);
    // console.log(getFaq)
    
    if(getFaq){
      res.status(200).json({
        status:200,
        data: getFaq
      })
    }else{
      res.status(200).json({
        status:400,
        msg: 'no data found'
      })
    }
    
  })
  .catch(err =>{
    res.status(500).json(err)
  })
})

async function findFaq(getData, req, res){
  let userMsg = req.body.faq.toLowerCase();


  for(i=0; i< getData.length; i++){
    for(j=0; j<getData[i].faq.length; j++){
      
      var wordArr = getData[i].faq[j].split("|");
      
      var re = new RegExp(getData[i].faq[j], 'g');
      var matches = userMsg.match(re);
      if(matches != null){
        
        var matchesfilter = matches.filter((item, index) => {
          return matches.indexOf(item) === index ; //remove duplicate element
        })
        // console.log('matchesfilter',matchesfilter)
        if(wordArr.length == matchesfilter.length){
          return getData[i];
          break;
        }
      }
    }
  }
}

// router.post('/faqMigrateIntoLiveServer', async(req, res)=>{
//   chapterwisefaqlist.faqList(req, res).then(async(result)=>{
//     // console.log(result[2]);
//     for(var i=0; i<result.length; i++){
//       await addFaqIntoLiveServer(result[i].faq, result[i].question, result[i].answer, result[i].chapterName, result[i].id);
//       console.log('length',i);
//     }
//     console.log('All data inserted');
//     res.json('All data inserted')
//   })
//   .catch(err=>{
//     res.json(err)
//   })
// })

// const addFaqIntoLiveServer = (faq, question, answer, chapterName, id)=>{
//   // console.log(respMsg)
//   unirest
//     .post('https://teddibackend.azurewebsites.net/chapterFaq/addChapterWiseFaq')
//     .headers({'Content-Type': 'application/json'})
//     .send({ 
//       "faq": faq,
//       "question": question,
//       "answer": answer,
//       "chapterName": chapterName
//     })
//     .then(async(response) => {
//         console.log('success id: '+id)  
//     })
//     .catch(err => {
//         console.log("err id: "+id)
//     })
// }


router.delete('/deleteSignleFaq', [
  check('faqId','FAQ id is required').not().isEmpty()
], async(req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ 
      status:422,
      errors: errors.array() 
    })
  }
    
  chapterwisefaqlist.deleteSingleFaq(req.query.faqId).then( async (deleteData)=>{
    res.status(200).json({
      status:200,
      msg: 'Deleted Successfully'
    })
  })
  .catch(err =>{
    res.status(500).json(err)
  })
})

module.exports = router;

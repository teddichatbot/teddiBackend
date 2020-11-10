var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
var multer  = require('multer');
var xlsxj = require("xlsx-to-json");
var unirest = require('unirest');
// cosmos
const cosmosClient = require('../cosmosConnection')
const config = require('../config')
const Postcodeslist = require('../controller/postcodeslist')
const PostcodesDao = require('../models/postcodesDao')

//Todo App:
const postcodesDao = new PostcodesDao(cosmosClient, config.databaseId, config.containerPostcodeId)
const postcodeslist = new Postcodeslist(postcodesDao)

postcodesDao
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

  //store file by multer
  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'tmp/postcodeFiles/')
    },
    filename: function (req, file, cb) {
      // file.originalname = Date.now()+file.originalname;
      cb(null, file.fieldname + '-' + Date.now())
    }
  })
   
  var upload = multer({ storage: storage })

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a post code');
});

router.post('/addPostcode', [
  check('postcode','Postcode is required').not().isEmpty(),
  check('location','Location is required').not().isEmpty(),
], async(req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ 
      status:422,
      errors: errors.array() 
    })
  }

  postcodeslist.addPostcode(req, res).then(addData=>{
    res.status(200).json({
      status:200,
      msg:'Add Postcode Successfully',
      postcodeData: addData
    })
  })
  .catch(err =>{
    res.json(err)
  })
})

router.post('/addBulkPostcodes', upload.single('file'), (req, res)=>{
  // console.log(req.file)
    xlsxj({
      input: req.file.path, //upload file path
      output: "output.json"
    }, async function(err, result) {
      if(err) {
        res.status(400).json({
          status:400,
          err: err
        })
      }else {
        let fileOriginalName = req.file.originalname;
        let fileNameArr = fileOriginalName.split('.');
        // console.log(fileNameArr[0]);
        for(var i=0; i<result.length; i++){
          req.body.postcode = result[i].Postcode;
          req.body.location = fileNameArr[0];
          
           await addOneByOnePostcodes(req, res);
        }
        console.log('bulk insert complete');
        res.send('bulk insert complete');
      }
    });
})

const addOneByOnePostcodes = async(req, res)=>{
  // console.log(req.body.postcode+'-'+req.body.location);
  await postcodeslist.addPostcodeForBulkInsert(req, res).then(addData=>{
    console.log("addData", addData.postcode)
  })
  .catch(err =>{
    console.log(err)
  })
  
}

router.get('/getAllPostcodes', (req,res)=>{
  postcodeslist.getAllPostcodes(req, res).then(getData=>{
    res.status(200).json({
      status:200,
      count: getData.length,
      postcodeList: getData
    })
  })
  .catch(err =>{
    res.json(err)
  })
})

router.get('/getSinglePostcodeDetails', [
  check('postcode','Postcode is required').not().isEmpty(),
], (req,res)=>{
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ 
      status:422,
      errors: errors.array() 
    })
  }
  postcodeslist.getSinglePostcodeDetails(req, res).then(getData=>{
    if(getData.length > 0){
      res.status(200).json({
        status:200,
        postcodeData: getData[0]
      })
    }else{
      res.status(400).json({
        status:400,
        msg: 'No data found'
      })
    }
    
  })
  .catch(err =>{
    res.json(err)
  })
})


// router.post('/postcodeMigrateIntoLiveServer', async(req, res)=>{

//   unirest
//     .get('https://teddinodeapp.azurewebsites.net/postcodes/getAllPostcodes')
//     // .headers({'Content-Type': 'application/json'})
//     .then(async(response) => {
//         // console.log(response.body.postcodeList.length) 
//         for(var i=0; i<response.body.postcodeList.length; i++){
//           await postcodeslist.addPostcodeForLiveServer(response.body.postcodeList[i].postcode, response.body.postcodeList[i].location)
//           console.log('length',i);
//         } 
//         console.log('bulk insert Postcode in live server')
//         res.json('bulk insert Postcode in live server')
//         // res.json(response.body.postcodeList)
//     })
//     .catch(err => {
//       res.json(err)
//     })

// })

router.get('/getAllPostcodeFiles', (req,res)=>{
  postcodeslist.getAllPostcodes(req, res).then(getData=>{
    let list = []
    getData.map(data=>{
    //   console.log(data.country)
      if(list.indexOf(data.location)== -1){
          list.push(data.location)
      }
    })
    res.status(200).json({
      status:200,
      fileList: list
    })
  })
  .catch(err =>{
    res.json(err)
  })
})

module.exports = router;

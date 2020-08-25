var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
// cosmos
const cosmosClient = require('../cosmosConnection')
const config = require('../config')
const Categorylist = require('../controller/categorylist')
const CategoryDao = require('../models/categoryDao')

//Todo App:
const categoryDao = new CategoryDao(cosmosClient, config.databaseId, config.containerCategoryId)
const categorylist = new Categorylist(categoryDao)

categoryDao
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

router.post('/addCategory',[
  check('categoryName','Category is required').not().isEmpty()
],async(req, res) => { 
    const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ 
      status:422,
      errors: errors.array() 
    })
  }
    categorylist.addCategory(req,res).then(addData =>{
      
    res.status(200).json({
      status:200,
      data: addData
    })
  })
  .catch(err =>{
    res.json(err)
  }) 
})

router.get('/getAllCategory', async(req, res) => {
    
  categorylist.categoryList(req, res).then(getData=>{
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

// router.get('/categoryByCategoryName', [
//   check('categoryName','Category Name is required').not().isEmpty(),
// ], async(req, res) => {

//   const errors = validationResult(req)
//   if (!errors.isEmpty()) {
//     return res.status(422).json({ 
//       status:422,
//       errors: errors.array() 
//     })
//   }
    
//   categorylist.categoryByCategoryName(req, res).then(getData=>{
//     if(getData.length > 0){
//       res.status(200).json({
//         status:200,
//         data: getData
//       })
//     }else{
//       res.status(400).json({
//         status:400,
//         msg: 'no data found'
//       })
//     }
    
//   })
//   .catch(err =>{
//     res.status(500).json(err)
//   })
// })


module.exports = router;

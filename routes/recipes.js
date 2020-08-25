var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
// cosmos
const cosmosClient = require('../cosmosConnection')
const config = require('../config')
const Recipelist = require('../controller/recipelist')
const RecipesDao = require('../models/recipesDao')

//Todo App:
const recipesDao = new RecipesDao(cosmosClient, config.databaseId, config.containerRecipesId)
const recipelist = new Recipelist(recipesDao)

recipesDao
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

router.post('/addRecipe',[
  check('recipeName','Recipe Name is required').not().isEmpty(),
  check('ingredients','Ingredients is required').not().isEmpty(),
  check('method','Method is required').not().isEmpty(),
  check('category','Category is required').not().isEmpty(),
  check('timeToCook','Time-To-Cook is required').not().isEmpty(),
  check('recipeBy','Recipe-By is required').not().isEmpty(),
],async(req, res) => { 
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ 
      status:422,
      errors: errors.array() 
    })
  }
  
  recipelist.addRecipe(req,res).then(addData =>{
    res.status(200).json({
      status:200,
      data: addData
    })
  })
  .catch(err =>{
    res.json(err)
  }) 
})


router.get('/recipesListByCategory', [
  check('categoryName','Category Name is required').not().isEmpty(),
], async(req, res) => {

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ 
      status:422,
      errors: errors.array() 
    })
  }
    
  recipelist.recipesListByCategory(req, res).then(getData=>{
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

router.get('/getSingleRecipe', [
  check('recipeId','Recipe Id is required').not().isEmpty(),
], async(req, res) => {

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ 
      status:422,
      errors: errors.array() 
    })
  }
    
  recipelist.getSingleRecipe(req, res).then(getData=>{
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


module.exports = router;

var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
var unirest = require('unirest');
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

router.post('/recipeMigrateIntoLiveServer', async(req, res)=>{
  recipelist.getAllRecipe(req, res).then(async(result)=>{
    // console.log(result[9]);
    for(var i=0; i<result.length; i++){
      let recipeFormat = result[i].recipeFormat? result[i].recipeFormat : 'type 1';
      await addRecipeIntoLiveServer(recipeFormat, result[i].recipeName, result[i].ingredients, result[i].method, result[i].category, result[i].timeToCook, result[i].recipeBy, result[i].diet, result[i].foodImage, result[i].serves, result[i].notes, result[i].id);     
      console.log('length',i);
    }
    console.log('All data inserted');
    res.json('All data inserted')
  })
  .catch(err=>{
    res.json(err)
  })
})

const addRecipeIntoLiveServer = (recipeFormat, recipeName, ingredients, method, category, timeToCook, recipeBy, diet, foodImage, serves, notes, id)=>{
  // console.log(respMsg)
  unirest
    .post('https://teddibackend.azurewebsites.net/recipes/addRecipe')
    .headers({'Content-Type': 'application/json'})
    .send({ 
      "recipeFormat": recipeFormat,
      "recipeName": recipeName,
      "ingredients": ingredients,
      "method": method,
      "category": category,
      "timeToCook": timeToCook,
      "recipeBy": recipeBy,
      "diet": diet,
      "foodImage": foodImage,
      "serves": serves,
      "notes": notes
    })
    .then(async(response) => {
        console.log('success id: '+id)  
    })
    .catch(err => {
        console.log(" id: "+id)
    })
}

router.get('/searchRecipes', async(req, res)=>{
  recipelist.searchRecipes(req, res).then(async(result)=>{
    if(result.length > 0){
      res.status(200).json({
        status:200,
        data: result
      })
    }else{
      res.status(400).json({
        status:400,
        msg: 'no data found'
      })
    }
  })
  .catch(err=>{
    res.json(err)
  })
})

module.exports = router;

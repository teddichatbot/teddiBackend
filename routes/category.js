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

router.post('/addCategory', async(req, res) => {
  
})

module.exports = router;

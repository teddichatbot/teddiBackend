var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
var passwordHash = require('password-hash');
// cosmos
const cosmosClient = require('../cosmosConnection')
const config = require('../config')
const AdminList = require('../controller/adminlist')
const AdminDao = require('../models/adminDao')

//Todo App:
const adminDao = new AdminDao(cosmosClient, config.databaseId, config.containerAdminId)
const adminlist = new AdminList(adminDao)

adminDao
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


  router.post('/add', [
    check('username','Username is required').not().isEmpty(),
    check('password','Password is required').not().isEmpty()
  ], async(req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ 
        status:422,
        errors: errors.array() 
      })
    }
    req.body.password = passwordHash.generate(req.body.password);
    adminlist.add(req, res).then(addData=>{
        res.status(200).json({
            status:200,
            msg:'Admin Data Added Successfully',
            adminData: addData
        })
    })
    .catch(err =>{
        res.status(500).json(err)
    })
  })

  router.post('/login',[
    check('username','Username is required').not().isEmpty(),
    check('password','Password is required').not().isEmpty()
  ], (req,res)=>{
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ 
        status:422,
        errors: errors.array() 
      })
    }
    adminlist.checkUserName(req, res).then(getData=>{
    // let msg = null;
      if(getData.length>0){
        if(passwordHash.verify(req.body.password, getData[0].password)){
          res.status(200).json({
            status:200,
            msg:'Login Successfully',
            userData: getData
          })
        }else{
          res.status(400).json({
            status:400,
            msg:'Password not matched. Please try again',
          })
        }
        
      }else{
        res.status(400).json({
          status:400,
          msg:'Username not matched. please try again'
        })
      }
    })
    .catch(err => {
      res.send(err)
    })
  })


module.exports = router;
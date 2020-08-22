const CategoryDao = require("../models/categoryDao");

 class CategoryList {
   /**
    * Handles the various APIs for displaying and managing tasks
    * @param {CategoryDao} categoryDao
    */
   constructor(categoryDao) {
     this.categoryDao = categoryDao;
   }
   
   async addCategory(req, res) {
     const item = req.body;

     var data = await this.categoryDao.addItem(item);
    return data;
   }

 }

 module.exports = CategoryList;
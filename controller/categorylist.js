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

   async categoryList(req, res) {
    var sql = 'SELECT * FROM category' ;

    const querySpec = {
      query: sql
    };
    const items = await this.categoryDao.find(querySpec);
    return items
  }

  async categoryByCategoryName(req, res) {
    var sql = 'SELECT * FROM category cn WHERE cn.categoryName= "'+req.query.categoryName+'"' ;

    const querySpec = {
      query: sql
    };
    const items = await this.categoryDao.find(querySpec);
    return items
  }

 }

 module.exports = CategoryList;
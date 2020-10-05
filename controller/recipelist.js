const RecipesDao = require("../models/recipesDao");

 class RecipesList {
   /**
    * Handles the various APIs for displaying and managing tasks
    * @param {RecipesDao} recipesDao
    */
   constructor(recipesDao) {
     this.recipesDao = recipesDao;
   }
   
   async addRecipe(req, res) {
     const item = req.body;

     var data = await this.recipesDao.addItem(item);
    return data;
   }

   async getAllRecipe(req, res) {
    var sql = 'SELECT * FROM recipes' ;

    const querySpec = {
      query: sql
    };
    const items = await this.recipesDao.find(querySpec);
    return items
  }

  async recipesListByCategory(req, res) {
    var sql = 'SELECT * FROM recipes r WHERE ARRAY_CONTAINS(r.category, "'+req.query.categoryName+'")' ;
    // console.log(sql)

    const querySpec = {
      query: sql
    };
    const items = await this.recipesDao.find(querySpec);
    return items
  }

  async getSingleRecipe(req, res){
    var sql = 'SELECT * FROM recipes r WHERE r.id= "'+req.query.recipeId+'"' ;
    const querySpec = {
      query: sql
    };
    const items = await this.recipesDao.find(querySpec);
    return items
  }

 }

 module.exports = RecipesList;
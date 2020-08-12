const PostcodesDao = require("../models/postcodesDao");

 class PostcodesList {
   /**
    * Handles the various APIs for displaying and managing tasks
    * @param {PostcodesDao} postcodesDao
    */
   constructor(postcodesDao) {
     this.postcodesDao = postcodesDao;
   }
   
   async addPostcode(req, res) {
    // console.log('item', req.body.valueOf())
     const item = req.body;
    // console.log('item', item)
     var data = await this.postcodesDao.addItem(item);
    return data;
   }

   async getAllPostcodes(req, res) {
    const querySpec = {
      query: "SELECT * FROM postcodes q"
    };

    const items = await this.postcodesDao.find(querySpec);
    return items
   }

   async getSinglePostcodeDetails(req, res){
      const querySpec = {
        query: "SELECT * FROM postcodes c WHERE c.postcode = '"+req.query.postcode+"'"
      };
      // console.log(querySpec)
      const items = await this.postcodesDao.find(querySpec);
      return items
   }

 }

 module.exports = PostcodesList;
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
     const item = req.body;
     var data = await this.postcodesDao.addItem(item);
    return data;
   }

   async addPostcodeForBulkInsert(req, res) {
    const item = {
      postcode: req.body.postcode,
      location: req.body.location
    };
    // console.log('item',item)
    var data = await this.postcodesDao.addItem(item);
   return data;
  }

  async addPostcodeForLiveServer(postcode, location) {
    const item = {
      postcode: postcode,
      location: location
    };
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

   async getAllPostcodesByLocation(req, res) {
    const querySpec = {
      query: "SELECT * FROM postcodes q WHERE q.location='"+req.query.location+"'"
    };

    const items = await this.postcodesDao.find(querySpec);
    return items
   }

   async deletePostcode(id){
    var data = await this.postcodesDao.deletePostcode(id);
    return data;
  }

 }

 module.exports = PostcodesList;
const FeedbackDao = require("../models/feedbackDao");

 class FeedbackList {
   /**
    * Handles the various APIs for displaying and managing tasks
    * @param {FeedbackDao} feedbackDao
    */
   constructor(feedbackDao) {
     this.feedbackDao = feedbackDao;
   }
   
   async addFeedback(req, res) {
     const item = req.body;
     var data = await this.feedbackDao.addItem(item);
    return data;
   }

   async getAll(req, res) {
    const querySpec = {
      query: "SELECT * FROM feedback q"
    };

    const items = await this.feedbackDao.find(querySpec);
    return items
   }

  //  async getSinglePostcodeDetails(req, res){
  //     const querySpec = {
  //       query: "SELECT * FROM postcodes c WHERE c.postcode = '"+req.query.postcode+"'"
  //     };
  //     // console.log(querySpec)
  //     const items = await this.feedbackDao.find(querySpec);
  //     return items
  //  }

 }

 module.exports = FeedbackList;
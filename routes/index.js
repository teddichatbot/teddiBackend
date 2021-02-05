var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/checkVersion', (req,res)=>{
  let payload = {
    android: {
      version: '0.5',
      storeUrl: 'market://details?id=com.AskTeddi.Solutions4Health',
      forceUpdate: true
    },
    ios: {
      version: '0.5',
      storeUrl: 'itms-apps://apps.apple.com/us/app/id1531123323',
      forceUpdate: true
    },
  }
  res.json(payload)
})

module.exports = router;

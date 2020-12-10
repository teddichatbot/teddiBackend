var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/checkVersion', (req,res)=>{
  let payload = {
    android: {
      version: '0.0.1',
      storeUrl: 'https://play.google.com/store/apps/details?id=com.AskTeddi.Solutions4Health',
      forceUpdate: true
    },
    ios: {
      version: '1.0',
      storeUrl: 'https://apps.apple.com/us/app/id1531123323',
      forceUpdate: false
    },
  }
  res.json(payload)
})

module.exports = router;

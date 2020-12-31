require('dotenv').config();
var cron = require('node-cron');
var unirest = require('unirest');
let API_URL = (process.env.ENV_MOOD == 'DEV')? 'https://teddinodeapp.azurewebsites.net/' : 'https://teddibackend.azurewebsites.net/';
console.log(API_URL)

cron.schedule('* * * * *', ()=>{
    console.log('run every 2 sec')
})
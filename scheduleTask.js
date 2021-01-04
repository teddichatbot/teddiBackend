require('dotenv').config();
var cron = require('node-cron');
var unirest = require('unirest');
let API_URL = (process.env.ENV_MOOD == 'DEV')? 'https://teddinodeapp.azurewebsites.net/' : 'https://teddibackend.azurewebsites.net/';
console.log("Cron start")

//Daily Notification - At 10:00 AM
cron.schedule('0 10 * * *', ()=>{
    console.log('Daily Notification - At 10:00 AM');
    unirest
    .post(API_URL+'users/sentDailyNotification')
    .headers({'Content-Type': 'application/json'})
    .send({ 
        
    })
    .then(async(response) => {
        console.log(response.body)
    })
    .catch(err => {
        console.log(err)
    })
})

//Checking bot will expire within 1/2 days & Notify to user - At 12:30 AM
cron.schedule('30 0 * * *', ()=>{
    console.log('Checking bot will expire within 1/2 days & Notify to user - At 12:30 AM');
    unirest
    .post(API_URL+'users/reminderAllUserForTeddiExpiration')
    .headers({'Content-Type': 'application/json'})
    .send({ 
        
    })
    .then(async(response) => {
        console.log(response.body)
    })
    .catch(err => {
        console.log(err)
    })
})
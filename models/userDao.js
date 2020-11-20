var passwordHash = require('password-hash');
var nodemailer = require('nodemailer');

// @ts-check
const CosmosClient = require('@azure/cosmos').CosmosClient

// For simplicity we'll set a constant partition key
const partitionKey = undefined
class UserDao {
  /**
   * Manages reading, adding, and updating Users in Cosmos DB
   * @param {CosmosClient} cosmosClient
   * @param {string} databaseId
   * @param {string} containerId
   */
  constructor(cosmosClient, databaseId, containerId) {
    this.client = cosmosClient
    this.databaseId = databaseId
    this.collectionId = containerId

    this.database = null
    this.container = null
  }

  async init() {
    const dbResponse = await this.client.databases.createIfNotExists({
      id: this.databaseId
    })
    this.database = dbResponse.database
    const coResponse = await this.database.containers.createIfNotExists({
      id: this.collectionId
    })
    this.container = coResponse.container
  }

  async find(querySpec) {
    if (!this.container) {
      throw new Error('Collection is not initialized.')
    }
    const { resources } = await this.container.items.query(querySpec).fetchAll()
    return resources
  }

  async addItem(item) {
    var dateNow = new Date()
    item.convStartDate = dateNow.getDate() +"-"+ (dateNow.getMonth() + 1) +"-"+ dateNow.getFullYear()
    item.convStartTime = Date.now()
    item.convEndDate = dateNow.getDate() +"-"+ (dateNow.getMonth() + 1) +"-"+ dateNow.getFullYear()
    item.convEndTime = Date.now()
    item.registerCompleted = false
    item.firstName = ''
    item.lastName = ''
    item.email = ''
    item.password = ''
    // item.child_dob = ''
    // item.child_age_range = ''
    // item.child_gender = ''
    item.child_data = []
    item.parent_age_range = ''
    item.parent_gender = ''
    // item.zip_code = ''
    item.occupation = ''
    item.ethnicityMaster = ''
    item.ethnicityChild = ''
    item.giveFeedback = false
    const { resource: doc } = await this.container.items.create(item)
    return doc
  }

  async userRegistration(itemId,req) {
    const doc = await this.getItem(itemId)
    var dateNow = new Date()
    doc.registrationDate = dateNow.getDate() +"-"+ (dateNow.getMonth() + 1) +"-"+ dateNow.getFullYear()
    doc.registrationTime = Date.now()
    doc.registerCompleted = true
    doc.email = req.body.email
    doc.password = req.body.password
    // doc.child_dob = req.body.child_dob
    // doc.child_age_range = req.body.child_age_range
    // doc.child_gender = req.body.child_gender
    doc.child_data = req.body.child_data
    doc.parent_age_range = req.body.parent_age_range
    doc.parent_gender = req.body.parent_gender
    doc.zip_code = req.body.zip_code
    doc.occupation = req.body.occupation
    doc.ethnicityMaster = req.body.ethnicityMaster
    doc.ethnicityChild = req.body.ethnicityChild

    const { resource: replaced } = await this.container
      .item(itemId, partitionKey)
      .replace(doc)
    return replaced
  }

  async forgotPassword(itemId) {
    const doc = await this.getItem(itemId)
    var newPasskey = await this.generatePasskey(6);
    // console.log('newPasskey',newPasskey)
    doc.password = passwordHash.generate(newPasskey);

    // var transporter = nodemailer.createTransport({
    //     // host: 'mail.lcn.com',
    //     host: 'smtp.gmail.com',
    //     port: 587,
    //     secure: false,
    //     // service: 'gmail',
    //     auth: {
    //         user: 'subhankar.ray@capitalnumbers.com',
    //         pass: '$Ubha12345CN'
    //     }
    // });
    var transporter = nodemailer.createTransport({
      host: "smtp-mail.outlook.com", // hostname
      secureConnection: false, // TLS requires secureConnection to be false
      port: 587, // port for secure SMTP
      tls: {
        ciphers:'SSLv3'
      },
      auth: {
          user: 'teddi@solutions4health.co.uk',
          pass: 'We11ted!x'
      }
    });

    var mailOptions = {
      from: '"support@teddi.com" <teddi@solutions4health.co.uk>',
      to: doc.email,
      subject: 'Teddi: Forgot Password!',
      // html: '<p>Dear '+userName+',</p><p>Your new password is: '+newPasskey+'</p><p>Thanks and Regards,</p><p>Team Bella</p>',
      html: '<p>Your new password is: '+newPasskey+'</p><p>Thanks and Regards,</p><p>Team Teddi</p>',
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log("error: Unable to send email.", error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
    

    const { resource: replaced } = await this.container
      .item(itemId, partitionKey)
      .replace(doc)
    return replaced
  }

  async resetPassword(itemId,newPassword) {
    const doc = await this.getItem(itemId)
    doc.password = passwordHash.generate(newPassword);
    
    const { resource: replaced } = await this.container
      .item(itemId, partitionKey)
      .replace(doc)
    return replaced
  }

  async generatePasskey(length){
    var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var result = '';
    for (var i = length; i > 0; --i){
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }

  async getItem(itemId) {
    const { resource } = await this.container.item(itemId, partitionKey).read()
    return resource
  }

  async setName(itemId, fname, lname) {
    const doc = await this.getItem(itemId)
    doc.firstName = fname;
    doc.lastName = lname;
    
    const { resource: replaced } = await this.container
      .item(itemId, partitionKey)
      .replace(doc)
    return replaced
  }

  async updateUserProfile(itemId,req) {
    const doc = await this.getItem(itemId)
    if(req.body.firstName != ''){
      doc.firstName = req.body.firstName
    }
    if(req.body.lastName != ''){
      doc.lastName = req.body.lastName
    }
    doc.child_data = req.body.child_data
    doc.parent_age_range = req.body.parent_age_range
    doc.parent_gender = req.body.parent_gender
    doc.zip_code = req.body.zip_code
    doc.occupation = req.body.occupation
    doc.ethnicityMaster = req.body.ethnicityMaster
    doc.ethnicityChild = req.body.ethnicityChild

    const { resource: replaced } = await this.container
      .item(itemId, partitionKey)
      .replace(doc)
    return replaced
  }

  async updateLatLongOfExistingUser(itemId,req){
    const doc = await this.getItem(itemId);
    doc.lat = req.body.lat
    doc.long = req.body.long
    doc.zip_code = req.body.zip_code
    const { resource: replaced } = await this.container
      .item(itemId, partitionKey)
      .replace(doc)
    return replaced
  }

  async updateLastActiveTime(itemId){
    const doc = await this.getItem(itemId);
    doc.convEndTime = Date.now()
    const { resource: replaced } = await this.container
      .item(itemId, partitionKey)
      .replace(doc)
    return replaced
  }

  async updateAccessEnabledBy(itemId){
    const doc = await this.getItem(itemId);
    doc.accessEnabledBy = 'postcode'
    const { resource: replaced } = await this.container
      .item(itemId, partitionKey)
      .replace(doc)
    return replaced
  }

  async giveFeedback(itemId) {
    const doc = await this.getItem(itemId)
    doc.giveFeedback = true
    const { resource: replaced } = await this.container
      .item(itemId, partitionKey)
      .replace(doc)
    return replaced
  }
}

module.exports = UserDao
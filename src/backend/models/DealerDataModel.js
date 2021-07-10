const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dealerSchema = new mongoose.Schema({
    "Customer Code" : String,
    "Company Name" : String,
    "Ship to Name" : String,
    "Physical Address Line 1" : String,
    "City" : String,
    "State" : String,
    "Zip" : Number,
    "Area Code" : Number,
    "Phone Exchange" : Number,
    "Physical Phone": Number,
    "EMAIL_ADDRESS": String,
    "EMAIL_ADDRESS_2": String,
    "Profile Desc" : String,
    "Dist" : String,
    "Account": String,
    "Display" : String,
    "Date": Date,
    "EndDate" : Date,
    "CRM" : String,
    "Website" : String,
    "Lat" : Number,
    "Long" : Number

},{
	toJSON: { virtuals : true },
	toObject: { virtuals : true },
})
const DealerData = mongoose.model('DealerData', dealerSchema);

module.exports = DealerData;
const mongoose = require('mongoose');

const connectDB = async() =>{
await mongoose.connect("mongodb+srv://sirjanpreetkaur43_db_user:yoCn9fcpzLe8sxb3@namastenode.relncid.mongodb.net/devTinder"); 
}

module.exports = connectDB;




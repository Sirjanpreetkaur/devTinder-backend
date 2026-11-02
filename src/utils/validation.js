const validator = require("validator");

const validateSignupData = (req) =>{
    const {firstName, lastName, emailId, password} = req.body;

    if(!firstName || !lastName) {
        throw new Error("Name is not Valid !");
    }

    else if(!validator.isEmail(emailId)) {
        throw new Error("Invalid email Address");
    }
    else if(!validator.isStrongPassword(password)) {
        throw new Error("Enter a strong password :" +password);
    }
}
const validateProfileEditData = (req) =>{
    const allowedEditFields = ["firstName","lastName","emailId","photoUrl","gender","about","skills","age"];
    const isEditAllowed=Object.keys(req.body).every(field => allowedEditFields.includes(field));

    return isEditAllowed;
}
module.exports={
    validateSignupData,
    validateProfileEditData
}
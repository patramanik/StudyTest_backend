const {validationResult} = require("express-validator");

const validate =(req, res, next) =>{
    const errors = validationResult(req);
    const mapprdError ={};
    if(Object.keys(errors.errors).length===0){
        next();
    }else{
        errors.errors.map((error)=>{
            mapprdError[error.path]=error.msg;
        });
        res.status(400).json(mapprdError);
    }
}

module.exports = validate;
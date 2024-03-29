const Joi = require('@hapi/joi');

const myValidation = (req,res,next)=>{
  const validation = Joi.object({
    businessName: Joi.string().min(3).max(30).required().messages({
        'string.base': 'First name must be a string',
        'string.empty': 'First name is required',
        'string.min': 'First name must be at least {#limit} characters long',
        'string.max': 'First name cannot be longer than {#limit} characters',
      }),
    address: Joi.string().min(3).max(50).required().messages({
        'string.empty': 'Address is required',
        'string.min': 'Address must be at least {#limit} characters long',
        'string.max': 'Address cannot be longer than {#limit} characters',
      }),
    email: Joi.string().email().required().messages({
        'string.base': 'Email must be a string',
        'string.empty': 'Email is required',
        'string.email': 'Invalid email address',
      }),
    phoneNumber: Joi.string().pattern(new RegExp('^[0-9]{11}$')).required().messages({
        'string.base': 'Phone number must be a string',
        'string.empty': 'Phone number is required',
        'string.pattern.base': 'Phone number must be a valid 11-digit number',
      }),
    password: Joi.string().required().min(8).max(30).messages({
        'string.base': 'Password must be a string',
        'string.empty': 'Password is required',
        'string.min': 'Password must be min of 8 characters',
        'string.max': 'Password must be max of 16 characters',
      }),
  
  });
  const {businessName,address,email,phoneNumber,password} = req.body
  const {error} = validation.validate({businessName,address,email,phoneNumber,password}, {abortEarly:false})
  if(error){
    return res.status(400).json({
      error:error.message
    })
  }
  next()
}

module.exports = myValidation
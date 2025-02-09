import Joi, { ObjectSchema } from 'joi';

const signupSchema: ObjectSchema = Joi.object().keys({
  username: Joi.string().min(4).max(12).required().messages({
    'string.base': 'username must be of type string',
    'string.min': 'Invalid username',
    'string.max': 'Invalid username',
    'string.empty': 'username is a required field'
  }),
  password: Joi.string().min(4).max(12).required().messages({
    'string.base': 'password must be of type string',
    'string.min': 'Invalid password',
    'string.max': 'Invalid password',
    'string.empty': 'password is a required field'
  }),
  country: Joi.string().required().messages({
    'string.base': 'country must be of type string',
    'string.empty': 'country is a required field'
  }),
  email: Joi.string().email().required().messages({
    'string.base': 'email must be of type string',
    'string.email': 'Invalid email',
    'string.empty': 'email is a required field'
  }),
});

export { signupSchema };

import Joi from "joi";

const ticketShema = Joi.object({
  title: Joi.string().required(),
  price: Joi.number().required(),
  from_location: Joi.string().required(),
  to_location: Joi.string().required(),
  to_location_imageUrl: Joi.string().required(),
});

export default ticketShema;

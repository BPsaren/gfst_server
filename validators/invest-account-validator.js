const { z } = require("zod");

const ValidateInvestmentAccountSchema = z.object({
  consumer_name: z
    .string({ required_error: "Consumer Name is required" })
    .trim()
    .min(3, { message: "Consumer Name must be at least 3 characters" })
    .max(255, { message: "Consumer Name must be at most 255 characters" }),

  address: z
    .string({ required_error: "Address is required" })
    .trim()
    .min(3, { message: " Address must be at least 3 characters" })
    .max(255, { message: "Address must be at most 255 characters" }),
 
    aadhar_no: z
    .string({ required_error: "Aadhaar Number is required" })
    .trim()
    .min(12, { message: " Aadhaar Number must be at least 12 characters" })
    .max(12, { message: "Aadhaar Number must be at most 12 characters" }),


    mobile_no: z
    .string({ required_error: "Mobile Number is required" })
    .trim()
    .min(10, { message: "Mobile Number must be at least 10 characters" })
    .max(25, { message: "Mobile Number  must be at most  25 characters" }),


    mail_id: z
    .string({ required_error: "Email id is required" })
    .trim()
    .min(3, { message: "Email id  must be at least 3 characters" })
    .max(255, { message: "Email id  must be at most  255 characters" }),

    investment_of_customers_business: z
    .string({ required_error: "Investment Amount is required" })
    .trim()
    .min(3, { message: "Investment Amount must be at least 3 characters" })
    .max(255, { message: "Investment Amount must be at most  255 characters" }),

});


module.exports = {  ValidateInvestmentAccountSchema };

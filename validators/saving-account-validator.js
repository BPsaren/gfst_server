const { z } = require("zod");

const ValidateSavingAccountSchema = z.object({
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

    opening_bal: z
    .string({ required_error: "Opening Balance is required" })
    .trim()
    .min(3, { message: "Opening Balance  must be at least 3 characters" })
    .max(255, { message: "Opening Balance  must be at most  255 characters" }),

});

/*const signupSchema = loginSchema.extend({
  username: z
    .string({ required_error: "Username is required" })
    .trim()
    .min(3, { message: "Username must be at least 3 characters" })
    .max(255, { message: "Username must be at most 255 characters" }),

  phone: z
    .string({ required_error: "Phone number is required" })
    .trim()
    .min(10, { message: "Phone number must be at least 10 characters" })
    .max(25, { message: "Phone number must be at most 25 characters" }),
    password: z
    .string({ required_error: "Password is required" })
    .trim()
    .min(6, { message: "Enter The Password Atleast 6 character" })
    .max(255, { message: "Password must be at most 255 characters" }),
});*/

module.exports = {  ValidateSavingAccountSchema };

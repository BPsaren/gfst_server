const { z } = require("zod");

const loginSchema = z.object({
  email: z
    .string({ required_error: "Email address is required" })
    .trim()
    .email({ message: "Please enter a valid email address" })
    .min(3, { message: "Email must be at least 3 characters" })
    .max(255, { message: "Email must be at most 255 characters" }),

  password: z
    .string({ required_error: "Password is required" })
    .trim()
    .min(6, { message: "Incorrect Password" })
    .max(255, { message: "Password must be at most 255 characters" }),
});

const signupSchema = loginSchema.extend({
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
});

module.exports = { signupSchema, loginSchema };

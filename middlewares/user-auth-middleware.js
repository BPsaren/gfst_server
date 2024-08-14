const jwt = require('jsonwebtoken');
const User = require("../models/user-models");

const userMiddleware = async (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) {
        return res.status(400).json({ message: "Unauthorized http, tokens are not verified....." });
    }

    const jwtToken = token.replace("Bearer ", "").trim();
    console.log("token from middleware: ", jwtToken);

    try {
        const isVerified = jwt.verify(jwtToken, process.env.JWT_SECRET_KEY);

        const user_data = await User.findOne({ email: isVerified.email })
            .select({
                password: 0,
            });

        console.log(user_data);
        req.user = user_data;
        req.token = token;
        req.userID = user_data._id;
 
        next();
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized http, tokens are nottt verified" });
    }
};

module.exports = userMiddleware;




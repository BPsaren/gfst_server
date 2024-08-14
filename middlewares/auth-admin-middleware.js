

const adminMiddleware = async(req, res, next) => {
    try {
        const adminRole = req.user.asAdmin;
       // console.log(adminRole);

        if (!adminRole) {
            return res.status(403).json({ message: "Access denied, you are not an admin" });
        }

        next();

    } catch (error) {
        next(error);
    }
};

module.exports = adminMiddleware;

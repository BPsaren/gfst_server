require('dotenv').config();
const express= require("express");
const app = express();
const cors= require("cors");
const authRoute=require("../router/auth-router");

const adminRoute= require("../router/admin-router");
const connect_database = require("../utils/db");
const errorMiddleware = require('../middlewares/error-middleware');


//tackle the cors operation
const corOptions={
    origin: "https://gfst-client.vercel.app",
    methods:"GET,POST,PATCH,DELETE,HEAD",
    credential:true,
};
app.use(cors(corOptions));

  

//for middleware make sure not  faced by problem get for json data f
app.use(express.json());
app.use("/api/auth",authRoute);

//admin only have access this middleware
app.use("/api/admin", adminRoute);

app.get("/api/test",(req,res)=>{
    res.send("server running")
})

app.use(errorMiddleware);
const PORT =3000;

connect_database().then(()=>{
app.listen(PORT, () => {
    console.log(`listening on port number ,${PORT}`);
});
});

module.exports=app;





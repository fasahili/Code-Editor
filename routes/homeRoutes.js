const express = require("express");
const router = express.Router();
const {sendEmail , viewHome}=require('../controllers/homeController')
const errors = [];

router.get("^/$|/home", (req, res) => {
   viewHome(req,res,message=null,errors,);
});


router.post("/send", (req, res) => {
  sendEmail(req, res)
});



module.exports = router;

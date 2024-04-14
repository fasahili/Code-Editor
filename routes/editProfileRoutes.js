const express = require('express');
const router = express.Router();
const {viewProfile ,saveProfile } = require("../controllers/userProfileController");
const {isLoggedIn} = require("../middleware/authMiddleware");
const { notifierFunc } = require("../controllers/mailServer");
router.get("/profile", isLoggedIn,(req, res) => {
    viewProfile (req,res) ;
    notifierFunc(req,res)
});

router.post("/profile", (req, res) => { // the "/" should change after the viewprofile page done    

    saveProfile (req,res); 
});

module.exports=router

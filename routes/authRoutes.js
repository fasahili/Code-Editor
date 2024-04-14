const express = require("express");
const router = express.Router();
const authControllers = require("../controllers/authController");
const {isLoggedIn,logOut} = require("../middleware/authMiddleware");
const errors = [];

router.get("/signup" ,isLoggedIn,(req, res) => {
  res.render("auth/register", {
    title: "signup",
    message: null,
    errors,
    formData: {},
  });
});
router.post("/signup",isLoggedIn,async (req, res) => {
  await authControllers.register(req, res);
});

router.get("/login",isLoggedIn,(req, res) => {
  res.render("auth/login", {
    title: "login",
    message: null,
    errors,
  });
});
router.post("/login",isLoggedIn,async (req, res) => {
  await authControllers.userLogin(req, res);
});
router.get('/logOut',logOut,async(req, res)=>{
  res.redirect('/login')
});
module.exports = router;

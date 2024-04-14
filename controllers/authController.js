const express = require("express");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const User = require("../models/users");
const { createSession } = require('../middleware/authMiddleware');

/** 
Registers a new user by validating their input fields, hashing their password(bcrypt) and creating a new user in the database.
@param {Express.Request} req  The request object containing user input data.
@param {Express.Response} res  The response object used to send a response back to the client.
@returns {Promise}  If there are validation errors, the response is rendered with error messages.
Otherwise the response is redirected to the login page.
*/
const register = async (req, res) => {
  await body("firstName")
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2, max: 20 })
    .withMessage("First name must be between 2 and 20 characters")
    .matches(/^[\u0621-\u064Aa-zA-Z\s]+$/)
    .withMessage(
      "First name must contain only Arabic and English letters and spaces"
    )
    .run(req);
  await body("lastName")
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 2, max: 20 })
    .withMessage("Last name must be between 2 and 20 characters")
    .matches(/^[\u0621-\u064Aa-zA-Z\s]+$/)
    .withMessage(
      "Last name must contain only Arabic and English letters and spaces"
    )
    .run(req);
  await body("email")
    .notEmpty()
    .withMessage("Email is required ")
    .isEmail()
    .withMessage("Email must be a valid email address")
    .custom(async (value) => {
      const existingUser = await User.findOne({ email: value });
      if (existingUser) {
        return Promise.reject("Email is already registered");
      }
    })
    .run(req);
  await body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8, max: 24 })
    .withMessage("Password must be between 8 and 24 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/
    )
    .withMessage(
      " Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character"
    )
    .run(req);
  await body("cpassword")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    })
    .run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("../views/auth/register", {
      errors: errors.array(),
      title: "signup",
      message: null,
      formData: req.body,
    });
  }
  const { firstName, lastName, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 12);
  await User.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
  });
  res.render("../views/auth/login", { title: "Login", message: null, errors });
};

/**
Authenticates a user by checking if the provided email exists in the database,
and if the provided password matches the hashed password in the database.
If authentication is successful, the user is redirected to the dashboard.
Otherwise, an error message is returned to the client.
@param {Express.Request} req  The request object containing user input data.
@param {Express.Response} res  The response object used to send a response back to the client.
@returns {Promise}  If authentication is successful, the response is redirected to the dashboard.
Otherwise an error message is returned to the client.
*/
const userLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const errors = [];
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).render("../views/auth/login", {
        message: "Invalid input",
        title: "login",
        errors,
      });
    }
    if (user.email != email) {
      return res.status(400).render("../views/auth/login", {
        message: "Invalid input",
        title: "login",
        errors,
      });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).render("../views/auth/login", {
        message: "Invalid input",
        title: "login",
        errors,
      });
    }
    createSession(req, user._id.toString());

    res.redirect("/profile");
  } catch (error) {
    console.log(error.message);
    res.status(500).render("../views/serverError", { error: error.message });
  }
};

module.exports = {
  userLogin,
  register,
};

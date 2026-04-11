const express = require("express")
const utilities = require("../utilities/")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/account-validation')
const jwt = require("jsonwebtoken")
require("dotenv").config()

router.get("/login", utilities.handleErrors(accountController.buildLogin));
router.get("/register", utilities.handleErrors(accountController.buildRegister));
// Process the registration attempt
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

// Route to deliver the account management view
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildManagement));

// Route to deliver the account update view
router.get("/update/:accountId", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountUpdate))

// Process account update
router.post(
  "/update", 
  utilities.checkLogin, 
  regValidate.updateAccountRules(), 
  regValidate.checkUpdateData, 
  utilities.handleErrors(accountController.updateAccount)
)

// Process password update
router.post(
  "/update-password", 
  utilities.checkLogin, 
  regValidate.updatePasswordRules(), 
  regValidate.checkPasswordData, 
  utilities.handleErrors(accountController.updatePassword)
)

// Process the lougout
router.get("/logout", utilities.handleErrors(accountController.accountLogout))

module.exports = router;
const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const favModel = require("../models/favorite-model")

const bcrypt = require("bcryptjs")

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  let hashedPassword
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "message-list",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    })
  } else {
    req.flash("message-list", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    console.error("Error:", error)
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
 * Deliver account management view
 * ************************************ */
async function buildManagement(req, res, next) {
  let nav = await utilities.getNav()

  const account_id = res.locals.accountData.account_id;

  const favorites = await favModel.getFavoritesByAccountId(account_id)

  res.render("account/management", {
    title: "Account Management",
    nav,
    errors: null,
    favorites,
  })
}

/* ****************************************
 * Deliver account update view
 * *************************************** */
async function buildAccountUpdate(req, res, next) {
  const account_id = parseInt(req.params.accountId)
  let nav = await utilities.getNav()
  
  const accountData = await accountModel.getAccountById(account_id)
  
  res.render("account/account-update", {
    title: "Edit Account",
    nav,
    errors: null,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email,
    account_id: accountData.account_id,
  })
}

/* ****************************************
 * Process account update
 * *************************************** */
async function updateAccount(req, res, next) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_id } = req.body

  const updateResult = await accountModel.updateAccount(account_firstname, account_lastname, account_email,account_id)

  if (updateResult) {
    const updatedAccount = await accountModel.getAccountById(account_id)
    
    delete updatedAccount.account_password
    
    const accessToken = jwt.sign(updatedAccount, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
    res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })

    req.flash("notice", `Congratulations, ${updatedAccount.account_firstname}, your information has been updated.`)
    res.redirect("/account/")
  } else {
    req.flash("notice", "Sorry, the update failed.")
    res.status(501).render("account/account-update", {
      title: "Edit Account",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email,
      account_id,
    })
  }
}

/* ****************************************
 * Process password update
 * *************************************** */
async function updatePassword(req, res, next) {
  let nav = await utilities.getNav()
  const { account_password, account_id } = req.body

  let hashedPassword
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an erro processing your password.')
    return res.status(500).render("account/account-update", {
      title: "Edit Account",
      nav,
      errors: null,
      account_id,
    })
  }

  const updateResult = await accountModel.updatePassword(hashedPassword, account_id)

  if (updateResult) {
    req.flash("notice", `Congratulations, your password has been successfully updated.`)
    res.redirect("/account/")
  } else {
    req.flash("notice", "Sorry, the password update failed.")
    res.status(501).render("account/account-update", {
      title: "Edit Account",
      nav,
      errors: null,
      account_id,
    })
  }
}

/* ****************************************
 * Process Logout
 * *************************************** */
async function accountLogout(req, res, next) {
  res.clearCookie("jwt")
  res.redirect("/")
}

/* ****************************************
 * Process add a favorite
 * *************************************** */
async function addFavorite(req, res, next) {
  const inv_id = parseInt(req.body.inv_id)
  const account_id = res.locals.accountData.account_id

  const exists = await favModel.checkFavorite(account_id, inv_id)
  if (exists) {
    req.flash("notice", "This vehicle is already in your garage.")
    return res.redirect(`/inv/detail/${inv_id}`)
  }

  const result = await favModel.addFavorite(account_id, inv_id)
  if (result) {
    req.flash("notice", "Vehicle sucessfully added to your garage!")
  } else {
    req.flash("notice", "Sorry, we could not add this vehicle to your garage.")
  }
  res.redirect(`/inv/detail/${inv_id}`)
}

/* ****************************************
 * Process remove a favorite
 * *************************************** */
async function removeFavorite(req, res, next) {
  const inv_id = parseInt(req.body.inv_id)
  const account_id = res.locals.accountData.account_id

  const result = await favModel.removeFavorite(account_id, inv_id)
  if (result) {
    req.flash("notice", "Vehicle removed from your garage.")
  } else {
    req.flash("notice", "Sorry, failed to remove vehicle.")
  }
  res.redirect("/account/")
}

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildManagement, buildAccountUpdate, updateAccount, updatePassword, accountLogout, addFavorite, removeFavorite}
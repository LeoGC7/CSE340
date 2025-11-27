const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}

/* **********************************
 * Classification Rules
 * ********************************* */
validate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .isAlphanumeric()
      .withMessage("Please provide a valid classification name (no spaces or special characters)."),
  ]
}

/* ******************************
 * Check data and return errors or continue to process
 * ***************************** */
validate.checkClassificationData = async (req, res, next) => {
  const { classification_name } = req.body
  let errors = []
  errors = validationResult(req)

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("inventory/add-classification", {
      errors,
      title: "Add New Classification",
      nav,
      classification_name,
    })
    return
  }
  next()
}

/* **********************************
 * Inventory Rules
 * ********************************* */
validate.inventoryRules = () => {
    return [
        // Classification ID is required
        body("classification_id")
            .trim()
            .notEmpty()
            .isInt({min: 1})
            .withMessage("Please select a classification."), 

        // Make and Model are required
        body("inv_make")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 3 })
            .withMessage("Please provide a vehicle make (min 3 characters)."),

        body("inv_model")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 3 })
            .withMessage("Please provide a vehicle model (min 3 characters)."),

        // Year must be a 4 digit number
        body("inv_year")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 4, max: 4 })
            .isNumeric()
            .withMessage("Please provide a 4-digit year."),

        // Description is required
        body("inv_description")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Please provide a description."),

        // Image paths are required
        body("inv_image")
            .trim()
            .notEmpty()
            .isString()
            .withMessage("Please provide an image path."),
            
        body("inv_thumbnail")
            .trim()
            .notEmpty()
            .isString()
            .withMessage("Please provide a thumbnail path."),

        // Price must be a decimal number
        body("inv_price")
            .trim()
            .escape()
            .notEmpty()
            .isFloat({ min: 0 })
            .withMessage("Please provide a valid price (number format)."),

        // Miles must be a whole number
        body("inv_miles")
            .trim()
            .escape()
            .notEmpty()
            .isInt({ min: 0 })
            .withMessage("Please provide a valid mileage (whole number)."),

        // Color is required
        body("inv_color")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Please provide a color."),
    ]
}

/* ******************************
 * Check Inventory Data and return errors or continue to process
 * ***************************** */
validate.checkInventoryData = async (req, res, next) => {
    const { 
        inv_make, inv_model, inv_year, inv_description, inv_image, 
        inv_thumbnail, inv_price, inv_miles, inv_color, classification_id 
    } = req.body
    let errors = []
    errors = validationResult(req)
    
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        let classificationList = await utilities.buildClassificationList(classification_id) 
        
        res.render("inventory/add-inventory", {
            errors,
            title: "Add New Inventory Item",
            nav,
            classificationList,
            inv_make, inv_model, inv_year, inv_description, inv_image, 
            inv_thumbnail, inv_price, inv_miles, inv_color
        })
        return
    }
    next()
}

module.exports = validate
const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const invCont = {}

/* ***************************
 * Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId 
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name 
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 * Inventory detail view
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
  const inv_id = req.params.invId;
  const data = await invModel.getInventoryById(inv_id);

  if (!data) {
    next({ status: 404, message: 'Sorry, that vehicle could not be found.' });
    return;
  }

  const detailHTML = utilities.buildDetailPage(data);
  let nav = await utilities.getNav();
  const vehicleTitle = `${data.inv_make} ${data.inv_model}`;

  res.render("./inventory/detail", {
    title: vehicleTitle,
    nav,
    detailHTML,
  });
};

/* ***************************
 * Generate 500 error
 * ************************** */
invCont.throwError = async function (req, res, next) {
  throw new Error("Deliberate 500 Server Error"); 
};

/* ****************************************
* Deliver inventory management view
* *************************************** */
invCont.buildManagement = async function (req, res, next) { 
  let nav = await utilities.getNav()
  res.render("inventory/management", {
    title: "Vehicle Management",
    nav,
    errors: null, 
  })
}

/* ****************************************
* Deliver add classification view
* *************************************** */
invCont.buildAddClassification = async function(req, res, next) {
  let nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null,
  })
}

/* ****************************************
* Process New Classification
* *************************************** */
invCont.addClassification = async function(req, res) {
    const { classification_name } = req.body

    const classResult = await invModel.addClassification(classification_name)

    if (classResult) {
        req.flash(
            "notice",
            `Successfully added classification ${classification_name}.`
        )
        let nav = await utilities.getNav()
        res.status(201).render("inventory/management", {
            title: "Vehicle Management",
            nav,
            errors: null,
        })
    } else {
        req.flash("notice", "Sorry, adding the new classification failed.")
        let nav = await utilities.getNav()
        res.status(501).render("inventory/add-classification", {
            title: "Add New Classification",
            nav,
            errors: null,
        })
    }
}

/* ****************************************
* Deliver add inventory view
* *************************************** */
invCont.buildAddInventory = async function (req, res, next) {
    let nav = await utilities.getNav()
    let classificationList = await utilities.buildClassificationList()
    
    res.render("inventory/add-inventory", {
        title: "Add New Inventory Item",
        nav,
        classificationList,
        errors: null,
    })
}

/* ****************************************
* Process New Inventory Item
* *************************************** */
invCont.addInventory = async function (req, res) {
    let nav = await utilities.getNav()
    const { 
        inv_make, inv_model, inv_year, inv_description, inv_image, 
        inv_thumbnail, inv_price, inv_miles, inv_color, classification_id 
    } = req.body

    const invResult = await invModel.addInventory(
        inv_make, inv_model, inv_year, inv_description, inv_image, 
        inv_thumbnail, inv_price, inv_miles, inv_color, classification_id
    )

    if (invResult) {
        req.flash(
            "notice",
            `Successfully added ${inv_make} ${inv_model} to inventory.`
        )
        res.status(201).render("inventory/management", {
            title: "Vehicle Management",
            nav,
            errors: null,
        })
    } else {
        req.flash("notice", "Sorry, adding the new inventory item failed.")
        
        let classificationList = await utilities.buildClassificationList(classification_id)
        
        res.status(501).render("inventory/add-inventory", {
            title: "Add New Inventory Item",
            nav,
            classificationList,
            errors: null,
            inv_make, inv_model, inv_year, inv_description, inv_image, 
            inv_thumbnail, inv_price, inv_miles, inv_color,
        })
    }
}

module.exports = invCont
// Needed Resources 
const express = require("express")
const utilities = require("../utilities/")
const router = new express.Router() 
const invController = require("../controllers/invController")
const invValidate = require('../utilities/inventory-validation')

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));
router.get("/detail/:inventoryId", utilities.handleErrors(invController.buildByInvId))
router.get("/trigger-error", utilities.handleErrors(invController.triggerError));
router.get("/", utilities.checkAccountType, utilities.handleErrors(invController.buildManagement));

router.get("/add-classification", utilities.checkAccountType, utilities.handleErrors(invController.buildAddClassification));
router.get("/add-inventory", utilities.checkAccountType, utilities.handleErrors(invController.buildAddInventory));

router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON));

router.get("/edit/:inventoryId", utilities.checkAccountType, utilities.handleErrors(invController.editInventoryView))

router.get("/delete/:inventoryId", utilities.checkAccountType, utilities.handleErrors(invController.deleteInventoryView));

router.post(
  "/add-classification",
  utilities.checkAccountType,
  invValidate.classificationRules(),
  invValidate.checkClassData,
  utilities.handleErrors(invController.addClassification)
);

router.post(
  "/add-inventory",
  utilities.checkAccountType,
  invValidate.inventoryRules(),
  invValidate.checkInvData,
  utilities.handleErrors(invController.addInventory)
);

router.post(
  "/update/",
  utilities.checkAccountType,
  invValidate.inventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
);

router.post(
  "/delete/",
  utilities.checkAccountType, 
  utilities.handleErrors(invController.deleteInventory)
);

module.exports = router;
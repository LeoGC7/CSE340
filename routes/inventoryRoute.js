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
router.get("/", utilities.handleErrors(invController.buildManagement));

router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification));
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory));

router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON));

router.get("/edit/:inventoryId", utilities.handleErrors(invController.editInventoryView))

router.get("/delete/:inventoryId", utilities.handleErrors(invController.deleteInventoryView));

router.post(
  "/add-classification",
  invValidate.classificationRules(),
  invValidate.checkClassData,
  utilities.handleErrors(invController.addClassification)
);

router.post(
  "/add-inventory",
  invValidate.inventoryRules(),
  invValidate.checkInvData,
  utilities.handleErrors(invController.addInventory)
);

router.post(
  "/update/",
  invValidate.inventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
);

router.post("/delete/", utilities.handleErrors(invController.deleteInventory));

module.exports = router;
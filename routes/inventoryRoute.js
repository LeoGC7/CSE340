// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")

// Route to build inventory by classification view
// Note the colon (:) which defines a parameter (classificationId) in the URL
router.get("/type/:classificationId", invController.buildByClassificationId);

module.exports = router;
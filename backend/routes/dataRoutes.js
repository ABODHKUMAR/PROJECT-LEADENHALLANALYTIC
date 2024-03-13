const express = require("express");
const router = express.Router(); 
const { getBusinessData, getInsuranceData } = require("./../controller/dataController");

router.get("/business", getBusinessData); // Corrected route definition
router.get("/insurance", getInsuranceData); // Corrected route definition

module.exports = router; 

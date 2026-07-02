const express = require('express');
const router = express.Router();
const { getFinancialSummary, getMonthlyReport, getChartData } = require('../handlers');

router.get('/summary', getFinancialSummary);
router.get('/report', getMonthlyReport);
router.get('/chart', getChartData);

module.exports = router;
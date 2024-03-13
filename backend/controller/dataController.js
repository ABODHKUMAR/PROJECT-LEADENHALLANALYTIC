const pool = require('../config/db');

const getBusinessData = async (req, res) => {
    try {
        let sqlQuery = "SELECT * FROM businessdata";

        pool.query(sqlQuery, (error, results) => {
            if (error) {
                console.error("SQL Error:", error);
                const errorMessage = "Internal Server Error";
                res.status(500).json({ error: errorMessage });
            } else {
                console.log("SQL Results:", results);
                if (results && results.length > 0) {
                    res.json({ results });
                } else {
                    console.error("No valid response from the database.");
                    res.status(404).json({ error: "Data not found" });
                }
            }
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "An error occurred while processing the request" });
    }
};

const getInsuranceData = async (req, res) => {
    try {
        let sqlQuery = "SELECT * FROM insurancedata";

        pool.query(sqlQuery, (error, results) => {
            if (error) {
                console.error("SQL Error:", error);
                const errorMessage = "Internal Server Error";
                res.status(500).json({ error: errorMessage });
            } else {
                console.log("SQL Results:", results);
                if (results && results.length > 0) {
                    res.json({ results });
                } else {
                    console.error("No valid response from the database.");
                    res.status(404).json({ error: "Data not found" });
                }
            }
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "An error occurred while processing the request" });
    }
};

module.exports = { getBusinessData, getInsuranceData };

// Import the database connection pool and OpenAI instance
const express = require("express");
const { OpenAI } = require("openai");
// Controller function for handling NLP queries
const mysql = require('mysql');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 10
});
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY  // This is also the default, can be omitted
});
const nlpController = async (req, res) => {
    let { query } = req.body;
    query = "Write a SQL query which computes " + query;
    try {
        // Step 1: Convert natural language query to SQL using AI
        const chatCompletion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    "role": "system",
                    "content": "Given the following SQL tables, your job is to write queries given a user’s request.\n\nI have TABLE insurancedata (\nYear int ,\nBrokerName varchar(255),\nGWP decimal(18,4)\nPlannedGWP decimal(18,4)\nMarketType varchar(255)\\nPRIMARY KEY (Year)\n)\n\nI have TABLE businessdata (\nYear int ,\nClassOfBusiness varchar(255),\nClassType varchar(255),\nBusinessPlan decimal(18,2),\nEarnedPremium decimal(18,2),\nGWP decimal(18,2)\n);"
                },
                {
                    "role": "user",
                    "content": query
                }
            ],
            temperature: 0,
            max_tokens: 1024,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0
        });

        // Log the entire response for debugging purposes
        console.log(chatCompletion);

        // Extract SQL query from the OpenAI response
        if (chatCompletion && chatCompletion.choices && chatCompletion.choices.length > 0) {
            let sqlQuery = chatCompletion.choices[0].message.content;
            console.log("Generated SQL Query:", sqlQuery);

            // Check if the SQL query is a SELECT query
            if (!sqlQuery.toLowerCase().includes("select")) {
                // Respond with a default message if it's not a SELECT query
                console.error("Invalid SQL Query:", sqlQuery);
                res.status(500).json({ error: "Hey, I'm Merra. How can I help you?" });
                return; // Exit the function
            }

            // Remove triple backticks and 'sql' code block formatting from the SQL query
            sqlQuery = sqlQuery.replace(/^```sql\n|```$/g, '');
            console.log("Modified SQL Query:", sqlQuery); // Log the modified SQL query

            // Execute the SQL query against the database
            pool.query(sqlQuery, async (error, results) => {
                if (error) {
                    console.error("SQL Error:", error);
                    // Check if it's a SQL syntax error
                    if (error.code === 'ER_PARSE_ERROR') {
                        res.status(400).json({ error: 'Invalid SQL syntax' });
                    } else {
                        // For other types of errors, return a generic error message
                        const errorMessage = "An error occurred while processing the request1";
                        res.status(500).json({ error: errorMessage });
                    }
                } else {
                    // Log the SQL results for debugging purposes
                    console.log("SQL Results:", results);
            
                    // Convert SQL results to normal English using OpenAI's chat completions
                    const convertToNormal = await openai.chat.completions.create({
                        model: "gpt-3.5-turbo",
                        messages: [{ role: "user", content: "Convert to Normal English Like chat bot: " + JSON.stringify(results) }],
                        temperature: 0,
                        max_tokens: 1024,
                        top_p: 1,
                        frequency_penalty: 0,
                        presence_penalty: 0
                    });
            
                    if (convertToNormal && convertToNormal.choices && convertToNormal.choices.length > 0) {
                        const data = convertToNormal.choices[0].message.content;
                        // Send the converted data back to the client
                        res.json({ data });
                    } else {
                        console.error("No valid response from OpenAI.");
                        res.status(500).json({ error: "No valid response from OpenAI" });
                    }
                }
            });
            

        } else {
            console.error("Invalid response from OpenAI.");
            res.status(500).json({ error: "Hey, I'm Merra. How can I help you?" });
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "An error occurred while processing the request2" });
    }
};

module.exports = nlpController
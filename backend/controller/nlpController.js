const express = require("express");
const { OpenAI } = require("openai");
const mysql = require('mysql');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 10
});

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const nlpController = async (req, res) => {
    let { query } = req.body;
    let randomQuery = query;
    query = "Write a SQL query which computes " + query;
    try {
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

        if (chatCompletion && chatCompletion.choices && chatCompletion.choices.length > 0) {
            let sqlQuery = chatCompletion.choices[0].message.content;
            console.log("Generated SQL Query:", sqlQuery);

            if (!sqlQuery.toLowerCase().includes("select")) {
                console.error("Invalid SQL Query:", sqlQuery);
                const convertToNormal = await openai.chat.completions.create({
                    model: "gpt-3.5-turbo",
                    messages: [{ role: "user", content: "Response like chatbot , in 1 small line for :  " + randomQuery }],
                    temperature: 0,
                    max_tokens: 1024,
                    top_p: 1,
                    frequency_penalty: 0,
                    presence_penalty: 0
                });
        
                if (convertToNormal && convertToNormal.choices && convertToNormal.choices.length > 0) {
                    const data = convertToNormal.choices[0].message.content;
                    res.status(200).json({ data });
                } else {
                    console.error("No valid response from OpenAI.");
                    res.status(500).json({ data: "Not My fault open Ai api not working corretly" });
                }
                return;
            }

            sqlQuery = sqlQuery.replace(/^```sql\n|```$/g, '');
            console.log("Modified SQL Query:", sqlQuery);

            pool.query(sqlQuery, async (error, results) => {
                if (error) {
                    console.error("SQL Error:", error);
                    if (error.code === 'ER_PARSE_ERROR') {
                        res.status(400).json({ data: 'Please Clarify your question' });
                    } else {
                        const errorMessage = "Trust me you not asking a valid Question";
                        res.status(500).json({ data: errorMessage });
                    }
                } else {
                    console.log("SQL Results:", results);

                    if (!results || results.length === 0) {
                        const errorMessage = "I don't understand your query. Could you please try again?";
                        res.status(200).json({ data: errorMessage });
                    } else {
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
                            res.status(200).json({ data });
                        } else {
                            console.error("No valid response from OpenAI.");
                            res.status(500).json({ data: "Not My fault open Ai api not working corretly" });
                        }
                    }
                }
            });

        } else {
            console.error("Invalid response from OpenAI.");
            res.status(500).json({ data: "Our server openai not getting your query" });
        }
    } catch (error) {
        console.error("Error:", data);
        res.status(500).json({ data: "Please ask a vallid question or try again " });
    }
};

module.exports = nlpController;

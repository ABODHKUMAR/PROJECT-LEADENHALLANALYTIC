const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const app = express();
const nlpRoutes = require("./routes/nlpRoute");
const dataRoutes=require("./routes/dataRoutes")
app.use(cors());
const PORT = process.env.PORT || 5000;

app.use(express.json());
const pool = require('./config/db'); // Import the pool object from your db.js file

// Attempt to connect to the database
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed:', err);
    } else {
        console.log('Database connected!');
        connection.release(); // Release the connection back to the pool
    }
});
app.use("/api/nlp",nlpRoutes);
app.use("/api/data",dataRoutes);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
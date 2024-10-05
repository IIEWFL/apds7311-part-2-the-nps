import './config.js';
import express from 'express';
import cors from 'cors';
import https from 'https';
import helmet from 'helmet';
import morgan from 'morgan';
import fs from 'fs';
import connectDB from './db/connection.js'; // Ensure this path is correct
import authRoutes from './Routes/auth.js'; // Ensure the route paths are correct
import transactionRoutes from './Routes/Transaction.js'; // Ensure this route is correct

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to the database
connectDB();

// Middleware
app.use(helmet()); // Security headers
app.use(express.json()); // Parse JSON bodies
app.use(morgan('combined')); // Log HTTP requests
app.use(cors()); // Enable CORS (Cross-Origin Resource Sharing)

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', transactionRoutes);

// SSL Certificate and key
const options = {
    key: fs.readFileSync('Keys/server.key'),
    cert: fs.readFileSync('Keys/server.cert')
};

// HTTPS Server
https.createServer(options, app).listen(PORT, () => {
    console.log(`Secure server is running on https://localhost:${PORT}`);
});

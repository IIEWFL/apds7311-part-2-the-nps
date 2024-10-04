import './config.js';
import express from 'express';
import cors from 'cors';
import https from 'https';
import helmet from 'helmet';
import morgan from 'morgan';
import { Console } from 'console';
import fs from 'fs';
import connectDB from './db/connection.js';
import authRoutes from './Routes/auth.js';
import transactionRoutes from './Routes/Transaction.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// middleware
app.use(helmet()); // Use Helmet for security (HTTP headers)
app.use(express.json()); // Allows the server to parse JSON bodies
app.use(morgan('combined')); // log HTTPS requests

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', transactionRoutes);

// SSL Certificate and key
/*const options = {
    key: fs.readFileSync('Keys/server.key'),
    cert: fs.readFileSync('Keys/server.cert')
}*/


/*https.createServer(options, app).listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
}) */

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

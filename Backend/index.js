import './config.js';
import express from 'express';
import cors from 'cors';
import https from 'https';
import helmet from 'helmet';
import morgan from 'morgan';
import fs from 'fs';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import connectDB from './db/connection.js';
import authRoutes from './Routes/auth.js';
import transactionRoutes from './Routes/Transaction.js';


const app = express();
const PORT = process.env.PORT || 5000;

// Connect to the database
connectDB();

// Security Middleware Configuration
// Rate limiting - DDoS Protection
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Session Configuration - Session Hijacking Protection
const sessionConfig = {
    name: 'sessionId', // Don't use default connect.sid
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ 
        mongoUrl: process.env.MONGO_URI,
        touchAfter: 24 * 3600 // Only update session once in 24 hours
    }),
    cookie: {
        httpOnly: true, // Prevents XSS accessing cookie
        secure: process.env.NODE_ENV === 'production', // Only send cookie over HTTPS
        sameSite: 'strict', // CSRF protection
        maxAge: 1000 * 60 * 60, // 1 hour
        domain: process.env.COOKIE_DOMAIN,
        path: '/'
    }
};


// Helmet Configuration - Multiple Attack Vectors Protection
const helmetConfig = {
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"], // Clickjacking protection
        },
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: true,
    dnsPrefetchControl: true,
    frameguard: {
        action: 'deny' // Clickjacking protection
    },
    hidePoweredBy: true,
    hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
    },
    ieNoOpen: true,
    noSniff: true,
    referrerPolicy: { policy: 'same-origin' },
    xssFilter: true
};

// CORS Configuration - CSRF & MITM Protection
const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: true,
    maxAge: 3600
};

// Apply Security Middleware
app.use(helmet()); // Security headers
app.use(express.json()); // Parse JSON bodies
app.use(morgan('combined')); // Log HTTP requests
app.use(cors()); // Enable CORS (Cross-Origin Resource Sharing)
app.use(helmet(helmetConfig));
app.use(cors(corsOptions));
app.use(express.json({ limit: '10kb' })); // Limit payload size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session(sessionConfig));
app.use(mongoSanitize()); // SQL/NoSQL Injection Protection
app.use(xss()); // XSS Protection
app.use(hpp()); // HTTP Parameter Pollution Protection
app.use(morgan('combined')); // Logging

// Apply rate limiting to auth routes
app.use('/api/auth', limiter);


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

// This method was adapted from various tutorials on setting up an HTTPS server with Express
// https://adamtheautomator.com/https-nodejs/

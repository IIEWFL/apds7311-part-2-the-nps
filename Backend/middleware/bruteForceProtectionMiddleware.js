import ExpressBrute from "express-brute"; // Import the ExpressBrute middleware for rate limiting/brute force protection
import MongooseStore from "express-brute-mongoose"; // Import the Mongoose storage adapter for storing brute force data in MongoDB
import mongoose from 'mongoose'; // Import mongoose for MongoDB interaction

// Define a schema to store brute-force data
// This schema will hold information like request counts, timestamps, and expiration for each request attempt
const bruceForceSchema = new mongoose.Schema({
    _id: String, // Unique identifier (e.g., IP address or username) for tracking brute force attempts
    data: {
        count: Number, // Number of attempts made
        lastRequest: Date, // Timestamp of the last request attempt
        firstRequest: Date // Timestamp of the first request attempt
    },
    // Expires field: Mongoose's TTL (time-to-live) index to automatically remove expired documents
    expires: { type: Date, index: { expires: "id" } }
});

// Create a mongoose model from the schema, which will store brute-force attempt information
const BruteForceModel = mongoose.model("bruceforce", bruceForceSchema);

// Initialize the MongooseStore with the BruteForceModel
// This store will save and retrieve brute-force data from the MongoDB database using the defined model
const store = new MongooseStore(BruteForceModel);

// Configure the brute-force protection
// Initialize the ExpressBrute middleware with the Mongoose store
const brusteForce = new ExpressBrute(store, {
    // Number of allowed retries before brute-force protection kicks in (2 free attempts)
    freeRetries: 2,

    // Minimum wait time after hitting the limit (1 minute)
    minWait: 1 * 60 * 1000, // 1 minute in milliseconds

    // Maximum wait time after repeated failed attempts (2 minutes)
    maxWait: 2 * 60 * 1000, // 2 minutes in milliseconds

    // Custom failure callback function that is executed when the limit is exceeded
    failCallback: function(req, res, next, nextValidRequestDate) {
        // Send a 429 status code (Too Many Requests) and a JSON response indicating the wait time
        res.status(429).json({
            message: "Too many failed attempts. Please try again later.", // Inform the user they've exceeded the retry limit
            nextValidRequestDate // Send the date when the user can try again
        });
    }
});

// Export the brute-force middleware so it can be used in other parts of the application
export default brusteForce;

// This method was adapted from the express-brute library documentation on handling brute force protection
// https://github.com/AdamPflug/express-brute
// Adam Pflug
// https://github.com/AdamPflug
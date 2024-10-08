import ExpressBrute from "express-brute";
import MongooseStore from "express-brute-mongoose";
import mongoose from 'mongoose';

const FREE_RETRIES = 2;
const MIN_WAIT = 60 * 1000; // 1 minute in milliseconds
const MAX_WAIT = 2 * MIN_WAIT; // 2 minutes in milliseconds

const bruteForceSchema = new mongoose.Schema({
    _id: String,
    data: {
        count: Number,
        lastRequest: Date,
        firstRequest: Date
    },
    expires: { type: Date, index: { expires: 0 } }
}, { timestamps: false });

const BruteForceModel = mongoose.model("BruteForce", bruteForceSchema);

const store = new MongooseStore(BruteForceModel);

const bruteForce = new ExpressBrute(store, {
    freeRetries: FREE_RETRIES,
    minWait: MIN_WAIT,
    maxWait: MAX_WAIT,
    failCallback: (req, res, next, nextValidRequestDate) => {
        res.status(429).json({
            message: "Too many failed attempts. Please try again later.",
            nextValidRequestDate
        });
    }
});

export default bruteForce;

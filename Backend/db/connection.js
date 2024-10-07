import mongoose from 'mongoose'; // Import the mongoose library to handle MongoDB connections

// Load MongoDB URIs from environment variables
const MONGO_URI = process.env.MONGO_URI;  // Primary MongoDB URI from environment
const ATLAS_URI = process.env.ATLAS_URI;  // Backup MongoDB URI (for example, MongoDB Atlas)

const connectDB = async () => {
    try {
        // Attempt to connect to the primary MongoDB instance using MONGO_URI
        await mongoose.connect(MONGO_URI); 
        console.log(`Connected to MongoDB at ${MONGO_URI}`);
    } catch (err) {
        // If the connection to MONGO_URI fails, log the error
        console.error(`Failed to connect to ${MONGO_URI}: ${err.message}`);

        // If the primary connection fails, attempt to connect to the backup (Atlas) URI
        console.log(`Trying to connect to MongoDB at ${ATLAS_URI}`);
        try {
            await mongoose.connect(ATLAS_URI); // Attempt connection to ATLAS_URI
            console.log(`Connected to MongoDB at ${ATLAS_URI}`);
        } catch (err) {
            // If both connection attempts fail, log the error and exit the application
            console.error('Failed to connect to MongoDB at both URIs', err);
            process.exit(1);  // Exit the process with a failure code (1) indicating the application should stop
        }
    }
};

export default connectDB;  // Export the connectDB function for use in other parts of the application

// This method was adapted from the MongoDB documentation on handling connections
// https://www.mongodb.com/docs/manual/reference/connection-string/

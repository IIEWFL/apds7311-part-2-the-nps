import mongoose from 'mongoose';

// Define the Staff schema
const StaffSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: /^[a-zA-Z0-9_]{3,30}$/, // Allows alphanumeric and underscores, 3-30 characters
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        match: /^[a-zA-Z\s]+$/, // Allows letters and spaces only
    },
    password: {
        type: String,
        required: true
       // match: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{256,}$/, // Minimum 8 characters, at least one letter and one number

    },
});
// Export the Staff model
export default mongoose.model('Staff', StaffSchema);

// This method was adapted from the Mongoose documentation on defining schemas
// https://mongoosejs.com/docs/guide.html
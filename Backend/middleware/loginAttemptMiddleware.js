import LoginAttempt from '../models/LoginAttempts.js';

const loginAttemptLogger = async(req, res, next) => {
    const originalJson = req.json;
    res.json =function(data){
      
        const accountNumber = req.body.accountNumber;
        const ipAddress = req.id || req.connection.remoteAddress;
        const successfulLogin = !data.message || data.message !== 'Invalid Credentials';

        LoginAttempt.create({accountNumber, ipAddress, successfulLogin})
        .catch(err => console.error('Error logging Login attempt:', err));

        originalJson.call(this, data);
    };
    next();
}
export default loginAttemptLogger;
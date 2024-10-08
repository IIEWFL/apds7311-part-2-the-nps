import LoginAttempt from '../models/LoginAttempts.js';

const loginAttemptLogger = async (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = async function(data) {
        const { username } = req.body;
        const ipAddress = req.ip || req.connection.remoteAddress;
        const successfulLogin = !data.message || data.message !== 'Invalid Credentials';

        try {
            await LoginAttempt.create({ username, ipAddress, successfulLogin });
        } catch (err) {
            console.error('Error logging login attempt:', err);
            // Optionally, you could use a proper logging system here
        }

        return originalJson.call(this, data);
    };

    next();
};

export default loginAttemptLogger;

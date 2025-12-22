
const validateInput = (fields) => {
    return (req, res, next) => {
        const allowlistRegex = /^[a-zA-Z0-9.-]+$/;

        for (const field of fields) {
            
            const value = req.query?.[field] || req.body?.[field];

            
            if (value && !allowlistRegex.test(value)) {
                return res.status(422).json({
                    error: 'Unprocessable Entity',
                    message: `Invalid characters in field: ${field}. Only alphanumeric, dots, and hyphens are allowed.`
                });
            }
        }
        next();
    };
};

module.exports = validateInput;

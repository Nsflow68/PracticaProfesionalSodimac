const sanitizeValue = (value) => {
    if (typeof value === 'string') {
        
        
        
        return value
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/'/g, "&#39;")
            .replace(/"/g, "&quot;");
    }
    if (Array.isArray(value)) {
        return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
        Object.keys(value).forEach(key => {
            value[key] = sanitizeValue(value[key]);
        });
    }
    return value;
};

const sanitizer = (req, res, next) => {
    if (req.body) req.body = sanitizeValue(req.body);
    if (req.query) req.query = sanitizeValue(req.query);
    if (req.params) req.params = sanitizeValue(req.params);
    next();
};

module.exports = { sanitizer };

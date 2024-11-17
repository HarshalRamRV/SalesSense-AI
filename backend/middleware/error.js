
export const errorHandlerReqRes = (req, res, next) => {
    const start = Date.now();
    
    // Log the incoming request
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    if (Object.keys(req.body).length) {
        console.log('Request Body:', JSON.stringify(req.body, null, 2));
    }
    
    // Capture the original res.json to add response logging
    const originalJson = res.json;
    res.json = function(data) {
        const duration = Date.now() - start;
        console.log(`Response (${duration}ms):`, JSON.stringify(data, null, 2));
        return originalJson.call(this, data);
    };
    
    next();
};

export const errorHandler = (err, req, res, next) => {
    console.error(`[${new Date().toISOString()}] Error:`, {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        body: req.body
    });
    
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : err.message
    });
}
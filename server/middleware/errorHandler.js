const errorHandler = (err, req, res, next) => {
    console.error('[Error]', err.message);
    if (process.env.NODE_ENV !== 'production') {
        console.error(err.stack);
    }
    const statusCode = err.statusCode || 500;
    // Never expose raw internal errors to the client
    const message = statusCode < 500 ? (err.message || 'An error occurred.') : 'An internal error occurred. Please try again later.';
    res.status(statusCode).json({
        success: false,
        message
    });
};

module.exports = errorHandler;

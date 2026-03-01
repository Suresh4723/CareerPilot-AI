export const errorMiddleware = (err, _req, res, _next) => {
  console.error(err);
  return res.status(err.status || 500).json({
    message: err.message || 'Internal server error'
  });
};

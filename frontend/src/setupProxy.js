const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      // Inside Docker: REACT_APP_BACKEND_URL=http://backend:8080
      // Local dev (no Docker): falls back to localhost:8080
      target: process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080',
      changeOrigin: true,
    })
  );
};

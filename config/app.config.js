//config/app.config.js
module.exports = {
    app: {
      name: process.env.APP_NAME,
      version: process.env.VERSION,
      port: process.env.PORT || 3000,
      host: process.env.HOST || "0.0.0.0",
    },
}
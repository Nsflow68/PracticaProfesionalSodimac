module.exports = {
  apps: [
    {
      name: "api_hubconsolidation",
      script: "./dist/index.js",
      instances: 1,
      autorestart: true,
      env: {
        NODE_ENV: process.env.NODE_ENV || "development",
        MONGO_URI: process.env.MONGO_URI,
        SQLHOST: process.env.SQLHOST,
        SQLUSER: process.env.SQLUSER,
        SQLDB: process.env.SQLDB,
        SQLPASS: process.env.SQLPASS
      }
    }
  ]
};

const fs = require("fs");
const path = require("path");

// 1. load route
const loadRoutes = (routerFolderPath) => (app) => {
  const routeFiles = fs.readdirSync(routerFolderPath);

  routeFiles.forEach((file) => {
    if (file.endsWith(".js")) {
      const routePath = path.join(routerFolderPath, file);
      const route = require(routePath);

      if (typeof route === "function") {
        // Jika file ekspor adalah router, gunakan langsung tanpa prefix
        app.use(route);
        console.log(`Route dari file '${file}' telah dimuat.`);
      } else {
        console.error(`File '${file}' tidak mengekspor router secara benar.`);
      }
    }
  });
};

module.exports = loadRoutes;

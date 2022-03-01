const express = require("express");
module.exports = {
  express: () => {
    // Initialize an express server.
    const app = new express();
    app.get("/health", (req, res, next) => {
      res.json({
        status: "ok",
      });
    });
    return app;
  },
};

const { ExpressAuthorizationProvider } = require("../dist/index.js");
const express = require("express");

const run = async () => {
  // Initialize an express server.
  const app = new express();
  app.get("/health", (req, res, next) => {
    res.json({
      status: "ok",
    });
  });

  const authProvider = new ExpressAuthorizationProvider({
    debug: true,
    failureHandler: (req, res, action) => {
      console.error(`[${action}] reported failure!`);
      res.status(403).json({
        message: "UNAUTHORIZED. Missing Permission: " + action,
      });
    },
  });

  await authProvider.use("can edit user", (req, res, next) => {
    console.log("can edit user actual handler definition");
  });

  await authProvider.use("can delete user", (req, res, next) => {
    console.log("can delete user actual handler definition");
  });

  await authProvider.use("can create user", (req, res, next) => {
    console.log("can create user actual handler definition");
    if (req.query.username === "test") {
      next();
    } else {
      throw new Error("[username] is required!");
    }
  });

  app.get(
    "/auth",
    (req, res, next) => {
      return authProvider.can("can create user", req, res, next);
    },
    (req, res, next) => {
      res.json({
        status: "protected route ok",
      });
    }
  );

  app.listen(7000);
};

run()
  .then((args) => {
    console.log("DONE", args);
  })
  .catch((error) => console.error(error.message));

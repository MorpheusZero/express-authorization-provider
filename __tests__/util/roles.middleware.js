const { ExpressAuthorizationProvider } = require("../../dist");

// Initialize our roles and return an object that represents the auth provider.
const initRoles = () => {
  const authProvider = new ExpressAuthorizationProvider({
    debug: false,
  });

  authProvider.use("get user", (req, res, next) => {
    if (req.params.id === "1234") {
      next();
    } else {
      throw new Error("You don't have permission to get this user!");
    }
  });

  return authProvider;
};

module.exports = {
  RolesMiddleware: initRoles(),
};

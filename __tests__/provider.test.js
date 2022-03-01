const { RolesMiddleware } = require("./util/roles.middleware.js");
const { express } = require("./util/express.helper.js");

const run = async () => {
  const app = express();

  app.get("/user/:id", RolesMiddleware.can("get user"), (req, res, next) => {
    res.json({
      id: req.params.id,
      name: "Test User",
      email: "test@email.com",
    });
  });

  app.listen(7000);
};

run()
  .then(() => {
    console.log("Server is listening on port 7000...");
  })
  .catch((error) => console.error(error.message));

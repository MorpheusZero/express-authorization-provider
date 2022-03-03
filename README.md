# express-authorization-provider
A Simple & Lightweight Authorization Provider for Express Middleware Written in Typescript. This project 
took inspiration from [this project](https://github.com/ForbesLindesay/connect-roles), which 
hasn't been updated in over 6 years. It was (and still is) a very useful project, but I wanted 
to rewrite in a Typescript-friendly way. I also wanted it to have no dependencies on other projects 
to reduce its footprint when being used as part of my other projects.

## Installation
```npm
npm i express-authorization-provider
```

## Simple Getting Started Guide (Typescript)
There are different ways you can use this library, but I will show you how I personally use it. 
If you have any thoughts or feedback on how you use it, please let me know by opening an issue!

You should first create a class that will serve as the wrapper for the Auth Provider in your routes.

```typescript
import { ExpressAuthorizationProvider } from "express-authorization-provider";

/**
 * We use this as a wrapper to setup our roles and obtain an instance 
 * to the providers so we can reference them in our routes.
 */
export class RolesMiddleware {

    /**
     * An active singleton instance to the current provider.
     * @private
     */
    private static _provider: ExpressAuthorizationProvider;

    /**
     * This is where you would actually reference the provider in your routes like a normal middleware.
     */
    public static get provider(): ExpressAuthorizationProvider {
        if (!RolesMiddleware._provider) {
            RolesMiddleware._provider = RolesMiddleware.initializeRoles(new ExpressAuthorizationProvider());
        }
        return RolesMiddleware._provider;
    }

    /**
     * You can further abstract this into other files if you have a complicated setup, but for
     * a simple example--I am just setting up some simple things here.
     * @param provider A reference to a new Auth Provider context.
     * @private
     */
    private static initializeRoles(provider: ExpressAuthorizationProvider): ExpressAuthorizationProvider {
        
        // Simple check if an authenticated user has a privilege for "edit user" before allowing the request through.
        provider.use("edit user", (req, res, next) => {
            if (req.user.privileges.contains("edit user")) {
                next();
            } else {
                throw new Error("You do not have permission to edit users!");
            }
        });

        // Simple check if an authenticated user has a privilege for "edit user" before allowing the request through.
        provider.use("create user", (req, res, next) => {
            if (req.user.privileges.contains("create user")) {
                // You can optionally use this as a means for validation as well!
                if (req.body.email) {
                    next();
                } else {
                    throw new Error("Email is required when attempting to create a new user!");
                }
            } else {
                throw new Error("You do not have permission to create users!");
            }
        });

        // Simple check if an authenticated user is marked as "SUPER ADMIN"
        provider.use("super admin user", (req, res, next) => {
            if (req.user.isSuperAdmin) {
                next();
            } else {
                throw new Error("This requires Super Admin Powers!");
            }
        });

    }

}
```

Now when you define your Express Routes, you can use this new Middleware in your routes like this!

```typescript
const app = express();

app.put("/users/:id", RolesMiddleware.provider.can("edit user"), (req, res, next) => {
    // Edit user logic.
});

app.post("/users", RolesMiddleware.provider.can("create user"), (req, res, next) => {
    // Create user logic.
});

// Notice here we use the word "is". This is just an alias for "can" and 
// under the hood they do the same thing. We just use different words to make it
// read easier and make more sense.
app.get("/users/stats", RolesMiddleware.provider.is("super admin user"), (req, res, next) => {
    // user stats logic.
});
```

### Optional Features
When creating a new instance of ExpressAuthorizationProvider, you can optionally 
pass a boolean for debug mode (default is false). You can also pass in a custom failureHandler
so when errors are thrown inside your providers that it will call a custom failureHandler. 

Also, you can completely bypass the failureHandler by passing in the below boolean value. When doing this,
instead of returning directly upon a failure, we will pass the error to the NextFunction in Express so you 
can handle it later in your own Error Handling Middleware.

```typescript
new ExpressAuthorizationProvider({
    debug: true,
    failureHandler: (req, res, action) => {
        // ... Any special logic I want to do here.
        res.status(403).json({
            message: `You don't have permission to ${action}`
        });
    },
    dontUsefailureHandler: true // If you specify TRUE here, the above part is ignored.
})
```

### Contributing
I welcome any pull requests that are directly related to an open issue that has been approved for work. If you 
have an issue with the tools--please open an issue before submitting a PR so we can discuss the possible solutions
for your issue.

When submitting a Pull Request, please make sure:
   - You use the Pull Request Template and fill everything out.
   - You have Prettier setup correctly in your IDE and that the code has been made "prettier" appropriately.
   - Every new method/property should have documentation, so we remain clean for future devs.
   - Use Interfaces when appropriate.

### Bugs & Contact
Please submit a new issue to report any bugs or to make a feature request!


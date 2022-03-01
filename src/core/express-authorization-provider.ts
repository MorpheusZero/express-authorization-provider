import { NextFunction, Request, Response } from "express";
import { IAuthorizationProviderOptions } from "../lib/interfaces/authorization-provider-options.interface";

export class ExpressAuthorizationProvider {
  /**
   * When TRUE, we will verbosely log all authorization attempts. This is
   * for testing and debugging purposes. You should disable this in production.
   *
   * DEFAULT: false
   */
  private readonly debug: boolean;

  /**
   * A typed listing of all functions that the authorization provider is defined to handle during request routing.
   * @private
   */
  private functionList: Record<
    string,
    (req: Request, res: Response, next: NextFunction) => void
  >;

  /**
   * When an authorization attempt fails--then we will handle the failure here.
   * @private
   */
  private failureHandler: (
    req: Request,
    res: Response,
    action: string
  ) => Promise<void>;

  constructor(options?: IAuthorizationProviderOptions) {
    this.functionList = {};
    this.debug = options?.debug ? options.debug : false;
    this.failureHandler = options?.failureHandler
      ? options.failureHandler
      : this.defaultFailureHandler;
  }

  private async defaultFailureHandler(
    _req: Request,
    res: Response,
    action: string
  ): Promise<void> {
    if (this.debug) {
      console.debug("ERROR HANDLER ACTION: " + action);
    }
    res.status(403).json(`You do not have permission to: [${action}]`);
  }

  /**
   * Add a new function to the list of handlers that we can use.
   * @param action A unique string name associated with this handler that we can reference.
   * @param functionHandler The actual middleware function that we want to run for this action.
   */
  public use(
    action: string,
    functionHandler: (req: Request, res: Response, next: NextFunction) => void
  ): void {
    if (this.debug) {
      console.debug(`Registering [${action}]`);
    }
    this.functionList[action] = functionHandler;
  }

  /**
   * This is the middleware function that you would reference in your express routes.
   * @param action The action you want to call
   */
  public can(
    action: string
  ): (req: Request, res: Response, next: NextFunction) => void {
    return async (req: Request, res: Response, next: NextFunction) => {
      const handler = this.functionList[action];
      if (handler) {
        if (this.debug) {
          console.debug(`Authorization Provider Handler Called: [${action}]`);
        }
        try {
          handler(req, res, next);
          next();
        } catch (error) {
          await this.failureHandler(req, res, action);
        }
      } else {
        next(
          new Error(
            `The specified authorization provider action was not registered: [${action}]`
          )
        );
      }
    };
  }

  /**
   * This is an alias for the "can" route. Under the hood it calls the "can" handler and is only used to make your
   * route middlewares easier to read if you defined roles with nouns instead of verbs.
   *
   * EXAMPLE: is("super admin user") instead of can("super admin user").
   * @param noun The action key that we want to call in our roles definitions function list.
   */
  public is(
    noun: string
  ): (req: Request, res: Response, next: NextFunction) => void {
    return this.can(noun);
  }
}

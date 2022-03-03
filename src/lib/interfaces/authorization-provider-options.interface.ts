import { Request, Response } from "express";

/**
 * Defines the options that can be passed into a new instance of the
 * Express Authorization Provider to help determine its behaviour.
 */
export interface IAuthorizationProviderOptions {
  /**
   * When TRUE, we will verbosely log all authorization attempts. This is
   * for testing and debugging purposes. You should disable this in production.
   *
   * DEFAULT: false
   */
  debug?: boolean;

  /**
   * Defines how the request should be handled when an authorization check fails.
   * @param req The Express Request object.
   * @param res The Express Response object.
   * @param action The associated provider action.
   */
  failureHandler?: (
    req: Request,
    res: Response,
    action: string
  ) => Promise<void>;

  /**
   * If TRUE--instead of using the built-in failure handler, we will just throw a generic error
   * and pass it into the next function.
   *
   * DEFAULT: false
   */
  dontUseFailureHandler?: boolean;
}

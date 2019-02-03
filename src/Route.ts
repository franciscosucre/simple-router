import * as assert from 'assert';
import * as http from 'http';
import * as pathToRegexp from 'path-to-regexp';
import { HandlerFunction } from '.';

export default class Route {
  public method: string;
  public path: string;
  public handlers: HandlerFunction[] = [];
  public keys: pathToRegexp.Key[];
  public regex: RegExp;

  constructor(method: string, path: string, ...args: HandlerFunction[]) {
    assert(
      http.METHODS.find(m => m === method),
      `The "method" parameter must one of the following [${http.METHODS.toString()}]. Value: ${method}`,
    );
    assert(typeof path === 'string', `The "path" parameter must be a string. Value: ${path}`);
    assert(args.length > 0, 'At least one handler function must be passed');
    for (const handler of args) {
      assert(typeof handler === 'function', `The 3rd or greater argument must be functions. Value: ${handler}`);
      assert(
        handler.length === 2,
        `handler functions should receive 2 arguments, req and res. Value: ${handler.length}`,
      );
    }
    this.method = method;
    this.path = path;
    this.handlers = args;
    this.keys = [];
    this.regex = pathToRegexp(path, this.keys);
  }
}

import * as assert from 'assert';
import * as http from 'http';
import { posix } from 'path';
import * as pathToRegexp from 'path-to-regexp';
import * as url from 'url';
import { HandlerFunction, INextFunction } from './interfaces';

export class Route {
  public method: string;
  public path: string;
  public handlers: HandlerFunction[] = [];
  public keys: pathToRegexp.Key[] = [];
  public regex: RegExp;

  constructor(method: string, path: string, ...args: HandlerFunction[]) {
    assert(
      http.METHODS.find((m: string) => m === method),
      `The "method" parameter must one of the following [${http.METHODS.toString()}]. Value: ${method}`,
    );
    assert(typeof path === 'string', `The "path" parameter must be a string. Value: ${path}`);
    assert(args.length > 0, 'At least one handler function must be passed');
    this.method = method;
    this.path = posix.normalize(path);
    this.handlers = args;
    this.regex = pathToRegexp(path, this.keys);
  }

  public async handle(req: any, res: any) {
    const { pathname } = url.parse(req.url || '');
    if (!pathname) {
      throw new Error('Could not parse pathname from url');
    }
    const regexResult = this.regex.exec(pathname as string);
    if (!regexResult) {
      throw new Error('The regex for the given route did not get any results');
    }
    regexResult.shift();
    req.params = regexResult.reduce((prev: any, cur: any, index) => {
      const key = this.keys[index];
      prev[key.name] = cur;
      return prev;
    }, {});

    let idx = 0;
    const next: INextFunction = async (): Promise<void> => {
      if (idx >= this.handlers.length) {
        return;
      }
      const handler = this.handlers[idx++];
      await handler(req, res, next);
    };
    await next();
  }
}

export default Route;

import * as pathToRegexp from 'path-to-regexp'
import * as http from 'http'
import * as url from 'url'
import * as assert from 'assert'

export type HandlerFunction = (req: IDynamicRequest, res: http.ServerResponse) => void;

export class RouteNotFoundError extends Error {
  message= "No route was found when calling the handle method, please check with the match method first so you can handle the error"
}

export interface IDynamicRequest extends http.IncomingMessage {
  url: string;
  method: string;
  params ?: any;
  [key: string]: any;
}

export default class Router {
  public routes : Route[]
  public middleware: HandlerFunction[] = []

  constructor() {
    this.routes = [];
    this.middleware = [];
  }

  match(method: string, path: string): Route | null {
    const route = this.routes.find(r => r.method == method && r.regex.test(path));
    return route || null;
  }

  async handle(req: IDynamicRequest, res: http.ServerResponse) {
    const { pathname } = url.parse(req.url);
    if (!pathname){
      throw new Error("Could not parse pathname from url")
    }
    const route = this.match(req.method, pathname);
    if (!route){
      throw new Error("No route was found when calling the handle method, please check with the match method first so you can handle the error")
    }
    const keys: pathToRegexp.Key[] = route ? route.keys : [];
    const regexResult = route.regex.exec(pathname as string);
    if (!regexResult){
      throw new Error("The regex for the given route did not get any results")
    }
    regexResult.shift();
    req.params = regexResult.reduce((prev: any, cur:any, index) => {
      const key = keys[index];
      prev[key.name] = cur;
      return prev;
    }, {});
    for (const handler of route.handlers) {
      await handler(req, res);
    }
  }

  addRoute(method: string, path:string, ...args: HandlerFunction[]) {
    assert(args.length > 0, "At least one handler function must be passed");
    for (const handler of args) {
      assert(typeof handler === "function", `The 3rd or greater argument must be functions. Value: ${handler}`);
      assert(
        handler.length === 2,
        `handler functions should receive 2 arguments, req and res. Value: ${handler.length}`
      );
    }
    const handlers = this.middleware.concat(args);
    assert(handlers && handlers.length > 0)
    let route = this.routes.find(r => r.method === method && r.path === path);
    if (!route) {
      const firstHandler = handlers.shift()
      if (!firstHandler){
        throw new Error("No firstHandler found")
      }
      route = new Route(method, path, firstHandler);
      this.routes.push(route);
    }
    route.handlers = route.handlers.concat(handlers);
    return this;
  }

  useSubrouter(path: string, router: Router) {
    assert(path, "path parameter is required");
    assert(router, "router parameter is required");
    assert(router instanceof Router, `router parameter must be Router instance, got ${typeof router}`);
    const routes = router.routes.map(r => r);
    for (const route of routes) {
      this.addRoute(route.method, path + route.path, ...route.handlers)
    }
    return this;
  }

  useMiddleware(...args: HandlerFunction[]) {
    assert(args.length > 0, "At least one handler function must be passed");
    for (const handler of args) {
      assert(typeof handler === "function", `The 3rd or greater argument must be functions. Value: ${handler}`);
    }
    this.middleware = this.middleware.concat(args);
    return this;
  }

  all(path: string, ...args: HandlerFunction[]) {
    this.options(path, ...args);
    this.head(path, ...args);
    this.get(path, ...args);
    this.post(path, ...args);
    this.put(path, ...args);
    this.patch(path, ...args);
    this.delete(path, ...args);
    return this;
  }

  options(path: string, ...args: HandlerFunction[]) {
    this.addRoute('OPTIONS', path, ...args)
    return this;
  }

  head(path: string, ...args: HandlerFunction[]) {
    this.addRoute('HEAD', path, ...args)
    return this;
  }

  get(path: string, ...args: HandlerFunction[]) {
    this.addRoute('GET', path, ...args)
    return this;
  }

  post(path: string, ...args: HandlerFunction[]) {
    this.addRoute('POST', path, ...args)
    return this;
  }

  put(path: string, ...args: HandlerFunction[]) {
    this.addRoute('PUT', path, ...args)
    return this;
  }

  patch(path: string, ...args: HandlerFunction[]) {
    this.addRoute('PATCH', path, ...args)
    return this;
  }

  delete(path: string, ...args: HandlerFunction[]) {
    this.addRoute('DELETE', path, ...args)
    return this;
  }
}

class Route {
  method: string;
  path: string;
  handlers: HandlerFunction[]= []
  keys: pathToRegexp.Key[]
  regex: RegExp;
  
  constructor(method : string, path: string, ...args: HandlerFunction[]) {
    assert(
      http.METHODS.find(m => m === method),
      `The "method" parameter must one of the following [${http.METHODS.toString()}]. Value: ${method}`
    );
    assert(typeof path === "string", `The "path" parameter must be a string. Value: ${path}`);
    assert(args.length > 0, "At least one handler function must be passed");
    for (const handler of args) {
      assert(typeof handler === "function", `The 3rd or greater argument must be functions. Value: ${handler}`);
      assert(
        handler.length === 2,
        `handler functions should receive 2 arguments, req and res. Value: ${handler.length}`
      );
    }
    this.method = method;
    this.path = path;
    this.handlers = args;
    this.keys = [];
    this.regex = pathToRegexp(path, this.keys);
  }
}


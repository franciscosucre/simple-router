const pathToRegexp = require("path-to-regexp");
const url = require("url");
const assert = require("assert");
const http = require("http");

class Router {
  constructor() {
    this.routes = [];
    this.middleware = [];
  }

  match(method, path) {
    const route = this.routes.find(r => r.method == method && r.regex.test(path));
    return route || null;
  }

  async handle(req, res) {
    const { pathname } = url.parse(req.url);
    const route = this.match(req.method, pathname);
    const keys = route.keys;

    const regexResult = route.regex.exec(pathname);
    regexResult.shift();
    req.params = regexResult.reduce((prev, cur, index) => {
      const key = keys[index];
      prev[key.name] = cur;
      return prev;
    }, {});
    for (const handler of route.handlers) {
      await handler(req, res);
    }
  }

  addRoute(method, path, ...args) {
    assert(args.length > 0, "At least one handler function must be passed");
    for (const handler of args) {
      assert(typeof handler === "function", `The 3rd or greater argument must be functions. Value: ${handler}`);
      assert(
        handler.length === 2,
        `handler functions should receive 2 arguments, req and res. Value: ${handler.length}`
      );
    }
    const handlers = this.middleware.concat(args);
    let route = this.routes.find(r => r.method === method && r.path === path);
    if (!route) {
      route = new Route(method, path, handlers.shift());
      this.routes.push(route);
    }
    route.handlers = route.handlers.concat(handlers);
    return this;
  }

  useSubrouter(path, router) {
    assert(path, "path parameter is required");
    assert(router, "router parameter is required");
    assert(router instanceof Router, `router parameter must be Router instance, got ${typeof router}`);
    const routes = router.routes.map(r => r);
    for (const route of routes) {
      const routeArgs = [route.method, path + route.path].concat(route.handlers);
      this.addRoute.apply(this, routeArgs);
    }
    return this;
  }

  useMiddleware(...args) {
    assert(args.length > 0, "At least one handler function must be passed");
    for (const handler of args) {
      assert(typeof handler === "function", `The 3rd or greater argument must be functions. Value: ${handler}`);
    }
    this.middleware = this.middleware.concat(args);
    return this;
  }

  all(path, ...args) {
    const routeArgs = [path].concat(args);
    this.options.apply(this, routeArgs);
    this.head.apply(this, routeArgs);
    this.get.apply(this, routeArgs);
    this.post.apply(this, routeArgs);
    this.put.apply(this, routeArgs);
    this.patch.apply(this, routeArgs);
    this.delete.apply(this, routeArgs);
    return this;
  }

  options(path, ...args) {
    const routeArgs = ["OPTIONS", path].concat(args);
    this.addRoute.apply(this, routeArgs);
    return this;
  }

  head(path, ...args) {
    const routeArgs = ["HEAD", path].concat(args);
    this.addRoute.apply(this, routeArgs);
    return this;
  }

  get(path, ...args) {
    const routeArgs = ["GET", path].concat(args);
    this.addRoute.apply(this, routeArgs);
    return this;
  }

  post(path, ...args) {
    const routeArgs = ["POST", path].concat(args);
    this.addRoute.apply(this, routeArgs);
    return this;
  }

  put(path, ...args) {
    const routeArgs = ["PUT", path].concat(args);
    this.addRoute.apply(this, routeArgs);
    return this;
  }

  patch(path, ...args) {
    const routeArgs = ["PATCH", path].concat(args);
    this.addRoute.apply(this, routeArgs);
    return this;
  }

  delete(path, ...args) {
    const routeArgs = ["DELETE", path].concat(args);
    this.addRoute.apply(this, routeArgs);
    return this;
  }
}

class Route {
  constructor(method, path, ...args) {
    assert(
      http.METHODS.includes(method),
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

module.exports = Router;

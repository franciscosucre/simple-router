const pathToRegexp = require("path-to-regexp");
const url = require("url");
const assert = require("assert");
const http = require("http");

class Router {
  constructor() {
    this.routes = [];
  }

  /**
   *
   * @param {string} method
   * @param {string} path
   */
  match(method, path) {
    const route = this.routes.find(r => r.method == method && r.regex.test(path));
    return route || null;
  }

  /**
   *
   * @param {http.IncomingMessage} req
   * @param {http.ServerResponse} res
   */
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
    await route.handler(req, res);
  }

  /**
   *
   * @param {string} method
   * @param {string} path
   * @param {function} handler
   */
  addRoute(method, path, handler) {
    const route = this.routes.find(r => r.method === method && r.path === path);
    assert(!route, "Only one route per Path/Method combination is permitted");
    this.routes.push(new Route(method, path, handler));
  }

  /**
   *
   * @param {string} path
   * @param {function} handler
   */
  options(path, handler) {
    this.addRoute("OPTIONS", path, handler);
  }

  /**
   *
   * @param {string} path
   * @param {function} handler
   */
  head(path, handler) {
    this.addRoute("HEAD", path, handler);
  }

  /**
   *
   * @param {string} path
   * @param {function} handler
   */
  get(path, handler) {
    this.addRoute("GET", path, handler);
  }

  /**
   *
   * @param {string} path
   * @param {function} handler
   */
  post(path, handler) {
    this.addRoute("POST", path, handler);
  }

  /**
   *
   * @param {string} path
   * @param {function} handler
   */
  put(path, handler) {
    this.addRoute("PUT", path, handler);
  }

  /**
   *
   * @param {string} path
   * @param {function} handler
   */
  patch(path, handler) {
    this.addRoute("PATCH", path, handler);
  }

  /**
   *
   * @param {string} path
   * @param {function} handler
   */
  delete(path, handler) {
    this.addRoute("DELETE", path, handler);
  }
}

class Route {
  /**
   *
   * @param {string} method
   * @param {string} path
   * @param {function} handler
   */
  constructor(method, path, handler) {
    assert(
      http.METHODS.includes(method),
      `The "method" parameter must one of the following [${http.METHODS.toString()}]. Value: ${method}`
    );
    assert(typeof path === "string", `The "path" parameter must be a string. Value: ${path}`);
    assert(typeof handler === "function", `The "handler" parameter must be a function. Value: ${handler}`);
    this.method = method;
    this.path = path;
    this.handler = handler;
    this.keys = [];
    this.regex = pathToRegexp(path, this.keys);
  }
}

module.exports = Router;

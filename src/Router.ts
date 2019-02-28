import * as assert from 'assert';
import { posix } from 'path';
import * as url from 'url';
import RouteNotFoundError from './exceptions';
import { HandlerFunction, IRequest } from './interfaces';
import Route from './Route';

export class Router {
  public routes: Route[];
  public middleware: HandlerFunction[] = [];

  constructor() {
    this.routes = [];
    this.middleware = [];
  }

  public match(method: string, path: string): Route | null {
    const route = this.routes.find(r => r.method === method && r.regex.test(posix.normalize(path)));
    return route || null;
  }

  public async handle(req: IRequest, res: any) {
    const { pathname } = url.parse(req.url as string);
    if (!pathname) {
      throw new Error('Could not parse pathname from url');
    }
    const route = this.match(req.method || '', pathname);
    if (!route) {
      throw new RouteNotFoundError(req.method || '', pathname);
    }
    await route.handle(req, res);
  }

  public addRoute(method: string, path: string, ...handlers: HandlerFunction[]) {
    assert(handlers.length > 0, 'At least one handler function must be passed');
    const middleware = this.middleware.slice();
    let route = this.match(method, path);
    if (!route) {
      const firstHandler = middleware.length > 0 ? middleware.shift() : handlers.shift();
      route = new Route(method, path, firstHandler as HandlerFunction);
      route.handlers = route.handlers.concat(middleware);
      this.routes.push(route);
    }
    route.handlers = route.handlers.concat(handlers);
    return this;
  }

  public useSubrouter(path: string, router: Router) {
    assert(path, 'path parameter is required');
    assert(router, 'router parameter is required');
    assert(router instanceof Router, `router parameter must be Router instance, got ${typeof router}`);
    const routes = router.routes.map(r => r);
    for (const route of routes) {
      this.addRoute(route.method, posix.normalize(path + route.path), ...route.handlers);
    }
    return this;
  }

  public useMiddleware(...args: HandlerFunction[]) {
    assert(args.length > 0, 'At least one handler function must be passed');
    this.middleware = this.middleware.concat(args);
    return this;
  }

  public all(path: string, ...args: HandlerFunction[]) {
    this.options(path, ...args);
    this.head(path, ...args);
    this.get(path, ...args);
    this.post(path, ...args);
    this.put(path, ...args);
    this.patch(path, ...args);
    this.delete(path, ...args);
    return this;
  }

  public options(path: string, ...args: HandlerFunction[]) {
    this.addRoute('OPTIONS', path, ...args);
    return this;
  }

  public head(path: string, ...args: HandlerFunction[]) {
    this.addRoute('HEAD', path, ...args);
    return this;
  }

  public get(path: string, ...args: HandlerFunction[]) {
    this.addRoute('GET', path, ...args);
    return this;
  }

  public post(path: string, ...args: HandlerFunction[]) {
    this.addRoute('POST', path, ...args);
    return this;
  }

  public put(path: string, ...args: HandlerFunction[]) {
    this.addRoute('PUT', path, ...args);
    return this;
  }

  public patch(path: string, ...args: HandlerFunction[]) {
    this.addRoute('PATCH', path, ...args);
    return this;
  }

  public delete(path: string, ...args: HandlerFunction[]) {
    this.addRoute('DELETE', path, ...args);
    return this;
  }
}

export default Router;

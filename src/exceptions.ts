export class RouteNotFoundError extends Error {
  public name = 'RouteNotFoundError';
  public code = 'RouteNotFoundError';
  public status: number = 404;
  public method: string;
  public route: string;

  constructor(method: string, route: string) {
    super(`The requested route was not found. METHOD: ${method} - ROUTE: ${route}`);
    this.method = method;
    this.route = route;
  }
}

export default RouteNotFoundError;

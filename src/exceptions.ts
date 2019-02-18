export class RouteNotFoundError extends Error {
  public message =
    'No route was found when calling the handle method, please check with the match method first so you can handle the error';
}

export default RouteNotFoundError;

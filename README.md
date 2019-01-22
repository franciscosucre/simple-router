# simple-router

A simple, lightweight router for NodeJS Http server. No Middleware, only simple routes with handlers.

## **How to install**

```shell
npm install --save simple-router
```

# **Router**

Main class.

## **Methods**

- **addRoute(method, path, handler):** Adds a route to the router. Must be given a valid http method (GET, POST, etc), a path (/foo/fighters) and a handler function that receives a NodeJS request (IncomingMessage class) and response (ServerResponse). If a duplicate route is being registered, it will throw an AssertionError. This methods has different aliases for the most common http methods [options, head, get, post, put, patch, delete] that only receive the path and the handler.

- **useSubrouter(path, router):** Appends the router routes to the main router with a path created by joining the path of the first router and the router given. This allows us to make module specific routers.

```javascript
const router = new Router();
const secondRouter = new Router();
secondRouter.get("/foo", SIMPLE_HANDLER);
secondRouter.get("/fighter", SIMPLE_HANDLER);
router.useSubrouter("/second", secondRouter);
```

- **match(method, path):** Search if it exists a registered route with the given http method and path. Returns the route if exists and returns null if not.

- **handle(req, res):** Executes the handler the route that matches the NodeJS request url and method. This method is an integration for NodeJS Http servers.

## **Example with a NodeJS Http Server**

```javascript
const handleError = (req, res, err) => {
  const status = err.status || 500;
  res.writeHead(status, headers);
  res.end(
    JSON.stringify({
      code: err.code || err.name || "Error",
      message: err.message || "An unexpected error has ocurred",
      status
    })
  );
};

const server = http.createServer(async (reqExt, resExt) => {
  try {
    if (!router.match(reqExt.method, reqExt.url))
      throw {
        name: "ResourceNotFound",
        message: "Resource not found",
        status: 404
      };
    await router.handle(reqExt, resExt);
  } catch (error) {
    handleError(reqExt, resExt, error);
  }
});
```

## **How to test**

```shell
npm test
```

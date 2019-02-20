# @sugo/router (simple-router)

A simple, lightweight router for NodeJS Http server. Middleware and nested routers included. Promise oriented.

## **How to install**

```shell
npm install --save @sugo/router
```

## **Adding routes**

The syntax for adding routes is heavily inspired by the express router. Although it does not use it. The router class uses a general addRoute method internally but it is not meant to be used directly. The intended way is through the addRoute method aliases.

- options(path, handler)
- head(path, handler)
- get(path, handler)
- post(path, handler)
- put(path, handler)
- patch(path, handler)
- delete(path, handler)

Paths are parsed using the [path-to-regexp](https://github.com/pillarjs/path-to-regexp) module. This module is mantained by the ExpressJS team through the [pillarjs](https://github.com/pillarjs/) project.

Uses the [normalize](https://nodejs.org/docs/latest-v10.x/api/path.html#path_path_normalize_path) method from the [NodeJS path module](https://nodejs.org/docs/latest-v10.x/api/path.html) in the given paths so **////foo** will be stored as **/foo**.

```typescript
import { Router, IRequest, IResponse } from '@sugo/router';
const router = new Router();
router.get('/foo', (req: IRequest, res: IResponse) => console.log(req, res));
```

## **Route Parameters**

Route parameters are parsed with the [path-to-regexp](https://github.com/pillarjs/path-to-regexp) and then stored in the params property in the IRequest object.

```typescript
import { Router, IRequest, IResponse } from '@sugo/router';
const router = new Router();
router.get('/:foo/:fighters', (req: IRequest, res: IResponse) => {
  res.writeHead(200, headers);
  res.end(
    JSON.stringify({
      params: req.params,
    }),
  );
});
```

## **Nested Routers**

Nesting routers is supported using the useSubrouter method.

**useSubrouter(path, router):** Appends the router routes to the main router with a path created by joining the path of the first router and the router given. This allows us to make module specific routers.

```typescript
import { Router, IRequest, IResponse } from '@sugo/router';
const router = new Router();
const secondRouter = new Router();
secondRouter.get('/foo', (req: IRequest, res: IResponse) => console.log(req, res));
secondRouter.get('/fighter', (req: IRequest, res: IResponse) => console.log(req, res));
router.useSubrouter('/second', secondRouter);
// The router now contains the '/second/foo' and '/second/fighter' routes
```

## **Router Middleware**

Middleware can be added for the whole router using the useMiddleware method. The middleware stack is added at the start of any route handler stack when we add the route. A middleware only affects routes that were added after the middleware was added. Each middleware must call the next function in order to continue the middleware stack.

```typescript
import { Router, IRequest, IResponse, INextFunction } from '@sugo/router';
const router = new Router();
router.useMiddleware(async (req: IRequest, res: IResponse, next?: INextFunction) => {
  req.foo = 'fighters';
  next ? await next() : null;
});
router.get('/foo', (req: IRequest, res: IResponse) => res.end(JSON.stringify({ foo: req.foo })));
router.post('/fighter', (req: IRequest, res: IResponse) => res.end(JSON.stringify({ foo: req.foo })));
// The foo IS available in the /foo and /fighter routes

router.useMiddleware((req: IRequest, res: IResponse) => (req.fighters = true));
// The fighters param IS NOT available in the /foo and /fighter routes
```

## **Route Middleware**

Route middleware can be achieved using the .all() method. It makes sure that the given function is executed on each method in the selected route.

```typescript
import { Router, IRequest, IResponse, INextFunction } from '@sugo/router';
const router = new Router();
router.all('/foo', (req: IRequest, res: IResponse, next?: INextFunction) => {
  req.foo = 'fighters';
  next ? await next() : null;
};
router.get('/foo', (req: IRequest, res: IResponse) => res.end(JSON.stringify({ foo: req.foo })));
router.post('/foo', (req: IRequest, res: IResponse) => res.end(JSON.stringify({ foo: req.foo })));
// The foo IS available in all the /foo routes
```

## **Compatibility with ExpressJS middleware**

Because most of the middleware built for express are functions the receive a nodejs IRequest (IncomingRequest) and IResponse (ServerResponse) objects, they should be compatible with the useMiddleware method or an .all() route handler.

## **Integration with NodeJS Http Server**

To use the router with a NodeJS server we look for the IRequest route/method combination in the router and then we execute the assigned handlers. This is done with the following methods.

```typescript
import { Router, IRequest, IResponse } from '@sugo/router';
import * as http from 'http';
const router = new Router();
router.get('/foo', (req: IRequest, res: IResponse) => res.end(JSON.stringify({ success: true })));

const handleError = (req: IRequest, res: IResponse, err: any) => {
  const status = err.status || 500;
  res.writeHead(status, headers);
  res.end(
    JSON.stringify({
      code: err.code || err.name || 'Error',
      message: err.message || 'An unexpected error has ocurred',
      status,
    }),
  );
};

const server = http.createServer(async (req: IRequest, res: IResponse) => {
  try {
    await router.handle(req, res);
  } catch (error) {
    handleError(req, res, error);
  }
});
```

- **match(method, path):** Search if it exists a registered route with the given http method and path. Returns the route if exists and returns null if not.

- **handle(req, res):** Executes the handler the route that matches the NodeJS IRequest url and method. This method is an integration for NodeJS Http servers.

## **How to test**

```shell
npm test
```

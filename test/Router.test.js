const chai = require("chai");
const Router = require("../index");
const assert = require("assert");
const AssertionError = assert.AssertionError;
let router;
const OPTIONS = "OPTIONS";
const HEAD = "HEAD";
const GET = "GET";
const POST = "POST";
const PUT = "PUT";
const PATCH = "PATCH";
const DELETE = "DELETE";
const http = require("http");
const PATH = "/foo";
const PATH_WITH_ARGUMENTS = "/:foo/:fighters";
const headers = { "Content-Type": "application/json" };
const SIMPLE_HANDLER = (req, res) => {
  res.writeHead(200, headers);
  res.end(
    JSON.stringify({
      params: req.params
    })
  );
};
const chaiHttp = require("chai-http");
chai.use(chaiHttp);
chai.should();

//Our parent block
describe("Simple NodeJS Router", () => {
  beforeEach(async function() {
    router = new Router();
  });

  describe(`Constructor`, () => {
    it("It should create a router without arguments", async function() {
      const fn = () => new Router({});
      fn.should.not.throw(Error);
    });
  });

  describe(`addRoute`, () => {
    it("It should throw an exception if the method passed is not a http method", async function() {
      let fn = () => router.addRoute(324, PATH, SIMPLE_HANDLER);
      fn.should.throw(AssertionError);
      fn = () => router.addRoute("foo", PATH, SIMPLE_HANDLER);
      fn.should.throw(AssertionError);
      fn = () => router.addRoute(null, () => PATH, SIMPLE_HANDLER);
      fn.should.throw(AssertionError);
    });

    it("It should throw an exception if the path passed is not a string", async function() {
      let fn = () => router.addRoute(GET, 324, SIMPLE_HANDLER);
      fn.should.throw(AssertionError);
      fn = () => router.addRoute(GET, null, SIMPLE_HANDLER);
      fn.should.throw(AssertionError);
      fn = () => router.addRoute(GET, () => "console", SIMPLE_HANDLER);
      fn.should.throw(AssertionError);
    });

    it("It should throw an exception if the handler passed is not a function", async function() {
      let fn = () => router.addRoute(GET, PATH, "hfghgf");
      fn.should.throw(AssertionError);
      fn = () => router.addRoute(GET, PATH, 21323);
      fn.should.throw(AssertionError);
      fn = () => router.addRoute(GET, PATH, null);
      fn.should.throw(AssertionError);
      fn = () => router.addRoute(GET, PATH);
      fn.should.throw(AssertionError);
    });

    it("It should throw an exception if try to add a duplicate route", async function() {
      let fn = () => {
        router.addRoute(GET, PATH, SIMPLE_HANDLER);
        router.addRoute(GET, PATH, SIMPLE_HANDLER);
      };
      fn.should.throw(AssertionError);
    });

    it("It create a route", async function() {
      router.addRoute(GET, PATH, SIMPLE_HANDLER);
      const routes = router.routes;
      routes.length.should.be.eql(1);
      const [createdRoute] = routes;
      createdRoute.method.should.be.eql(GET);
      createdRoute.path.should.be.eql(PATH);
      createdRoute.handler.should.be.eql(SIMPLE_HANDLER);
    });

    it("It create a route with keys if given a path with arguments", async function() {
      router.addRoute(GET, PATH_WITH_ARGUMENTS, SIMPLE_HANDLER);
      const routes = router.routes;
      routes.length.should.be.eql(1);
      const [createdRoute] = routes;
      createdRoute.method.should.be.eql(GET);
      createdRoute.path.should.be.eql(PATH_WITH_ARGUMENTS);
      createdRoute.handler.should.be.eql(SIMPLE_HANDLER);
      const keyStrings = createdRoute.keys.map(k => k.name);
      keyStrings.should.be.eql(["foo", "fighters"]);
    });

    describe(`addRoute Aliases`, () => {
      describe(`OPTIONS`, () => {
        it("It should add a route with a OPTIONS method", async function() {
          router.options(PATH, SIMPLE_HANDLER);
          const routes = router.routes;
          routes.length.should.be.eql(1);
          const [createdRoute] = routes;
          createdRoute.method.should.be.eql(OPTIONS);
          createdRoute.path.should.be.eql(PATH);
          createdRoute.handler.should.be.eql(SIMPLE_HANDLER);
        });
      });

      describe(`HEAD`, () => {
        it("It should add a route with a HEAD method", async function() {
          router.head(PATH, SIMPLE_HANDLER);
          const routes = router.routes;
          routes.length.should.be.eql(1);
          const [createdRoute] = routes;
          createdRoute.method.should.be.eql(HEAD);
          createdRoute.path.should.be.eql(PATH);
          createdRoute.handler.should.be.eql(SIMPLE_HANDLER);
        });
      });

      describe(`GET`, () => {
        it("It should add a route with a GET method", async function() {
          router.get(PATH, SIMPLE_HANDLER);
          const routes = router.routes;
          routes.length.should.be.eql(1);
          const [createdRoute] = routes;
          createdRoute.method.should.be.eql(GET);
          createdRoute.path.should.be.eql(PATH);
          createdRoute.handler.should.be.eql(SIMPLE_HANDLER);
        });
      });

      describe(`POST`, () => {
        it("It should add a route with a POST method", async function() {
          router.post(PATH, SIMPLE_HANDLER);
          const routes = router.routes;
          routes.length.should.be.eql(1);
          const [createdRoute] = routes;
          createdRoute.method.should.be.eql(POST);
          createdRoute.path.should.be.eql(PATH);
          createdRoute.handler.should.be.eql(SIMPLE_HANDLER);
        });
      });

      describe(`PUT`, () => {
        it("It should add a route with a PUT method", async function() {
          router.put(PATH, SIMPLE_HANDLER);
          const routes = router.routes;
          routes.length.should.be.eql(1);
          const [createdRoute] = routes;
          createdRoute.method.should.be.eql(PUT);
          createdRoute.path.should.be.eql(PATH);
          createdRoute.handler.should.be.eql(SIMPLE_HANDLER);
        });
      });

      describe(`PATCH`, () => {
        it("It should add a route with a PATCH method", async function() {
          router.patch(PATH, SIMPLE_HANDLER);
          const routes = router.routes;
          routes.length.should.be.eql(1);
          const [createdRoute] = routes;
          createdRoute.method.should.be.eql(PATCH);
          createdRoute.path.should.be.eql(PATH);
          createdRoute.handler.should.be.eql(SIMPLE_HANDLER);
        });
      });

      describe(`DELETE`, () => {
        it("It should add a route with a DELETE method", async function() {
          router.delete(PATH, SIMPLE_HANDLER);
          const routes = router.routes;
          routes.length.should.be.eql(1);
          const [createdRoute] = routes;
          createdRoute.method.should.be.eql(DELETE);
          createdRoute.path.should.be.eql(PATH);
          createdRoute.handler.should.be.eql(SIMPLE_HANDLER);
        });
      });
    });
  });

  describe(`match`, () => {
    it("It should return the route if it exists", async function() {
      router.get(PATH, SIMPLE_HANDLER);
      const route = router.match(GET, PATH);
      route.should.have.property("method");
      route.should.have.property("path");
      route.should.have.property("handler");
      route.should.have.property("keys");
      route.should.have.property("regex");
    });

    it("It should return null if the route does not exist", async function() {
      const exists = router.match(GET, PATH) !== null;
      exists.should.be.eql(false);
    });
  });

  describe(`handle`, () => {
    const server = http.createServer(async (req, res) => {
      try {
        if (!router.match(req.method, req.url))
          throw { name: "ResourceNotFound", message: "Resource not found", status: 404 };
        await router.handle(req, res);
      } catch (error) {
        const status = error.status || 500;
        res.writeHead(status, headers);
        res.end(
          JSON.stringify({
            code: error.code || error.name || "Error",
            message: error.message || "An unexpected error has ocurred",
            status
          })
        );
      }
    });

    before(async function() {
      server.listen(3000);
    });

    after(async function() {
      server.close();
    });

    it("It should run the handler", async function() {
      router.get(PATH, SIMPLE_HANDLER);
      const response = await chai.request(server).get(PATH);
      response.should.have.status(200);
    });

    it("It should run the handler and store the arguments if a route with arguments was given", async function() {
      router.get(PATH_WITH_ARGUMENTS, SIMPLE_HANDLER);
      const response = await chai.request(server).get("/hello/world");
      response.should.have.status(200);
      response.body.should.have.property("params");
      response.body.params.should.have.property("foo");
      response.body.params.should.have.property("fighters");
      response.body.params.foo.should.be.eql("hello");
      response.body.params.fighters.should.be.eql("world");
    });
  });
});

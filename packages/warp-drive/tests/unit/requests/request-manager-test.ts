import RequestManager, { Request, RequestResponse, nextFn } from 'warp-drive/query';
import { test, module } from 'qunit';
import { setupTest } from 'ember-qunit';
import { DEBUG } from '@glimmer/env';
import { Promise } from 'rsvp';

module('Unit - RequestManager', function(hooks) {
  setupTest(hooks);

  test('It can be instantiated', async function(assert) {
    try {
      new RequestManager();
      assert.ok(true, `Instantiated a new RequestManager`);
    } catch (e) {
      assert.ok(false, `Unable to instantiate a new RequestManager ${e.message}`);
    }
  });

  test('We can register Middleware', async function(assert) {
    try {
      const middleware = {
        request(): Promise<RequestResponse> {
          const response = {};
          return Promise.resolve(response);
        },
      };
      const manager = new RequestManager();
      manager.use(middleware);
      assert.ok(true, `Added a middleware`);
    } catch (e) {
      assert.ok(false, `Unabe to register middleware with RequestManager ${e.message}`);
    }
  });

  test('Middleware is passed the request and a next function', async function(assert) {
    assert.expect(2);
    const request = { type: 'query' } as Request;
    const middleware = {
      request(req: Request, next: nextFn): Promise<RequestResponse> {
        assert.strictEqual(req, request, 'We are passed the request');
        assert.equal(typeof next, 'function', 'We are passed a nextFn');
        const response = {};
        return Promise.resolve(response);
      },
    };
    const manager = new RequestManager();
    manager.use(middleware);

    await manager.request(request);
  });

  test('Middleware that call next when there is no next error', async function(assert) {
    assert.expect(3);
    const request = { type: 'query' } as Request;
    const middleware = {
      request(req: Request, next: nextFn): Promise<RequestResponse> {
        assert.strictEqual(req, request, 'We are passed the request');
        assert.equal(typeof next, 'function', 'We are passed a nextFn');

        return next(req);
      },
    };
    const manager = new RequestManager();
    manager.use(middleware);

    try {
      await manager.request(request);
      assert.ok(false, 'We did not throw an error');
    } catch (e) {
      assert.ok(true, `We throw an error: ${e.message}`);
    }
  });

  test('We can register Many Middlewares', async function(assert) {
    try {
      const middleware1 = {
        request(): Promise<RequestResponse> {
          const response = {};
          return Promise.resolve(response);
        },
      };
      const middleware2 = {
        request(): Promise<RequestResponse> {
          const response = {};
          return Promise.resolve(response);
        },
      };
      const manager = new RequestManager();
      manager.use(middleware1);
      manager.use(middleware2);
      assert.ok(true, `Added two middlewares`);
    } catch (e) {
      assert.ok(false, `Unabe to register middleware with RequestManager ${e.message}`);
    }
  });

  test('We can call next to call the next middleware', async function(assert) {
    assert.expect(6);
    const request = { type: 'query' } as Request;
    const newRequest = { type: 'query' } as Request;
    const response = {};

    const middleware1 = {
      request(req: Request, next: nextFn): Promise<RequestResponse> {
        assert.strictEqual(req, request, 'We are passed the request');
        assert.equal(typeof next, 'function', 'We are passed a nextFn');
        return next(newRequest).then(resp => {
          assert.strictEqual(resp, response, 'We are passed the response');
          return resp;
        });
      },
    };
    const middleware2 = {
      request(req: Request, next: nextFn): Promise<RequestResponse> {
        assert.strictEqual(req, newRequest, 'We are passed the request');
        assert.equal(typeof next, 'function', 'We are passed a nextFn');

        return Promise.resolve(response);
      },
    };
    const manager = new RequestManager();
    manager.use(middleware1);
    manager.use(middleware2);

    let resp = await manager.request(request);
    assert.strictEqual(resp, response, 'We are passed the response');
  });

  if (DEBUG) {
    test('We cannot register Additional Middlewares after our first request', async function(assert) {
      let manager;
      const middleware1 = {
        request(): Promise<RequestResponse> {
          const response = {};
          return Promise.resolve(response);
        },
      };
      const middleware2 = {
        request(): Promise<RequestResponse> {
          const response = {};
          return Promise.resolve(response);
        },
      };
      manager = new RequestManager();
      manager.use(middleware1);
      manager.use(middleware2);
      assert.ok(true, `Added two middlewares`);

      try {
        await manager.request({
          type: 'query',
        });
        assert.ok(true, 'Was able to perform request');
      } catch (e) {
        assert.ok(false, `Was not able to perform request: ${e.message}`);
      }

      try {
        const middleware3 = {
          request(): Promise<RequestResponse> {
            const response = {};
            return Promise.resolve(response);
          },
        };
        manager.use(middleware3);
        assert.ok(false, 'Was incorrectly able to register middleware after first request');
      } catch (e) {
        assert.ok(true, `Registering middelware after the first request errored ${e.message}`);
      }
    });
  }
});

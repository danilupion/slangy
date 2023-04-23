import Method from '@danilupion/turbo-common/http/method.js';
import { Router } from 'express';

// eslint-disable-next-line jest/no-export
export default (
  router: Router,
  name: string,
  routes: ([Method, string] | string)[],
  ...extraChecks: (() => void)[]
) => {
  describe(`Router ${name}`, () => {
    const registeredRoutes: { path: string; methods: { [key in Method]?: boolean } }[] =
      router.stack
        .filter((s) => !!s.route)
        .map((s) => ({
          path: s.route.path,
          methods: s.route.methods,
        }));

    const registeredRouters: RegExp[] = router.stack.filter((s) => !s.route).map((s) => s.regexp);

    const routersInRoutes = routes.filter((r) => typeof r === 'string') as string[];
    const routesInRoutes = routes.filter((r) => typeof r !== 'string') as [Method, string][];

    routersInRoutes.forEach((route, index) => {
      it(`Should register router at ${route}`, () => {
        expect(registeredRouters[index].test(route)).toBe(true);
      });
    });

    routesInRoutes.forEach((route) => {
      const [method, path] = route;
      it(`Should register ${method} route at ${path}`, () => {
        expect(
          registeredRoutes.some((registeredRoute) => {
            return registeredRoute.path === path && registeredRoute.methods[method as Method];
          }),
        ).toBe(true);
      });
    });

    it(`Should have exactly ${routes.length} routes`, () => {
      expect(router.stack).toHaveLength(routes.length);
    });

    for (const check of extraChecks) {
      check();
    }
  });
};

import Method from '@slangy/common/http/method.js';

import { Router } from '../helpers/express/router.js';

const areRegExpsEquivalent = (regexp1: RegExp, regexp2: RegExp) => {
  return regexp1.source === regexp2.source && regexp1.flags === regexp2.flags;
};

// eslint-disable-next-line jest/no-export
export default (
  router: Router,
  name: string,
  routes: ([Method, string] | string)[],
  ...extraChecks: (() => void)[]
) => {
  describe(`Router ${name}`, () => {
    const registeredRoutes: { path: string; methods: { [key in Method]?: boolean } }[] = router
      .getExpressRouter()
      .stack.filter((s) => !!s.route)
      .map((s) => ({
        path: s.route.path,
        methods: s.route.methods,
      }));

    let duplicateRoutes = 0;

    const registeredRouters: RegExp[] = router
      .getExpressRouter()
      .stack.filter((s) => !s.route)
      .map((s) => s.regexp)
      // Remove duplicate regexps
      .filter((regexp, index, self) => {
        const isDuplicate = self.some((r, i) => i < index && areRegExpsEquivalent(regexp, r));
        if (isDuplicate) {
          duplicateRoutes++;
        }
        return !isDuplicate;
      });

    console.log(registeredRouters);

    // Copy routes to avoid mutating the original array and add a catch-all route
    const routesCopy = [...routes, '/*'];

    const routersInRoutes = routesCopy.filter((r) => typeof r === 'string') as string[];
    const routesInRoutes = routesCopy.filter((r) => typeof r !== 'string') as [Method, string][];

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

    it(`Should have exactly ${routesCopy.length + duplicateRoutes} entry points`, () => {
      expect(router.getExpressRouter().stack).toHaveLength(routesCopy.length + duplicateRoutes);
    });

    for (const check of extraChecks) {
      check();
    }
  });
};

import { appRoutes } from './app.routes';

describe('appRoutes', () => {
  it('loads the remote entry routes from the root path', () => {
    expect(appRoutes).toHaveLength(1);
    expect(appRoutes[0]).toMatchObject({ path: '' });
    expect(appRoutes[0].loadChildren).toBeTypeOf('function');
  });
});
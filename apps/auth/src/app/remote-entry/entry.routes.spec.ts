import { RemoteEntry } from './entry';
import { remoteRoutes } from './entry.routes';

describe('remoteRoutes', () => {
  it('mounts the auth remote entry at the root path', () => {
    expect(remoteRoutes).toHaveLength(1);
    expect(remoteRoutes[0]).toMatchObject({ path: '', component: RemoteEntry });
  });

  it('defines login and register child routes', () => {
    const children = remoteRoutes[0].children ?? [];

    expect(children).toHaveLength(3);
    expect(children[0]).toMatchObject({ path: '', pathMatch: 'full', redirectTo: 'login' });
    expect(children[1]).toMatchObject({ path: 'login' });
    expect(children[1].loadComponent).toBeTypeOf('function');
    expect(children[2]).toMatchObject({ path: 'register' });
    expect(children[2].loadComponent).toBeTypeOf('function');
  });
});
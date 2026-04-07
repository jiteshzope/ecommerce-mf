import { RemoteEntry } from './entry';
import { remoteRoutes } from './entry.routes';

describe('remoteRoutes', () => {
  it('mounts the remote entry component at the root path', () => {
    expect(remoteRoutes).toHaveLength(1);
    expect(remoteRoutes[0]).toMatchObject({
      path: '',
      component: RemoteEntry,
    });
  });

  it('defines list and details child routes', () => {
    const children = remoteRoutes[0].children ?? [];

    expect(children).toHaveLength(2);
    expect(children[0]).toMatchObject({ path: '', pathMatch: 'full' });
    expect(children[0].loadComponent).toBeTypeOf('function');
    expect(children[1]).toMatchObject({ path: ':id' });
    expect(children[1].loadComponent).toBeTypeOf('function');
  });
});
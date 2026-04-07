import { RemoteEntry } from './entry';
import { remoteRoutes } from './entry.routes';

describe('remoteRoutes', () => {
  it('mounts the cart remote entry component at the root path', () => {
    expect(remoteRoutes).toEqual([{ path: '', component: RemoteEntry }]);
  });
});
import { ShellRemoteChannelService } from './shell-remote-channel.service';

describe('ShellRemoteChannelService', () => {
  it('publishes events to subscribers', () => {
    const channel = new ShellRemoteChannelService<{ type: string }>();
    const received: Array<{ type: string }> = [];

    channel.events$.subscribe((event) => received.push(event));
    channel.publish({ type: 'cart-updated' });

    expect(received).toEqual([{ type: 'cart-updated' }]);
  });
});
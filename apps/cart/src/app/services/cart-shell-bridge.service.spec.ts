import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import {
  CART_EVENT_TYPES,
  CART_SHELL_CHANNEL,
  REMOTE_SOURCES,
  type CartChannelEvent,
} from '@ecommerce-mf/session';
import { CartShellBridgeService } from './cart-shell-bridge.service';

class MockCartChannel<TEvent> {
  private readonly subject = new Subject<TEvent>();

  readonly events$ = this.subject.asObservable();

  publish(event: TEvent): void {
    this.subject.next(event);
  }
}

const publishShellEvent = (
  channel: MockCartChannel<CartChannelEvent>,
  type: string,
  source = REMOTE_SOURCES.SHELL,
) => {
  channel.publish({ source, type, timestamp: Date.now() } as CartChannelEvent);
};

describe('CartShellBridgeService', () => {
  let channel: MockCartChannel<CartChannelEvent>;

  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    channel = new MockCartChannel<CartChannelEvent>();

    TestBed.configureTestingModule({
      providers: [{ provide: CART_SHELL_CHANNEL, useValue: channel }],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('emits clear-cart notifications for shell clear-cart events', () => {
    const service = TestBed.inject(CartShellBridgeService);
    const clearCart = vi.fn();

    service.clearCart$.subscribe(clearCart);
    publishShellEvent(channel, CART_EVENT_TYPES.CLEAR_CART);

    expect(clearCart).toHaveBeenCalledTimes(1);
  });

  it('handles sync and unknown shell events without publishing remote events', () => {
    TestBed.inject(CartShellBridgeService);

    publishShellEvent(channel, CART_EVENT_TYPES.SYNC_CART);
    publishShellEvent(channel, 'unexpected-event');
    publishShellEvent(channel, CART_EVENT_TYPES.CLEAR_CART, REMOTE_SOURCES.CART);

    expect(console.log).toHaveBeenCalled();
  });

  it('publishes remote events with cart metadata', () => {
    const service = TestBed.inject(CartShellBridgeService);
    const published: CartChannelEvent[] = [];

    channel.events$.subscribe((event) => published.push(event));

    service.publishRemoteReady();
    service.publishCartUpdated();
    service.publishCheckoutInitiated();
    service.publishCartCleared();

    expect(published).toEqual([
      expect.objectContaining({ source: REMOTE_SOURCES.CART, type: CART_EVENT_TYPES.REMOTE_READY }),
      expect.objectContaining({ source: REMOTE_SOURCES.CART, type: CART_EVENT_TYPES.CART_UPDATED }),
      expect.objectContaining({ source: REMOTE_SOURCES.CART, type: CART_EVENT_TYPES.CHECKOUT_INITIATED }),
      expect.objectContaining({ source: REMOTE_SOURCES.CART, type: CART_EVENT_TYPES.CART_CLEARED }),
    ]);
  });
});
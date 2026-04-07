import { TestBed } from '@angular/core/testing';
import {
  PRODUCT_EVENT_TYPES,
  PRODUCT_SHELL_CHANNEL,
  REMOTE_SOURCES,
  type ProductChannelEvent,
} from '@ecommerce-mf/session';
import { ProductShellBridgeService } from './product-shell-bridge.service';

class MockProductChannel<TEvent> {
  private readonly subject = new (require('rxjs').Subject)<TEvent>();

  readonly events$ = this.subject.asObservable();

  publish(event: TEvent): void {
    this.subject.next(event);
  }
}

const publishShellEvent = (
  channel: MockProductChannel<ProductChannelEvent>,
  type: string,
  source = REMOTE_SOURCES.SHELL,
) => {
  channel.publish({
    source,
    type,
    timestamp: Date.now(),
  });
};

describe('ProductShellBridgeService', () => {
  let channel: MockProductChannel<ProductChannelEvent>;

  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    channel = new MockProductChannel<ProductChannelEvent>();

    TestBed.configureTestingModule({
      providers: [{ provide: PRODUCT_SHELL_CHANNEL, useValue: channel }],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('logs shell-driven product events and ignores remote-originated ones', () => {
    TestBed.inject(ProductShellBridgeService);

    publishShellEvent(channel, PRODUCT_EVENT_TYPES.LOAD_PRODUCT);
    publishShellEvent(channel, PRODUCT_EVENT_TYPES.CLEAR_SELECTION);
    publishShellEvent(channel, PRODUCT_EVENT_TYPES.FILTER_BY_CATEGORY);
    publishShellEvent(channel, 'unexpected-event');
    publishShellEvent(channel, PRODUCT_EVENT_TYPES.LOAD_PRODUCT, REMOTE_SOURCES.PRODUCT);

    expect(console.log).toHaveBeenCalled();
  });

  it('publishes remote-ready and cart-updated events back to shell', () => {
    const service = TestBed.inject(ProductShellBridgeService);
    const published: ProductChannelEvent[] = [];

    channel.events$.subscribe((event) => published.push(event));

    service.publishRemoteReady();
    service.publishCartUpdated();

    expect(published).toEqual([
      expect.objectContaining({ source: REMOTE_SOURCES.PRODUCT, type: PRODUCT_EVENT_TYPES.REMOTE_READY }),
      expect.objectContaining({ source: REMOTE_SOURCES.PRODUCT, type: PRODUCT_EVENT_TYPES.CART_UPDATED }),
    ]);
  });
});
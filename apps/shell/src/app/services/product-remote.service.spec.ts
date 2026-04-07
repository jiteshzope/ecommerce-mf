import { TestBed } from '@angular/core/testing';
import {
  PRODUCT_EVENT_TYPES,
  PRODUCT_SHELL_CHANNEL,
  REMOTE_SOURCES,
  type ProductChannelEvent,
} from '@ecommerce-mf/session';
import { ShellStore } from '../stores/shell.store';
import { ProductRemoteService } from './product-remote.service';
import { ShellRemoteChannelService } from './shell-remote-channel.service';

const publishProductEvent = (
  channel: ShellRemoteChannelService<ProductChannelEvent>,
  type: string,
  source = REMOTE_SOURCES.PRODUCT,
) => {
  channel.publish({
    source,
    type,
    timestamp: Date.now(),
  });
};

describe('ProductRemoteService', () => {
  let channel: ShellRemoteChannelService<ProductChannelEvent>;
  let store: {
    isAuthenticated: ReturnType<typeof vi.fn>;
    loadCartItemCount: ReturnType<typeof vi.fn>;
    setCartItemCount: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    channel = new ShellRemoteChannelService<ProductChannelEvent>();
    store = {
      isAuthenticated: vi.fn(() => true),
      loadCartItemCount: vi.fn().mockResolvedValue(undefined),
      setCartItemCount: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: PRODUCT_SHELL_CHANNEL, useValue: channel },
        { provide: ShellStore, useValue: store },
      ],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('refreshes cart count on product cart updates for authenticated users', () => {
    TestBed.inject(ProductRemoteService);

    publishProductEvent(channel, PRODUCT_EVENT_TYPES.CART_UPDATED);

    expect(store.loadCartItemCount).toHaveBeenCalledTimes(1);
    expect(store.setCartItemCount).not.toHaveBeenCalled();
  });

  it('resets cart count on product cart updates for guests', () => {
    TestBed.inject(ProductRemoteService);
    store.isAuthenticated.mockReturnValue(false);

    publishProductEvent(channel, PRODUCT_EVENT_TYPES.CART_UPDATED);

    expect(store.setCartItemCount).toHaveBeenCalledWith(0);
    expect(store.loadCartItemCount).not.toHaveBeenCalled();
  });

  it('ignores events not emitted by the product remote', () => {
    TestBed.inject(ProductRemoteService);

    publishProductEvent(channel, PRODUCT_EVENT_TYPES.CART_UPDATED, REMOTE_SOURCES.SHELL);

    expect(store.loadCartItemCount).not.toHaveBeenCalled();
    expect(store.setCartItemCount).not.toHaveBeenCalled();
  });

  it('handles non-mutating product events without touching shell state', () => {
    TestBed.inject(ProductRemoteService);

    publishProductEvent(channel, PRODUCT_EVENT_TYPES.REMOTE_READY);
    publishProductEvent(channel, 'unexpected-event');

    expect(store.loadCartItemCount).not.toHaveBeenCalled();
    expect(store.setCartItemCount).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalled();
  });

  it('publishes shell-to-product commands with shell metadata', () => {
    const service = TestBed.inject(ProductRemoteService);
    const publishedEvents: ProductChannelEvent[] = [];
    channel.events$.subscribe((event) => publishedEvents.push(event));

    service.sendLoadProduct();
    service.sendClearSelection();
    service.sendFilterByCategory();

    expect(publishedEvents).toEqual([
      expect.objectContaining({ source: REMOTE_SOURCES.SHELL, type: PRODUCT_EVENT_TYPES.LOAD_PRODUCT }),
      expect.objectContaining({ source: REMOTE_SOURCES.SHELL, type: PRODUCT_EVENT_TYPES.CLEAR_SELECTION }),
      expect.objectContaining({ source: REMOTE_SOURCES.SHELL, type: PRODUCT_EVENT_TYPES.FILTER_BY_CATEGORY }),
    ]);
  });
});
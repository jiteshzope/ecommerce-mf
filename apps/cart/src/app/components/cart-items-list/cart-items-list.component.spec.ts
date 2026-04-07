import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { CartItemsListComponent } from './cart-items-list.component';
import { CartStore } from '../../stores/cart.store';

describe('CartItemsListComponent', () => {
  const configureTestingModule = async () => {
    const store = {
      data: vi.fn(() => [
        {
          id: 1,
          productId: 7,
          title: 'Desk Lamp',
          url: '/lamp.png',
          quantity: 2,
          price: 49.99,
          lineTotal: 99.98,
        },
      ]),
      loading: vi.fn(() => false),
      error: vi.fn(() => null),
      empty: vi.fn(() => false),
      initialize: vi.fn(),
      loadData: vi.fn(),
      clearError: vi.fn(),
      increaseItemQuantity: vi.fn().mockResolvedValue(undefined),
      decreaseItemQuantity: vi.fn().mockResolvedValue(undefined),
      isItemMutating: vi.fn(() => false),
    };

    await TestBed.configureTestingModule({
      imports: [CartItemsListComponent],
      providers: [provideRouter([]), { provide: CartStore, useValue: store }],
    }).compileComponents();

    return { store };
  };

  it('initializes the cart store on first render', async () => {
    const { store } = await configureTestingModule();
    const fixture = TestBed.createComponent(CartItemsListComponent);

    fixture.detectChanges();

    expect(store.initialize).toHaveBeenCalledTimes(1);
    expect(fixture.nativeElement.textContent).toContain('Your Cart');
  });

  it('delegates quantity actions and refresh actions to the store', async () => {
    const { store } = await configureTestingModule();
    const fixture = TestBed.createComponent(CartItemsListComponent);

    fixture.detectChanges();
    const refreshButton = fixture.debugElement.query(By.css('.cart-actions button'));
    refreshButton.nativeElement.click();

    const quantityButtons = fixture.debugElement.queryAll(By.css('.quantity-controls button'));
    quantityButtons[0].nativeElement.click();
    quantityButtons[1].nativeElement.click();

    expect(store.loadData).toHaveBeenCalledTimes(1);
    expect(store.decreaseItemQuantity).toHaveBeenCalledWith(7);
    expect(store.increaseItemQuantity).toHaveBeenCalledWith(7);
    expect(fixture.nativeElement.textContent).toContain('Desk Lamp');
  });
});
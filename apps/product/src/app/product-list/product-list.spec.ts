import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { ProductList } from './product-list';
import { ProductStore } from '../stores/product.store';

describe('ProductList', () => {
  const configureTestingModule = async () => {
    const products = [
      { id: 1, title: 'Desk Lamp', url: '/lamp.png', price: 49.99 },
      { id: 2, title: 'Notebook', url: '/notebook.png', price: 9.99 },
    ];

    const store = {
      products: vi.fn(() => products),
      selectedProduct: vi.fn(() => null),
      listLoading: vi.fn(() => false),
      detailsLoading: vi.fn(() => false),
      addToCartError: vi.fn(() => null),
      listError: vi.fn(() => null),
      empty: vi.fn(() => false),
      cartQuantities: vi.fn(() => ({ 1: 2 })),
      clearSelectedProduct: vi.fn(),
      loadProducts: vi.fn().mockResolvedValue(undefined),
      increaseItemQuantity: vi.fn().mockResolvedValue(null),
      decreaseItemQuantity: vi.fn().mockResolvedValue(null),
      clearAddToCartError: vi.fn(),
      clearListError: vi.fn(),
      isAddToCartLoading: vi.fn(() => false),
      getItemQuantity: vi.fn((id: string) => (id === '1' ? 2 : 0)),
    };

    await TestBed.configureTestingModule({
      imports: [ProductList],
      providers: [provideRouter([]), { provide: ProductStore, useValue: store }],
    }).compileComponents();

    return { store };
  };

  it('clears selection and loads products on init', async () => {
    const { store } = await configureTestingModule();
    const fixture = TestBed.createComponent(ProductList);

    fixture.detectChanges();

    expect(store.clearSelectedProduct).toHaveBeenCalledTimes(1);
    expect(store.loadProducts).toHaveBeenCalledTimes(1);
    expect(fixture.nativeElement.textContent).toContain('Shop The Catalog');
  });

  it('wires quantity actions to the store and shows in-cart state', async () => {
    const { store } = await configureTestingModule();
    const fixture = TestBed.createComponent(ProductList);

    fixture.detectChanges();

    const buttons = fixture.debugElement.queryAll(By.css('.quantity-controls button'));
    buttons[0].nativeElement.click();
    buttons[1].nativeElement.click();

    expect(store.decreaseItemQuantity).toHaveBeenCalledWith('1', 1);
    expect(store.increaseItemQuantity).toHaveBeenCalledWith('1', 1);
    expect(fixture.nativeElement.textContent).toContain('In cart: 2');
  });
});
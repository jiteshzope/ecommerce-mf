import { TestBed } from '@angular/core/testing';
import { convertToParamMap, provideRouter } from '@angular/router';
import { Subject } from 'rxjs';
import { ProductDetails } from './product-details';
import { ProductStore } from '../stores/product.store';

describe('ProductDetails', () => {
  const configureTestingModule = async () => {
    const paramMap$ = new Subject<ReturnType<typeof convertToParamMap>>();
    const store = {
      selectedProduct: vi.fn(() => ({
        id: 7,
        title: 'Desk Lamp',
        url: '/lamp.png',
        price: 49.99,
        description: 'Warm ambient lamp',
      })),
      detailsLoading: vi.fn(() => false),
      detailsError: vi.fn(() => null),
      addToCartError: vi.fn(() => null),
      clearAddToCartError: vi.fn(),
      clearDetailsError: vi.fn(),
      loadProductDetails: vi.fn().mockResolvedValue(undefined),
      increaseItemQuantity: vi.fn().mockResolvedValue(null),
      decreaseItemQuantity: vi.fn().mockResolvedValue(null),
      isAddToCartLoading: vi.fn(() => false),
      getItemQuantity: vi.fn(() => 2),
    };

    await TestBed.configureTestingModule({
      imports: [ProductDetails],
      providers: [
        provideRouter([]),
        { provide: ProductStore, useValue: store },
      ],
    })
      .overrideProvider((await import('@angular/router')).ActivatedRoute, {
        useValue: { paramMap: paramMap$.asObservable() },
      })
      .compileComponents();

    return { store, paramMap$ };
  };

  it('loads details when the route id changes and ignores duplicates', async () => {
    const { store, paramMap$ } = await configureTestingModule();
    const fixture = TestBed.createComponent(ProductDetails);

    fixture.detectChanges();
    paramMap$.next(convertToParamMap({ id: '7' }));
    paramMap$.next(convertToParamMap({ id: '7' }));
    paramMap$.next(convertToParamMap({ id: '9' }));

    expect(store.loadProductDetails).toHaveBeenNthCalledWith(1, '7');
    expect(store.loadProductDetails).toHaveBeenNthCalledWith(2, '9');
    expect(store.loadProductDetails).toHaveBeenCalledTimes(2);

    paramMap$.complete();
  });

  it('wires quantity actions and retry to the selected product id', async () => {
    const { store, paramMap$ } = await configureTestingModule();
    const fixture = TestBed.createComponent(ProductDetails);

    fixture.detectChanges();
    paramMap$.next(convertToParamMap({ id: '7' }));

    await fixture.componentInstance.onDecreaseQuantity();
    await fixture.componentInstance.onIncreaseQuantity();
    fixture.componentInstance.onRetryDetails();

    expect(store.decreaseItemQuantity).toHaveBeenCalledWith('7', 1);
    expect(store.increaseItemQuantity).toHaveBeenCalledWith('7', 1);
    expect(store.loadProductDetails).toHaveBeenLastCalledWith('7');
    expect(fixture.nativeElement.textContent).toContain('Desk Lamp');

    paramMap$.complete();
  });
});
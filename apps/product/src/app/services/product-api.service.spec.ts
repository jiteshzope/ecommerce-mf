import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { ProductApiService } from './product-api.service';

describe('ProductApiService', () => {
  let service: ProductApiService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProductApiService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ProductApiService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('requests the catalog list', () => {
    service.getProducts().subscribe();

    const request = httpTesting.expectOne(`${environment.ecommerceApiBaseUrl}/catalog/products`);
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('requests product details by id', () => {
    service.getProductById('7').subscribe();

    const request = httpTesting.expectOne(`${environment.ecommerceApiBaseUrl}/catalog/products/7`);
    expect(request.request.method).toBe('GET');
    request.flush({});
  });

  it('requests the cart summary', () => {
    service.getCartItems().subscribe();

    const request = httpTesting.expectOne(`${environment.ecommerceApiBaseUrl}/cart`);
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('posts add-to-cart requests', () => {
    service.addToCart({ productId: '7', quantity: 2 }).subscribe();

    const request = httpTesting.expectOne(`${environment.ecommerceApiBaseUrl}/cart/items`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ productId: '7', quantity: 2 });
    request.flush({});
  });

  it('posts remove-from-cart requests', () => {
    service.removeFromCart({ productId: '7', quantity: 1 }).subscribe();

    const request = httpTesting.expectOne(`${environment.ecommerceApiBaseUrl}/cart/items/remove`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ productId: '7', quantity: 1 });
    request.flush({});
  });
});
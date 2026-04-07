import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { CartApiService } from './cart-api.service';

describe('CartApiService', () => {
  let service: CartApiService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CartApiService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(CartApiService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('requests cart items', () => {
    service.getCartItems().subscribe();

    const request = httpTesting.expectOne(`${environment.ecommerceApiBaseUrl}/cart`);
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('posts add-item requests', () => {
    service.addCartItem({ productId: 7, quantity: 1 }).subscribe();

    const request = httpTesting.expectOne(`${environment.ecommerceApiBaseUrl}/cart/items`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ productId: 7, quantity: 1 });
    request.flush({});
  });

  it('posts remove-item requests', () => {
    service.removeCartItem({ productId: 7, quantity: 1 }).subscribe();

    const request = httpTesting.expectOne(`${environment.ecommerceApiBaseUrl}/cart/items/remove`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ productId: 7, quantity: 1 });
    request.flush({});
  });
});
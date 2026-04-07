import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { ShellApiService } from './shell-api.service';

describe('ShellApiService', () => {
  let service: ShellApiService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ShellApiService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ShellApiService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('returns the cart item count derived from the API response length', () => {
    let result = -1;

    service.getCartItemCount().subscribe((count) => {
      result = count;
    });

    const request = httpTesting.expectOne(`${environment.ecommerceApiBaseUrl}/cart`);
    expect(request.request.method).toBe('GET');
    request.flush([{ id: 1 }, { id: 2 }, { id: 3 }]);

    expect(result).toBe(3);
  });
});
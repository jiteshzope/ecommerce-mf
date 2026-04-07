import { TestBed } from '@angular/core/testing';
import { Router, UrlTree, provideRouter } from '@angular/router';
import { cartAuthGuard } from './cart-auth.guard';
import { ShellStore } from '../stores/shell.store';

describe('cartAuthGuard', () => {
  it('allows access for authenticated users', () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: ShellStore, useValue: { isAuthenticated: () => true } }],
    });

    const result = TestBed.runInInjectionContext(() => cartAuthGuard());

    expect(result).toBe(true);
  });

  it('redirects guests to the product page', () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: ShellStore, useValue: { isAuthenticated: () => false } }],
    });

    const router = TestBed.inject(Router);
    const result = TestBed.runInInjectionContext(() => cartAuthGuard()) as UrlTree;

    expect(router.serializeUrl(result)).toBe('/product');
  });
});
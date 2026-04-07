import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { ShellHeaderComponent } from './shell-header.component';
import { CartRemoteService } from '../../services/cart-remote.service';
import { ShellStore } from '../../stores/shell.store';

describe('ShellHeaderComponent', () => {
  const configureTestingModule = async (isAuthenticated: boolean) => {
    const store = {
      isAuthenticated: vi.fn(() => isAuthenticated),
      cartItemCount: vi.fn(() => 3),
      user: vi.fn(() =>
        isAuthenticated
          ? {
              id: 'user-1',
              name: 'Taylor',
              email: 'taylor@example.com',
              phoneNumber: '1234567890',
              roles: ['customer'],
            }
          : null,
      ),
      goToLogin: vi.fn(),
      goToRegister: vi.fn(),
      logout: vi.fn(),
    };

    const cartRemote = {
      sendClearCart: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ShellHeaderComponent],
      providers: [
        provideRouter([]),
        { provide: ShellStore, useValue: store },
        { provide: CartRemoteService, useValue: cartRemote },
      ],
    }).compileComponents();

    return { store, cartRemote };
  };

  it('renders login and register actions for guests', async () => {
    const { store } = await configureTestingModule(false);
    const fixture = TestBed.createComponent(ShellHeaderComponent);

    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Ecommerce Shell');
    expect(text).toContain('Login');
    expect(text).toContain('Register');
    expect(text).not.toContain('taylor@example.com');

    const buttons = fixture.debugElement.queryAll(By.css('button'));
    buttons[0].nativeElement.click();
    buttons[1].nativeElement.click();

    expect(store.goToLogin).toHaveBeenCalledTimes(1);
    expect(store.goToRegister).toHaveBeenCalledTimes(1);
  });

  it('renders authenticated user details and clears cart before logout', async () => {
    const { store, cartRemote } = await configureTestingModule(true);
    const fixture = TestBed.createComponent(ShellHeaderComponent);

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.cart-badge')?.textContent).toContain('3');
    expect(compiled.textContent).toContain('Taylor');
    expect(compiled.textContent).toContain('taylor@example.com');

    const logoutButton = fixture.debugElement.query(By.css('button'));
    logoutButton.nativeElement.click();

    expect(cartRemote.sendClearCart).toHaveBeenCalledTimes(1);
    expect(store.logout).toHaveBeenCalledTimes(1);
  });
});
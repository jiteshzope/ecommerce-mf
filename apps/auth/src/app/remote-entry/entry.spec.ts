import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RemoteEntry } from './entry';
import { AuthStore } from '../stores/auth.store';

describe('RemoteEntry', () => {
  it('creates the component and initializes the auth store on render', async () => {
    const store = {
      initialize: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [RemoteEntry],
      providers: [provideRouter([]), { provide: AuthStore, useValue: store }],
    }).compileComponents();

    const fixture = TestBed.createComponent(RemoteEntry);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
    expect(store.initialize).toHaveBeenCalledTimes(1);
    expect(fixture.nativeElement.textContent).toContain('Authentication');
  });
});
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RemoteEntry } from './entry';

describe('RemoteEntry', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RemoteEntry],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('creates the cart remote entry and renders the cart list host', () => {
    const fixture = TestBed.createComponent(RemoteEntry);

    expect(fixture.componentInstance).toBeDefined();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Your Cart');
  });
});

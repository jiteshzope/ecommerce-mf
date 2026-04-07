import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RemoteEntry } from './entry';
import { ProductStore } from '../stores/product.store';

describe('RemoteEntry', () => {
    const configureTestingModule = async () => {
        const store = {
            initialize: vi.fn(),
        };

        await TestBed.configureTestingModule({
            imports: [RemoteEntry],
            providers: [provideRouter([]), { provide: ProductStore, useValue: store }],
        }).compileComponents();

        return { store };
    };

    it('creates the component and initializes the store on first render', async () => {
        const { store } = await configureTestingModule();
        const fixture = TestBed.createComponent(RemoteEntry);

        fixture.detectChanges();

        expect(fixture.componentInstance).toBeTruthy();
        expect(store.initialize).toHaveBeenCalledTimes(1);
        expect(fixture.nativeElement.querySelector('h2')?.textContent).toContain('Product Remote');
    });

    it('refreshes the store when the refresh button is clicked', async () => {
        const { store } = await configureTestingModule();
        const fixture = TestBed.createComponent(RemoteEntry);

        fixture.detectChanges();
        fixture.nativeElement.querySelector('button')?.click();

        expect(store.initialize).toHaveBeenCalledTimes(2);
    });
});
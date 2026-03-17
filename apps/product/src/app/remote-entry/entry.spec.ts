import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RemoteEntry } from './entry';

describe('RemoteEntry', () => {
    let component: RemoteEntry;
    let fixture: ComponentFixture<RemoteEntry>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RemoteEntry],
        }).compileComponents();

        fixture = TestBed.createComponent(RemoteEntry);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should render product remote heading', () => {
        fixture.detectChanges();
        const heading = fixture.nativeElement.querySelector('h2');
        expect(heading?.textContent).toContain('Product Remote');
    });

    it('should render refresh button', () => {
        fixture.detectChanges();
        const button = fixture.nativeElement.querySelector('button');
        expect(button?.textContent).toContain('Refresh Product Data');
    });

    it('should compile without errors', () => {
        expect(fixture.componentInstance).toBeDefined();
    });
});
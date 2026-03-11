import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RemoteEntry } from './entry';
import { NxWelcome } from './nx-welcome';

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

    it('should render NxWelcome component', () => {
        fixture.detectChanges();
        const welcomeElement = fixture.nativeElement.querySelector('app-nx-welcome');
        expect(welcomeElement).toBeTruthy();
    });

    it('should import NxWelcome component', () => {
        fixture.detectChanges();
        const welcomeElement = fixture.nativeElement.querySelector('app-nx-welcome');
        expect(welcomeElement).toBeTruthy();
    });

    it('should compile without errors', () => {
        expect(fixture.componentInstance).toBeDefined();
    });
});
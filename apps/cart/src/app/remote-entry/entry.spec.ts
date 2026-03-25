import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RemoteEntry } from './entry';

describe('RemoteEntry', () => {
  let component: RemoteEntry;
  let fixture: ComponentFixture<RemoteEntry>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RemoteEntry],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(RemoteEntry);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compile without errors', () => {
    expect(fixture.componentInstance).toBeDefined();
  });
});

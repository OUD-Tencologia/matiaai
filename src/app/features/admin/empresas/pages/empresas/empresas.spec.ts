import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { EmpresasComponent } from './empresas';

describe('EmpresasComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpresasComponent],
      providers: [provideHttpClient()]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(EmpresasComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

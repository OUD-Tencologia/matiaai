import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { ForgotPassword } from './forgot-password';

describe('ForgotPassword', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForgotPassword],
      providers: [provideHttpClient(), MessageService]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ForgotPassword);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

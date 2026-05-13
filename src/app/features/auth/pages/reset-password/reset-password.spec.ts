import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ResetPassword } from './reset-password';

describe('ResetPassword', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResetPassword],
      providers: [provideHttpClient(), provideRouter([]), MessageService]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ResetPassword);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

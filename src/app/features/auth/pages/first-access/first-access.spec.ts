import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { FirstAccess } from './first-access';

describe('FirstAccess', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FirstAccess],
      providers: [provideHttpClient(), MessageService]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(FirstAccess);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

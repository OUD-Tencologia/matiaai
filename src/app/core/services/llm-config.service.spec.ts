import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { LlmConfigService } from './llm-config.service';

describe('LlmConfigService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()]
    });
  });

  it('should be created', () => {
    const service = TestBed.inject(LlmConfigService);
    expect(service).toBeTruthy();
  });
});

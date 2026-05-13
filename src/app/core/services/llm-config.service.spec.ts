import { TestBed } from '@angular/core/testing';

import { LlmConfigService } from './llm-config.service';

describe('LlmConfigService', () => {
  let service: LlmConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LlmConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

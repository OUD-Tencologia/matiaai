import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { ChatService } from './chat-service';

describe('ChatService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()]
    });
  });

  it('should be created', () => {
    const service = TestBed.inject(ChatService);
    expect(service).toBeTruthy();
  });
});

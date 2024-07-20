import { TestBed } from '@angular/core/testing';

import { AutoLocateService } from './auto-locate.service';

describe('AutoLocateService', () => {
  let service: AutoLocateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AutoLocateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

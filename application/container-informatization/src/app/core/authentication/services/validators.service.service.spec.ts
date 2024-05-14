import { TestBed } from '@angular/core/testing';

import { ValidatorsServiceService } from './validators.service.service';

describe('ValidatorsServiceService', () => {
  let service: ValidatorsServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ValidatorsServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

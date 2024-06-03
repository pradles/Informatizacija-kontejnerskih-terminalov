import { TestBed } from '@angular/core/testing';

import { StorageFormService } from './storage-form.service';

describe('StorageFormService', () => {
  let service: StorageFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StorageFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

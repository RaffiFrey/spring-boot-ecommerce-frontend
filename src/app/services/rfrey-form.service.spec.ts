import { TestBed } from '@angular/core/testing';

import { RfreyFormService } from './rfrey-form.service';

describe('RfreyFormService', () => {
  let service: RfreyFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RfreyFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

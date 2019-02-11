import { TestBed, inject } from '@angular/core/testing';

import { JobofferService } from './joboffer.service';

describe('JobofferService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [JobofferService]
    });
  });

  it('should be created', inject([JobofferService], (service: JobofferService) => {
    expect(service).toBeTruthy();
  }));
});

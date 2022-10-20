import { TestBed } from '@angular/core/testing';

import { PredictTimeService } from './predict-time.service';

describe('PredictTimeService', () => {
  let service: PredictTimeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PredictTimeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

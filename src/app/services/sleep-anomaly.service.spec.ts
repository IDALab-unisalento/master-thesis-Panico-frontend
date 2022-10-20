import { TestBed } from '@angular/core/testing';

import { SleepAnomalyService } from './sleep-anomaly.service';

describe('SleepAnomalyService', () => {
  let service: SleepAnomalyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SleepAnomalyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { Train40Service } from './train40.service';

describe('Train40Service', () => {
  let service: Train40Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Train40Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

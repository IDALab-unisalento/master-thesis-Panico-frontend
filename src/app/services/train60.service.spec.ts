import { TestBed } from '@angular/core/testing';

import { Train60Service } from './train60.service';

describe('Train60Service', () => {
  let service: Train60Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Train60Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

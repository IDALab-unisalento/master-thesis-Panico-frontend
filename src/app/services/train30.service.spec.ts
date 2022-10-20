import { TestBed } from '@angular/core/testing';

import { Train30Service } from './train30.service';

describe('Train30Service', () => {
  let service: Train30Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Train30Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

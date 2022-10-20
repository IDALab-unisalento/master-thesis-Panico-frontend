import { TestBed } from '@angular/core/testing';

import { ConconiService } from './conconi.service';

describe('ConconiService', () => {
  let service: ConconiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConconiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

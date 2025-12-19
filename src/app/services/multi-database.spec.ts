import { TestBed } from '@angular/core/testing';

import { MultiDatabase } from './multi-database';

describe('MultiDatabase', () => {
  let service: MultiDatabase;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MultiDatabase);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

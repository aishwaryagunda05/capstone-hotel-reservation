import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { receptionGuard } from './reception-guard';

describe('receptionGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => receptionGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});

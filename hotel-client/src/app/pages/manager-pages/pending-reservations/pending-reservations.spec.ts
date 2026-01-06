import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingReservations } from './pending-reservations';

describe('PendingReservations', () => {
  let component: PendingReservations;
  let fixture: ComponentFixture<PendingReservations>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingReservations]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PendingReservations);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

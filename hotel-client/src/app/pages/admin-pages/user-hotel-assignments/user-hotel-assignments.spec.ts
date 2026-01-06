import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserHotelAssignmentsComponent } from './user-hotel-assignments';

describe('UserHotelAssignments', () => {
  let component: UserHotelAssignmentsComponent;
  let fixture: ComponentFixture<UserHotelAssignmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserHotelAssignmentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserHotelAssignmentsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

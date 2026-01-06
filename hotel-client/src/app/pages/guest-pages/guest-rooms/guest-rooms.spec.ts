import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuestRoomsComponent } from './guest-rooms';

describe('GuestRooms', () => {
  let component: GuestRoomsComponent;
  let fixture: ComponentFixture<GuestRoomsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuestRoomsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuestRoomsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

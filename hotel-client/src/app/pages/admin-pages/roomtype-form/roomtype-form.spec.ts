import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomTypeFormComponent } from './roomtype-form';

describe('RoomtypeForm', () => {
  let component: RoomTypeFormComponent;
  let fixture: ComponentFixture<RoomTypeFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomTypeFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomTypeFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

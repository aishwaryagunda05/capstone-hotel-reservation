import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuestHotelsComponent } from './guest-hotels';

describe('GuestHotels', () => {
  let component: GuestHotelsComponent;
  let fixture: ComponentFixture<GuestHotelsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuestHotelsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuestHotelsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

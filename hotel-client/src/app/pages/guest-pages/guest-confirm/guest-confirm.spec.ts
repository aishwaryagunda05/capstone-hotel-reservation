import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuestConfirmComponent } from './guest-confirm';

describe('GuestConfirm', () => {
  let component: GuestConfirmComponent;
  let fixture: ComponentFixture<GuestConfirmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuestConfirmComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuestConfirmComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

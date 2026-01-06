import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuestSearchComponent } from './guest-search';

describe('GuestSearch', () => {
  let component: GuestSearchComponent;
  let fixture: ComponentFixture<GuestSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuestSearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuestSearchComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

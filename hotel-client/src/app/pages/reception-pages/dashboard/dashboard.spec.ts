import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceptionDashboard } from './dashboard';

describe('Dashboard', () => {
  let component: ReceptionDashboard;
  let fixture: ComponentFixture<ReceptionDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceptionDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReceptionDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

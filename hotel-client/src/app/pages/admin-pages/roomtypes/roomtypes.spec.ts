import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Roomtypes } from './roomtypes';

describe('Roomtypes', () => {
  let component: Roomtypes;
  let fixture: ComponentFixture<Roomtypes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Roomtypes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Roomtypes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

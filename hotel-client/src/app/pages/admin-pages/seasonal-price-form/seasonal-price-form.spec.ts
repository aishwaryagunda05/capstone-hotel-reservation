import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeasonalPriceFormComponent } from './seasonal-price-form';

describe('SeasonalPriceForm', () => {
  let component: SeasonalPriceFormComponent;
  let fixture: ComponentFixture<SeasonalPriceFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeasonalPriceFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeasonalPriceFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeasonalPricesListComponent } from './seasonal-prices-list';

describe('SeasonalPricesList', () => {
  let component: SeasonalPricesListComponent;
  let fixture: ComponentFixture<SeasonalPricesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeasonalPricesListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeasonalPricesListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

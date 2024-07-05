import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarteiraCardComponent } from './carteira-card.component';

describe('CarteiraCardComponent', () => {
  let component: CarteiraCardComponent;
  let fixture: ComponentFixture<CarteiraCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarteiraCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarteiraCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AportesCarteiraCardComponent } from './aportes-carteira-card.component';

describe('AportesCarteiraCardComponent', () => {
  let component: AportesCarteiraCardComponent;
  let fixture: ComponentFixture<AportesCarteiraCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AportesCarteiraCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AportesCarteiraCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarteiraModalComponent } from './carteira-modal.component';

describe('CarteiraModalComponent', () => {
  let component: CarteiraModalComponent;
  let fixture: ComponentFixture<CarteiraModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarteiraModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarteiraModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

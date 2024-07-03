import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarteiraAtivoModalComponent } from './carteira-ativo-modal.component';

describe('CarteiraAtivoModalComponent', () => {
  let component: CarteiraAtivoModalComponent;
  let fixture: ComponentFixture<CarteiraAtivoModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarteiraAtivoModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarteiraAtivoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

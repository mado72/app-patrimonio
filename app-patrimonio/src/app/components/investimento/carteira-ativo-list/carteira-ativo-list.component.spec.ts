import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarteiraAtivoListComponent } from './carteira-ativo-list.component';

describe('CarteiraAtivoListComponent', () => {
  let component: CarteiraAtivoListComponent;
  let fixture: ComponentFixture<CarteiraAtivoListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarteiraAtivoListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarteiraAtivoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

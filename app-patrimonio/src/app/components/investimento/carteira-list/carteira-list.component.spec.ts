import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarteiraListComponent } from './carteira-list.component';

describe('CarteiraListComponent', () => {
  let component: CarteiraListComponent;
  let fixture: ComponentFixture<CarteiraListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarteiraListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarteiraListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

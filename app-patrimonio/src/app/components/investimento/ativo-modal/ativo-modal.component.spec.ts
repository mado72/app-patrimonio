import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AtivoModalComponent } from './ativo-modal.component';

describe('AtivoModalComponent', () => {
  let component: AtivoModalComponent;
  let fixture: ComponentFixture<AtivoModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AtivoModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AtivoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

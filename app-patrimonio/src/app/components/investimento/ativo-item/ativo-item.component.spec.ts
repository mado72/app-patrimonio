import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AtivoItemComponent } from './ativo-item.component';

describe('AtivoItemComponent', () => {
  let component: AtivoItemComponent;
  let fixture: ComponentFixture<AtivoItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AtivoItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AtivoItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

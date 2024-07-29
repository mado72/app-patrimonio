import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AportesFormComponent } from './aportes-form.component';

describe('AportesFormComponent', () => {
  let component: AportesFormComponent;
  let fixture: ComponentFixture<AportesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AportesFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AportesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

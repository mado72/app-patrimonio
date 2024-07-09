import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContaModalComponent } from './conta-modal.component';

describe('ContaModalComponent', () => {
  let component: ContaModalComponent;
  let fixture: ComponentFixture<ContaModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContaModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContaModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

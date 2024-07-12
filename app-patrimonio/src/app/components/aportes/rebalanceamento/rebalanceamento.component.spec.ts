import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RebalanceamentoComponent } from './rebalanceamento.component';

describe('RebalanceamentoComponent', () => {
  let component: RebalanceamentoComponent;
  let fixture: ComponentFixture<RebalanceamentoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RebalanceamentoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RebalanceamentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

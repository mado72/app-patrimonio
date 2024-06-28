import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProtifolioComponent } from './protifolio.component';

describe('ProtifolioComponent', () => {
  let component: ProtifolioComponent;
  let fixture: ComponentFixture<ProtifolioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProtifolioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProtifolioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

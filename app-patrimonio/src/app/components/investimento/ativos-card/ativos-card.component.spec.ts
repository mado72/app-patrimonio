import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AtivosCardComponent } from './ativos-card.component';

describe('AtivosCardComponent', () => {
  let component: AtivosCardComponent;
  let fixture: ComponentFixture<AtivosCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AtivosCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AtivosCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

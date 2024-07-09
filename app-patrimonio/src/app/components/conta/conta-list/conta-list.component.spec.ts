import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContaListComponent } from './conta-list.component';
import { CapitalizePipe } from 'src/app/util/capitalize.pipe';
import { AbsolutePipe } from 'src/app/util/absolute.pipe';

describe('ContaListComponent', () => {
  let component: ContaListComponent;
  let fixture: ComponentFixture<ContaListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ 
        ContaListComponent,
        CapitalizePipe,
        AbsolutePipe
      ],
      providers: [
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContaListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

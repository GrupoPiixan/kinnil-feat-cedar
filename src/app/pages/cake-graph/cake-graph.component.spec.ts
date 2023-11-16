import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CakeGraphComponent } from './cake-graph.component';

describe('CakeGraphComponent', () => {
  let component: CakeGraphComponent;
  let fixture: ComponentFixture<CakeGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CakeGraphComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CakeGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

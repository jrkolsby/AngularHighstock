import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OhlcGraphComponent } from './ohlc-graph.component';

describe('OhlcGraphComponent', () => {
  let component: OhlcGraphComponent;
  let fixture: ComponentFixture<OhlcGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OhlcGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OhlcGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

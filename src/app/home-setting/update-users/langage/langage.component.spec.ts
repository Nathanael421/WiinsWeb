import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LangageComponent } from './langage.component';

describe('LangageComponent', () => {
  let component: LangageComponent;
  let fixture: ComponentFixture<LangageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LangageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LangageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

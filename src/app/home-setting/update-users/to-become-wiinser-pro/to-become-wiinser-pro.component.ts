import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, skipWhile } from 'rxjs/operators';
import { ProfileModel } from 'src/app/core/models/baseUser/profile.model';
import { ProfileFeatureStoreSelectors, RootStoreState } from 'src/app/root-store';

@Component({
  selector: 'app-to-become-wiinser-pro',
  templateUrl: './to-become-wiinser-pro.component.html',
  styleUrls: ['./to-become-wiinser-pro.component.scss']
})
export class ToBecomeWiinserProComponent implements OnInit {

   // profile 
   myprofile$: Observable<ProfileModel>

   // nav
   placeSelected: string = 'menu'
 
   constructor(
     private store$: Store<RootStoreState.State>
   ) { }
 
   ngOnInit() {
 
     // to select my profile
     this.myprofile$ = this.store$.pipe(
       select(ProfileFeatureStoreSelectors.selectProfile),
       skipWhile(val => val === null),
       filter(profile => !!profile),
     )
 
   }
 
   selectPlace(place: string): void {
     this.placeSelected = place
   }
}

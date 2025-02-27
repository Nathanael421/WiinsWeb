import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { UserModel } from 'src/app/core/models/baseUser/user.model';
import { Store, select } from '@ngrx/store';
import { RootStoreState, MyUserStoreSelectors,ProfileFeatureStoreSelectors } from 'src/app/root-store';
import { skipWhile, filter } from 'rxjs/operators';
import { ProfileModel } from 'src/app/core/models/baseUser/profile.model';

@Component({
  selector: 'app-sidebar-setting',
  templateUrl: './sidebar-setting.component.html',
  styleUrls: ['./sidebar-setting.component.scss']
})

export class SidebarSettingComponent implements OnInit {

  // menu 
  menuItems = [
    { path: 'update-users', title: 'SIDEBAR-SETTING.User-Profile', icon: 'fa fa-user' },
    { path: 'update-password', title: 'SIDEBAR-SETTING.Password', icon: 'fa fa-lock' },
    { path: 'visibility', title: 'SIDEBAR-SETTING.Vibility', icon: 'fa fa-eye-slash' },
    { path: 'language', title: 'SIDEBAR-SETTING.Language', icon: 'fa fa-language' },
    // { path: 'notification', title: 'SIDEBAR-SETTING.Notification', icon: 'fa fa-bell-o' },
    { path: 'others', title: 'SIDEBAR-SETTING.Others', icon: 'fa fa-wrench' },
    { path: 'ledger', title: 'CORE.Ledger', icon: 'fa fa-credit-card' }
  ]

  // user
  user$: Observable<UserModel>

  // toggle
  public isCollapsed = false;

  // profile 
  myprofile$: Observable<ProfileModel>

  // nav
  placeSelected: string = 'menu'

  constructor(
    private store$: Store<RootStoreState.State>
  ) { }

  ngOnInit() {

    // to get the user
    this.user$ = this.store$.pipe(
      select(MyUserStoreSelectors.select),
      skipWhile((val: UserModel) => val === null),
      filter((value: UserModel) => value !== undefined),
    )

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

import { Component, OnInit } from '@angular/core'
import {  RootStoreState, ProfileFeatureStoreActions, ProfileFeatureStoreSelectors } from 'src/app/root-store'
import { Store, select } from '@ngrx/store'
import { BtnFollow} from 'src/app/core/models/baseUser/profile.model'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import * as _ from 'lodash'
import { MatSnackBar } from '@angular/material/snack-bar'
import { TranslateService } from '@ngx-translate/core'
import { Observable } from 'rxjs'
import { ProfileModel } from 'src/app/core/models/baseUser/profile.model'
import { filter, skipWhile } from 'rxjs/operators'
import { MatSlideToggleChange } from '@angular/material/slide-toggle'

@Component({
  selector: 'app-confidentiality',
  templateUrl: './confidentiality.component.html',
  styleUrls: ['./confidentiality.component.scss']
})
export class ConfidentialityComponent implements OnInit {

  // Get user & profil
  profile$: Observable<ProfileModel>;
  myprofile: Observable<ProfileModel>
  profile: ProfileModel
  pictureProfile: String

  // Send the form
  registerForm: FormGroup;

  // Expansion panel
  panelOpenState = false;

  // Slide
  postVisibleCommunity: boolean = true;
  onlineStatutCommunity: boolean = true;
  isFollow: boolean = true;
  isFollowing: boolean = true;
  blockedProfile: ProfileModel[] = [];
  closeFriend: ProfileModel[] = [];

  // Paginator
  totalLength: any;
  page: number = 1;
  page2: number = 1;


  constructor(
    private store$: Store<RootStoreState.State>,
    private formBuilder: FormBuilder,
    private _snackBar: MatSnackBar,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {

     // we initialise the form
     this.registerForm = this.formBuilder.group({
      pseudo: ['', [Validators.minLength(4), Validators.pattern(/^\S*$/)]],
      password: ['', Validators.required],
      email: ['', [Validators.email]],
      introduction: ['']
    })

    // to select the profile
    this.profile$ = this.store$.pipe(
      select(ProfileFeatureStoreSelectors.selectProfile),
      filter(profile => !!profile),
      skipWhile(profile => profile == null)
    )

    // get the profile
    this.myprofile = this.store$.pipe(
      select(ProfileFeatureStoreSelectors.selectProfile),
      skipWhile(val => val === null),
      filter(profile => !!profile)
    )
  }

public profilesBlocked  = [
  {
    id: 1,
    name: 'Ashley',
    date: '02/08/21',
    picture: 'https://images.unsplash.com/photo-1570752321219-41822a21a761?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=512&q=80',
    status: true
  },
  {
    id: 2,
    name: 'Tommy',
    date: '12/12/20',
    picture: 'https://images.unsplash.com/photo-1601234699404-4867fa71f87f?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=487&q=80',
    status: true
  },
  {
    id: 3,
    name: 'Melia',
    date: '07/05/19',
    picture: 'https://images.unsplash.com/photo-1479936343636-73cdc5aae0c3?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    status: true
  },
  {
    id: 4,
    name: 'Ellis',
    date: '31/09/17',
    picture: 'https://images.unsplash.com/photo-1484186304838-0bf1a8cff81c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    status: true
  },
  {
    id: 5,
    name: 'Danny',
    date: '29/04/15',
    picture: 'https://images.unsplash.com/photo-1599139497467-3e7f6e244c8a?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    status: true
  },
  {
    id: 6,
    name: 'Léa',
    date: '14/12/14',
    picture: 'https://images.unsplash.com/photo-1520635360276-79f3dbd809f6?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    status: true
  },
  {
    id: 7,
    name: 'Floyd',
    date: '25/09/13',
    picture: 'https://images.unsplash.com/photo-1618354817682-e00c42f36556?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    status: true
  },
  {
    id: 8,
    name: 'Alynne',
    date: '20/06/12',
    picture: 'https://images.unsplash.com/photo-1484186694682-a940e4b1a9f7?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    status: true
  }
];

public closeFriends  = [
  {
    id: 9,
    name: 'Sarah',
    date: '11/12/21',
    picture: 'https://images.unsplash.com/photo-1515463892140-58a22e37ff72?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=520&q=80',
    status: true
  },
  {
    id: 10,
    name: 'Thom',
    date: '07/05/20',
    picture: 'https://images.unsplash.com/photo-1541260894924-7ff059b93d54?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=375&q=80',
    status: true
  },
  {
    id: 11,
    name: 'Anna',
    date: '02/11/19',
    picture: 'https://images.unsplash.com/photo-1565294124524-200bb738cdb7?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=494&q=80',
    status: true
  },
  {
    id: 12,
    name: 'Eric',
    date: '29/01/17',
    picture: 'https://images.unsplash.com/photo-1566802842272-e694af42eb29?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=455&q=80',
    status: true
  },
  {
    id: 13,
    name: 'Darius',
    date: '30/04/15',
    picture: 'https://images.unsplash.com/photo-1608457074760-f67c9edf1bb0?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    status: true
  },
  {
    id: 14,
    name: 'Léa',
    date: '14/12/14',
    picture: 'https://images.unsplash.com/photo-1520635360276-79f3dbd809f6?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    status: true
  },
  {
    id: 15,
    name: 'Floyd',
    date: '25/09/13',
    picture: 'https://images.unsplash.com/photo-1618354817682-e00c42f36556?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    status: true
  },
  {
    id: 16,
    name: 'Alynne',
    date: '20/06/12',
    picture: 'https://images.unsplash.com/photo-1484186694682-a940e4b1a9f7?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    status: true
  }
];


changeFriendOption(value: boolean) {
  // change the visibility button for the friends
  this.store$.dispatch(new ProfileFeatureStoreActions.ChangeBtnFollow(new BtnFollow(value, undefined)))
}

changeViewverOption(value: boolean) {
  // change the visibility button for the followers
  this.store$.dispatch(new ProfileFeatureStoreActions.ChangeBtnFollow(new BtnFollow(undefined, value)))
}

// toggleClose(): void {
//   this.closeFriend = !this.closeFriend;
// }

toggleVisible(): void {
  this.postVisibleCommunity = !this.postVisibleCommunity;
}

toggleOnline(): void {
  this.onlineStatutCommunity = !this.onlineStatutCommunity;
}

// Check Toggle before Submit (Blocked)
blockedToggle(event: MatSlideToggleChange, profile: ProfileModel): void {
  if (event.checked === true) {
    this.blockedProfile.push(profile)
  } else {
    const found = this.blockedProfile.map((x: ProfileModel) => x._id).indexOf(profile._id)
    if (found !== -1) {
      this.blockedProfile.splice(found, 1)
    }
  }
  console.log(event);
}


// Check Toggle before Submit (Close Friend)
closeFriendToggle(event: MatSlideToggleChange, profile: ProfileModel): void {

  if (event.checked === true) {
    this.closeFriend.push(profile)
  } else {
    const found = this.closeFriend.map((x: ProfileModel) => x._id).indexOf(profile._id)
    if (found !== -1) {
      this.closeFriend.splice(found, 1)
    }
  }
  console.log(this.closeFriend);
}





}

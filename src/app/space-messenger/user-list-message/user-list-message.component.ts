import { Component, OnInit } from '@angular/core'
import { Store, select } from '@ngrx/store'
import { RootStoreState, ProfileListStoreActions,ProfileListStoreSelectors, AllRoomsStoreActions, AllRoomsStoreSelectors, FullRoomByIdStoreActions, SearchProfileStoreActions, SearchProfileStoreSelectors, FullRoomByIdStoreSelectors } from 'src/app/root-store'
import { Observable, combineLatest } from 'rxjs'
import { Room } from 'src/app/core/models/messenger/room.model'
import { skipWhile, filter, debounceTime, distinctUntilChanged, map } from 'rxjs/operators'
import { StatePlarformService } from 'src/app/core/statePlarform/state-plarform.service'
import { FormControl } from '@angular/forms'
import { ProfileModel } from 'src/app/core/models/baseUser/profile.model'
import { TranslationService } from 'src/app/core/services/translation/translation.service'
import { PageModel } from 'src/app/core/models/page/page.model'

@Component({
  selector: 'app-user-list-message',
  templateUrl: './user-list-message.component.html',
  styleUrls: ['./user-list-message.component.scss']
})

export class UserListMessageComponent implements OnInit {
  // search bar
  searchField: FormControl;
  resultsProfile$: Observable<ProfileModel[]>;

  // room
  room$: Observable<Room[]>
  roomSelected$: Observable<Room>

  //Panel Expansion
  panelProfile: boolean = true;
  panelDiscuss: boolean = true;
  panelOpenState: boolean = false;

  // profiles or pages
  profiles$: Observable<ProfileModel[]|PageModel[]>
  error$: Observable<any>
  loading$: Observable<boolean>

  // type
  typeOfCommunity: string = 'friends'

  //Ready Disabled
  nobodySelected: boolean = true;

  constructor(
    private store$: Store<RootStoreState.State>,
    private stateP: StatePlarformService,
    public translateService: TranslationService
  ) { }

  ngOnInit() {

    // get list of my friends
    this.store$.dispatch(new ProfileListStoreActions.GetProfileList(this.typeOfCommunity, 1))

    // to select list of profiles
    this.profiles$ = this.store$.pipe(
      select(ProfileListStoreSelectors.selectAllItems),
      filter(value => value !== undefined),
    )

    // to set the search bar
    this.searchField = new FormControl();
    this.searchField.valueChanges.pipe(debounceTime(200), distinctUntilChanged());

        // to listen the search bar
    this.searchField.valueChanges
      .pipe(
        filter(value => value !== undefined || value !== ''),
        filter(value => value.length > 3),
        debounceTime(200),
        distinctUntilChanged()
      ).subscribe(val => {
        this.store$.dispatch(new SearchProfileStoreActions.SearchFriends(val, 'mainChat'))
      });

      // to see all the profile 
    this.resultsProfile$ = this.resultsProfile$ = combineLatest(
      this.store$.pipe(select(SearchProfileStoreSelectors.selectSearchResults)),
      this.store$.pipe(select(SearchProfileStoreSelectors.selectSpot)),
    ).pipe(skipWhile(val => val[1] !== 'mainChat'), map(x => x[0]))

    // to load the room
    this.store$.dispatch(new AllRoomsStoreActions.loadAllRoomsByPage(1))

    // to select all the room
    this.room$ = this.store$.pipe(
      select(AllRoomsStoreSelectors.selectAllRooms),
      skipWhile(val => val.length == 0),
      filter(value => value !== undefined)
    )

    // oto select the room clicked
    this.roomSelected$ = this.store$.pipe(
      select(FullRoomByIdStoreSelectors.select),
      filter(data => !!data),
      skipWhile(val => val === null),
    )

  }

  selectRoom(index: number, roomId: string) {
    // to select a room
    this.store$.dispatch(new FullRoomByIdStoreActions.loadRoomById(roomId, 1, null))
    this.stateP.changeState({ main_roomActif: roomId });
  }

  getRoom(profile: ProfileModel){
    // to load a room with the profile
    this.store$.dispatch(new FullRoomByIdStoreActions.loadRoomByIdProfile(profile))
    this.searchField.setValue('')
  }

  hideOrShowUser() {
    this.panelProfile = !this.panelProfile;
  }
  hideOrShowDiscuss() {
    this.panelDiscuss = !this.panelDiscuss;
  }

  selectThisFriend(index: number) {
    this.nobodySelected = !this.nobodySelected;
    console.log(index);
    
  }

}

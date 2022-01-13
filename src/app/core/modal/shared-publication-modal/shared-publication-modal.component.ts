import { Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, skipWhile } from 'rxjs/operators';
import { AllRoomsStoreActions, CurrentRoomStoreActions, FeedPublicationStoreActions, RoomByIdStoreActions, RoomByIdStoreSelectors, RootStoreState, SearchProfileStoreActions, SearchProfileStoreSelectors } from 'src/app/root-store';
import { ProfileModel } from '../../models/baseUser/profile.model';
import { Room } from '../../models/messenger/room.model';
import { FeedPublication, PicturePublication, PostPublication, VideoPublication } from '../../models/publication/feed/feed-publication.model';

@Component({
  selector: 'app-shared-publication-modal',
  templateUrl: './shared-publication-modal.component.html',
  styleUrls: ['./shared-publication-modal.component.scss']
})
export class SharedPublicationModalComponent implements OnInit {

  // Add Friends
  searchField: FormControl;
  resultsProfile$: Observable<ProfileModel[]>;

  // Share Publication (Message Form)
  text: string;

  // Room
  room$: Observable<Room>
  infoRoom$: Observable<String>

  constructor(
    private store$: Store<RootStoreState.State>,
    private dialogRef: MatDialogRef<SharedPublicationModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { publication: PicturePublication | PostPublication | VideoPublication | any, ownerId: string },
    @Inject(MAT_DIALOG_DATA) public dataRoom: DataRoom,
  ) { }

  ngOnInit(): void {

    // to load the room by the room id
    this.store$.dispatch(new RoomByIdStoreActions.loadRoomById(this.dataRoom.currentRoom._id, 1, null))

    // to select the room
    this.room$ = this.store$.pipe(
      select(RoomByIdStoreSelectors.select),
      skipWhile(val => val === null),
      filter(val => val !== undefined),
    )

  // Search Friends Input
  this.searchField = new FormControl()
  this.searchField.valueChanges.pipe(debounceTime(200), distinctUntilChanged())

  // To Search Profil Friend
  this.searchField.valueChanges
    .pipe(
      filter(value => value !== undefined || value !== ''),
      filter(value => value.length > 3),
      debounceTime(200),
      distinctUntilChanged()
    ).subscribe(val => {
    this.store$.dispatch(new SearchProfileStoreActions.SearchProfile(val, 'feed_publication'))
  }) 

  // To select the profile
  this.resultsProfile$ = this.store$.pipe(
      select(SearchProfileStoreSelectors.selectSearchResults),
      skipWhile(val => val === null),
    )
    this.resultsProfile$.subscribe(console.log)
  }

  share(publication: FeedPublication,  roomID: string) {
  // Collect Publication ID
  console.log(this.data.publication);
    
  // Collect RoomID
  console.log();
  
    
  // Send
    this.store$.dispatch(new FeedPublicationStoreActions.ShareFeedPublication(publication, roomID))
    this.text = null
    return null
  }
}

interface DataRoom {
  cardHeader: ProfileModel[]
  currentRoom: Room
  myProfileID: string
  searching: boolean
}
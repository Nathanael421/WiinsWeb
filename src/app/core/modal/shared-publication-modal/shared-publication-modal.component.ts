import { Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, skipWhile, take } from 'rxjs/operators';
import { CurrentRoomStoreActions, CurrentRoomStoreSelectors, RoomByIdStoreActions, RoomByIdStoreSelectors, RootStoreState, SearchProfileStoreActions, SearchProfileStoreSelectors } from 'src/app/root-store';
import { ProfileModel } from '../../models/baseUser/profile.model';
import { MessageText } from '../../models/messenger/message.model';
import { Room } from '../../models/messenger/room.model';
import { PicturePublication, PostPublication, VideoPublication } from '../../models/publication/feed/feed-publication.model';

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
  room$: Observable<Room[]>;

  // Checked
  checked: boolean = false;

  constructor(
    private store$: Store<RootStoreState.State>,
    private dialogRef: MatDialogRef<SharedPublicationModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { publication: PicturePublication | PostPublication | VideoPublication | any, ownerId: string }
  ) {}

  ngOnInit(): void {

    // to select all the rooms
    this.room$ = this.store$.pipe(
      select(CurrentRoomStoreSelectors.selectCurrentRooms),
      skipWhile(val => val.length === 0),
      filter(value => value !== undefined)
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


  onChange(room: Room) {
      console.log(room);
  }

  send(roomID: string) {
    // Publication
    console.log(this.data.publication.file);
    // Room ID
    console.log(roomID);

    // To Construct The Message 
    const message = new MessageText('text', this.data.publication)

    switch (roomID) {
      // First Message in a New Group
      case 'undefined':
        return null
      // Create a New Discution
      case '':
      case null:
        return null
      // Juste a Respond
      default:
        this.store$.dispatch(new RoomByIdStoreActions.sendMessage(message, roomID))
        this.text = null
        return null
    }
  }

}
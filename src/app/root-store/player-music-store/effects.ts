import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import * as featureActions from './actions';
import { catchError, map } from 'rxjs/operators';
import { Observable, of as observableOf } from 'rxjs';
import { ActionsPlayerMusic } from './actions';

@Injectable()
export class PlayerMusicEffects {
  constructor(
    private actions$: Actions
  ) { }

  @Effect()
  play: Observable<ActionsPlayerMusic> = this.actions$.pipe(
    ofType<featureActions.Play>(featureActions.ActionTypes.PLAY),
    map(action => new featureActions.PlaySuccess(action.musicPlaying, action.musicList)),
    catchError(error => observableOf(new featureActions.PlayFail(error)))
  )

  @Effect()
  playfromlink: Observable<ActionsPlayerMusic> = this.actions$.pipe(
    ofType<featureActions.Play>(featureActions.ActionTypes.PLAY_FROM_LINK),
    map(action => new featureActions.PlaySuccess(action.musicPlaying, action.musicList)),
    catchError(error => observableOf(new featureActions.PlayFail(error)))
  )

  @Effect()
  pause: Observable<ActionsPlayerMusic> = this.actions$.pipe(
    ofType<featureActions.Pause>(featureActions.ActionTypes.PAUSE),
    map(() => new featureActions.PauseSuccess()),
    catchError(error => observableOf(new featureActions.PauseFail(error)))
  )
}

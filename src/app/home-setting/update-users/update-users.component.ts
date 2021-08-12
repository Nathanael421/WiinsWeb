import { ProfileFeatureStoreSelectors, RootStoreState, MyUserStoreActions, ProfileFeatureStoreActions } from 'src/app/root-store'
import { Store, select } from '@ngrx/store'
import { ProfileModel, BtnFollow } from '../../core/models/baseUser/profile.model'
import { Component, Input, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms'
import { filter, skipWhile } from 'rxjs/operators'
import { Observable } from 'rxjs'
import { environment } from 'src/environments/environment'
import { DatePipe } from '@angular/common'
import * as _ from 'lodash'
import { MatSnackBar } from '@angular/material/snack-bar'
import { TranslateService } from '@ngx-translate/core'
import { trigger, state, style, animate, transition } from '@angular/animations'
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-update-users',
  templateUrl: './update-users.component.html',
  styleUrls: ['./update-users.component.scss'],
})

export class UpdateUsersComponent implements OnInit {

  // Default
  baseUrl = environment.baseUrl;

  // Get user & profil
  profile$: Observable<ProfileModel>;
  myprofile: Observable<ProfileModel>
  profile: ProfileModel
  pictureProfile: String

  // Send the form
  registerForm: FormGroup;

  // Toggle collapse
  isCollapsed: boolean = false;
  isDisabled: boolean = true;

  // Password
  show: boolean = false;

  // NgbModal
  closeResult = '';


  constructor(
    private store$: Store<RootStoreState.State>,
    private formBuilder: FormBuilder,
    private _snackBar: MatSnackBar,
    private translate: TranslateService,
    private modalService: NgbModal
  ) { }

  ngOnInit() {

    // we initialise the form
    this.registerForm = this.formBuilder.group({
      pseudo: ['', [Validators.minLength(4), Validators.pattern(/^\S*$/)]],
      password: ['',[Validators.minLength(8), Validators.required]],
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

  udapteInfo() {

    // if the charactere are valid
    if (_.isEmpty(_.pickBy(this.registerForm.value, _.identity))) {
      return this._snackBar.open(
        this.translate.instant('ERROR-MESSAGE.No-changes-hv-been-made'),
        this.translate.instant('CORE.close'),
        {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 5000,
        }
      )
    }

    // if the form are valid
    if (!this.registerForm.valid) {
      return this._snackBar.open(
        this.translate.instant('ERROR-MESSAGE.Els-are-incorrects'),
        this.translate.instant('CORE.close'),
        {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 5000,
        }
      )
    }

    // send the update
    else this.store$.dispatch(new MyUserStoreActions.UpdateUser(_.pickBy(this.f.pseudo.value, _.identity)))
  }

  open(contentPseudo) {
    this.modalService.open(contentPseudo, {ariaLabelledBy: 'modal-basic-title', windowClass: '.backgroundModal'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  openM(contentMail) {
    this.modalService.open(contentMail, {ariaLabelledBy: 'modal-basic-title', windowClass: '.backgroundModal'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  openP(contentPassword) {
    this.modalService.open(contentPassword, {ariaLabelledBy: 'modal-basic-title', windowClass: '.backgroundModal'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  resetInfo() {
    // reset all the info
    this.registerForm.reset()
  }

  get f() { return this.registerForm.controls }


  editProfil() {
    this.isDisabled = !this.isDisabled;
    this.isCollapsed = !this.isCollapsed;
  }
}

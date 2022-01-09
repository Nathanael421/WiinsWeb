import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef } from '@angular/core'
import { Observable, Subscription } from 'rxjs'
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms'
import { environment } from 'src/environments/environment'
import { DomSanitizer } from '@angular/platform-browser'
import { RootStoreState, SearchProfileStoreActions, SearchProfileStoreSelectors, FeedPublicationStoreActions } from 'src/app/root-store'
import { ProfileFeatureStoreSelectors } from 'src/app/root-store'
import { filter, debounceTime, distinctUntilChanged, skipWhile } from 'rxjs/operators'
import { Store, select } from '@ngrx/store'
import { IconAnimation } from 'src/assets/route-animation/icon-animation'
import { ProfileModel } from '../../models/baseUser/profile.model'
import { FeedPublication, PostPublication, PicturePublication, VideoPublication } from '../../models/publication/feed/feed-publication.model'
import { TranslateService } from '@ngx-translate/core'
import { NgxImageCompressService } from 'ngx-image-compress'
import { UploadService, RespondGetUploadUrl, UrlSigned } from '../../services/upload/upload.service'
import * as uuid from 'uuid';
import { HttpEvent, HttpEventType } from '@angular/common/http'
import { UploadWithoutInjectorService } from '../../services/upload/upload-without-injector.service'
import { MatSnackBar, MatSnackBarRef, SimpleSnackBar } from '@angular/material/snack-bar'
import { state, style, trigger } from '@angular/animations'

@Component({
  selector: 'app-feed-publication',
  templateUrl: './feed-publication.component.html',
  styleUrls: ['./feed-publication.component.scss'],
  animations: [
    // Card Height
    trigger('cardState', [
      state('staticCard', style({
        position: 'relative',
        height: '80px',
        transition: 'all 1s'
      })),
      state('transitionCard', style({
        height: '560px',
        transition: 'all 1s'
      }))
    ]),
    // Image Cover
    trigger('coverState', [
      state('staticCover', style({
        height: '0',
        opacity: '0',
        transition: 'all 1s'
      })),
      state('transitionCover', style({
        height: '275px',
        opacity: '1',
        transition: 'all 1s'
      }))
    ]),
    // Svg on Cover
    trigger('svgState', [
      state('staticSvg', style({
        opacity: '0',
        transition: 'all 1s'
      })),
      state('transitionSvg', style({
        opacity: '1',
        transition: 'all 1s'
      }))
    ]),
    // Profile
    trigger('profileState', [
      state('staticProfile', style({
        height: '80px',
        top: '0',
        transition: 'all 1s'
      })),
      state('transitionProfile', style({
        height: '60px',
        transition: 'all 1s',
        top: '-1rem'
      }))
    ]),
     // Other Button
     trigger('otherBtnState', [
      state('staticOtherBtn', style({
        opacity: '0',
        transition: 'all 1s'
      })),
      state('transitionOtherBtn', style({
        opacity: '1',
        transition: 'all 1s'
      }))
    ]),
     // Input Comment
     trigger('commentState', [
      state('staticComment', style({
        opacity: '0',
        top: '-1rem',
      })),
      state('transitionComment', style({
        opacity: '1',
        top: '-1rem',
        transition: 'all 2s'
      }))
    ]),
    // Submit Button
    trigger('submitState', [
      state('staticSubmit', style({
        opacity: '0',
        bottom: '-1.5rem',
      })),
      state('transitionSubmit', style({
        opacity: '1',
        position: 'relative',
        bottom: '-1.5rem',
        transition: 'all 6s'
      }))
    ]),
  ]
})

export class FeedPublicationComponent implements OnInit, OnDestroy {
  //Card Before Animation
  cardBefore: string = 'staticCard';

  //Cover Before Animation
  coverBefore: string = 'staticCover';

  //Svg Before Animation
  svgBefore: string = 'staticSvg';

  //Profile Before Animation
  profileBefore: string = 'staticProfile';

  //Other Button Before Animation
  otherBtnBefore: string = 'staticOtherBtn';

  //Input Comment Before Animation
  inputBefore: string = 'staticComment';

  //Submit Button Before Animation
  submitBefore: string = 'staticSubmit';

  // Button Open Form (+)
  btnAdd: boolean = false;

  // Button Open Form Change (+) => (-)
  openCollapse: string = 'openForm';

  // If Img Added => Delete Choice Color
  imgUrlAdded: boolean = true;

  // Img Url is false by Default
  noPicture: boolean = false;

  // NgModel Comment on Footer Card
  comment: string = '';

  // Input
  @Input() space: string;

  // Get the profil
  myprofile: Observable<ProfileModel>;
  profile: ProfileModel;
  pictureProfile: String;

  // DECLARATION LOGIC
  feedPublicationForm: FormGroup;
  publicationType: string;

  // DECLARATION ANIMATION
  logo_rotation = false;
  imageSrc: string;
  filePath: any;
  imgURL: any;
  imgPath: String;
  videoURL: any;
  videoPath: String;
  postervideo: any;
  postedposter = false;
  editedposter = false;

  // Mode of publication (Default zone or Video zone)
  activeZone = 'defaultZone';

  // Background-image of the publications
  choice1 = 'linear-gradient(to top,#014F7B,#7EDF2A)';
  choice2 = 'linear-gradient(to top,#D90A5F,#4230BA)';
  choice3 = 'linear-gradient(to top,#DACE2E,#F47B87,#A679B2)';
  choice4 = 'linear-gradient(to top,#515EDD,#2BB1D6)';
  choice5 = 'linear-gradient(to right top, #000000, #000000, #000000, #000000, #000000)';
  choice6 = 'linear-gradient(to top,#473609,#883C0F,#D81E4C)';
  defaultBackground = this.choice4;
  // defaultbackground = this.choice1;

  // Form extends for PostPublication
  background: string;
  text: string;
  publicationToSend: PostPublication;
  videoType: any;

  // Upload
  uploadVideo = 0;
  uploadPicture = 0;
  pictureUrl: string;
  videoUrl: string;
  uploadPictureSub: Subscription;
  uploadVideoSub: Subscription;

  // Add friend
  searchField: FormControl;
  resultsProfile$: Observable<ProfileModel[]>;
  friendTagged: ProfileModel[] = [];
  listProfilTagged: boolean;

  // Hastag
  hastagList: string[]
  @ViewChild('hastagContent', { static: false }) hastagContent: ElementRef;

  constructor(
    private store$: Store<RootStoreState.State>,
    private sanatizer: DomSanitizer,
    private formBuilder: FormBuilder,
    private _snackBar: MatSnackBar,
    private translate: TranslateService,
    private imageCompress: NgxImageCompressService,
    private uploadService: UploadService,
    private uploadService2: UploadWithoutInjectorService,
  ) { }

  // Get the form
  get f() { return this.feedPublicationForm.controls }

  ngOnInit(): void {

    // Get the profile
    this.myprofile = this.store$.pipe(
      select(ProfileFeatureStoreSelectors.selectProfile),
      skipWhile(val => val === null),
      filter(profile => !!profile)
    )

    // We initialize the form
    this.feedPublicationForm = this.formBuilder.group({})

    // Search friends input
    this.searchField = new FormControl()
    this.searchField.valueChanges.pipe(debounceTime(200), distinctUntilChanged())

    // To search the friends profile
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
  }

  // Method
  // Open the Publication Card (Animation State)
  collapseCard(): void {
    // Card Height
    if (this.cardBefore === 'staticCard') {
      this.cardBefore = 'transitionCard';
      this.openCollapse = 'closeForm';
      this.activeZone = 'defaultZone';
      this.background = this.choice4;
      this.imgUrlAdded = true;
      this.btnAdd = true;
    } else {
      this.cardBefore = 'staticCard';
      this.activeZone = 'defaultZone';
      this.openCollapse = 'openForm';
      this.imgURL = '';
      this.comment = '';
      this.btnAdd = false;
      this.noPicture = false;
      this.feedPublicationForm.reset();
      this.hastagList = [];
    }

    // Background Cover
    if (this.coverBefore === 'staticCover') {
      this.coverBefore = 'transitionCover';
    } else {
      this.coverBefore = 'staticCover';
      this.hastagList = [];
    }

    // Svg Image
    if (this.svgBefore === 'staticSvg') {
      this.svgBefore = 'transitionSvg';
    } else {
      this.svgBefore = 'staticSvg';
      this.hastagList = [];
    }

    // User Profile (avatar & pseudo)
    if (this.profileBefore === 'staticProfile') {
      this.profileBefore = 'transitionProfile';
    } else {
      this.profileBefore = 'staticProfile';
      this.hastagList = [];
    }

    // Hashtag Button & Info Button
    if (this.otherBtnBefore === 'staticOtherBtn') {
      this.otherBtnBefore = 'transitionOtherBtn';
    } else {
      this.otherBtnBefore = 'staticOtherBtn';
      this.hastagList = [];
    }

    // Input Comment
    if (this.inputBefore === 'staticComment') {
      this.inputBefore = 'transitionComment';
    } else {
      this.inputBefore = 'staticComment';
      this.hastagList = [];
    }

    // Submit Button
    if (this.submitBefore === 'staticSubmit') {
      this.submitBefore = 'transitionSubmit';
    } else {
      this.submitBefore = 'staticSubmit';
      this.hastagList = [];
    }
  }

  // Open the Picture or Video mode
  preview(files: any): void | MatSnackBarRef<SimpleSnackBar> {

    if (files.length === 0) return null

    if (files[0].size > 50000000) return this._snackBar.open(
      this.translate.instant('ERROR-MESSAGE.file-over-50mb'),
      this.translate.instant('CORE.close'),
      { horizontalPosition: 'center', verticalPosition: 'bottom', duration: 5000 }
    )

  // Get the file
    const reader = new FileReader()
    reader.onloadend = _event => {

      // Set to Picture mode
      if (files[0].type.match('image')) {
        this.imgURL = reader.result;
        this.imgPath = files[0].name;
        this.activeZone = 'defaultZone'
        this.publicationType = 'picture';
        this.imgUrlAdded = false;
        this.noPicture = true;
        this.updateForm(this.publicationType)
        this.uploadFileAndCompress(environment.link_feed_publication_image, files[0], reader.result)
      }

      // Set to Video mode
      if (files[0].type.match('video')) {
        const blob = new Blob([reader.result], { type: files[0].type })
        const url = URL.createObjectURL(blob)
        this.videoURL = this.sanatizer.bypassSecurityTrustResourceUrl(url)
        this.videoType = files[0].type
        this.videoPath = files[0].name
        this.activeZone = 'videozone'
        this.publicationType = 'video'
        this.updateForm(this.publicationType)
        this.uploadFile(environment.link_feed_publication_video, files[0], reader.result)
      }

    }

    // Read the file
    if (files[0].type.match('image')) reader.readAsDataURL(files[0])
    if (files[0].type.match('video')) {

      // Check the duration before the upload
      var video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src)

        // If it's inferior than 30
        if (video.duration > 31) {
          return this._snackBar.open(
            this.translate.instant('ERROR-MESSAGE.not-more-than-30-sec-in-this-space'),
            this.translate.instant('CORE.close'), {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 5000,
          })
        }
        // If it's superior than 30
        else {
          reader.readAsArrayBuffer(files[0])
        }
      }
      video.src = URL.createObjectURL(files[0]);
    }
  }

  // Add a poster for video
  previewposter(files: any): void | MatSnackBarRef<SimpleSnackBar> {
    if (files.length === 0) return null
  
    // Get the file
    const reader = new FileReader()
  
    // Compress the file
    reader.onloadend = _event => {
      this.postervideo = reader.result
      this.postedposter = true
      this.editedposter = true
      setTimeout(() => this.editedposter = false, 3000)
      this.uploadFileAndCompress(environment.link_feed_publication_poster, files[0], reader.result)
    }
  
    // Read the file
    reader.readAsDataURL(files[0])
  
  }

  // Change the color choice of the Background for the Post
  changebackground(backgroundchoice: string): void {
    this.background = backgroundchoice;
  }

  // Send the new publication
  createFeedPublication(): void {

    // Set to Post mode if Picture or Video was not set
    if (this.publicationType !== 'picture' && this.publicationType !== 'video' ) {
      this.publicationType = 'post';
      this.activeZone = 'defaultZone';
      this.background = this.defaultBackground;
      this.updateForm(this.publicationType);
  }

    console.log(this.publicationType);
    console.log(this.feedPublicationForm.value);
    

    // Build the publications
    const publication: FeedPublication = this.constructPublication()

    // Check if the publications is valid
    if (this.checkVerification(publication.type) == false) return null

    // Send the publications
    else this.sendPublication(publication)
  }

  // Choose type of card
  constructPublication(): FeedPublication {

    // Add the friends tagged
    let listIdTagged = null
    if (this.friendTagged.length !== 0) { listIdTagged = this.friendTagged.map(x => x._id) }
  
    // Construct the publications
    switch (this.publicationType) {
      case 'post': return new PostPublication(this.hastagList, listIdTagged, this.background, this.feedPublicationForm.get('text').value, 'profile')
      case 'picture': return new PicturePublication(this.hastagList, listIdTagged,this.feedPublicationForm.get('text').value, this.pictureUrl, 'profile')
      case 'video': return new VideoPublication(this.hastagList, listIdTagged, this.feedPublicationForm.get('text').value, this.videoUrl, this.pictureUrl, 'profile')
      default: return null
    }
  
  }

  // Check verification
  checkVerification(type: string): Boolean {
    switch (type) {
      case 'PostPublication':
        if (this.feedPublicationForm.controls.text.status == 'INVALID') {
          this._snackBar.open(
            this.translate.instant('ERROR-MESSAGE.els-ar-missing'), null,
            { horizontalPosition: 'center', verticalPosition: 'bottom', duration: 5000 }
          )
          return false
        }
        else return true
      case 'PicturePublication':
        if (this.uploadPicture !== 100) {
          this._snackBar.open(
            this.translate.instant('ERROR-MESSAGE.Please-wait-for-the-upload-to-complete'), null,
            { horizontalPosition: 'center', verticalPosition: 'bottom', duration: 5000 }
          )
          return false
        }
        if (!this.pictureUrl) {
          this._snackBar.open(
            this.translate.instant('ERROR-MESSAGE.A-err-has-occurred'), null,
            { horizontalPosition: 'center', verticalPosition: 'bottom', duration: 5000 }
          )
          return false
        }
        else return true
      case 'VideoPublication':
        if (!this.pictureUrl) {
          this._snackBar.open(
            this.translate.instant('ERROR-MESSAGE.Please-upload-the-poster-before'), null,
            { horizontalPosition: 'center', verticalPosition: 'bottom', duration: 5000 }
          )
          return false
        }
        if (this.uploadPicture !== 100 || this.uploadVideo !== 100) {
          this._snackBar.open(
            this.translate.instant('ERROR-MESSAGE.Please-wait-for-the-upload-to-complete'), null,
            { horizontalPosition: 'center', verticalPosition: 'bottom', duration: 5000 }
          )
          return false
        }
        if (!this.videoUrl) {
          this._snackBar.open(
            this.translate.instant('ERROR-MESSAGE.A-err-has-occurred'), null,
            { horizontalPosition: 'center', verticalPosition: 'bottom', duration: 5000 }
          )
          return false
        }
        else return true
    }
  }

  // finaly post the publications
  sendPublication(publication:FeedPublication): void {
    this.addInStore(publication)
    this.activeZone = 'defaultZone'
    this.feedPublicationForm.reset()
    this.hastagList = []
  }

  // Add in the store
  addInStore(publication:FeedPublication): void {
    this.store$.dispatch(new FeedPublicationStoreActions.AddFeedPublication(publication))
  }

  // Update for each type of publication
  updateForm(modeForm: string): void {
    switch (modeForm) {
      case 'post': {
        this.feedPublicationForm.addControl('type', this.formBuilder.control('PostPublication', Validators.required));
        this.feedPublicationForm.addControl('background', this.formBuilder.control(this.background, Validators.required));
        this.feedPublicationForm.addControl('text', this.formBuilder.control('', Validators.required));
        break;
      }
      case 'picture': {
        this.feedPublicationForm.addControl('file', this.formBuilder.control(this.imgPath, Validators.required));
        this.feedPublicationForm.addControl('text', this.formBuilder.control('', Validators.required));
        break;
      }
      case 'video': {
        this.feedPublicationForm.addControl('text', this.formBuilder.control('', Validators.required));
        this.feedPublicationForm.addControl('file', this.formBuilder.control(this.videoPath, Validators.required));
        this.feedPublicationForm.addControl('poster', this.formBuilder.control(this.postervideo, Validators.required));
        break;
      }
    }
  }

  // Option tag
  tagAdded(profile: ProfileModel): void {
    this.friendTagged.push(profile)
  }

  // Delete a friend in the list
  deleteTag(profile: ProfileModel): void {
    this.friendTagged = this.friendTagged.filter(obj => obj != profile)
  }

  // Show the dropdown
  showListTagged(): void {
    this.listProfilTagged = true
  }

  // Unsubscribe all the var
  ngOnDestroy(): void {
    if (this.uploadPictureSub) this.uploadPictureSub.unsubscribe()
    if (this.uploadVideoSub) this.uploadVideoSub.unsubscribe()
  }

  // Add hastag
  addHastag() {

    // Intialize the arraylist if it's not exist
    if (!this.hastagList) this.hastagList = []

    // Not more than 5 hastag
    if (this.hastagList.length >= 5) {
      return this._snackBar.open(
        this.translate.instant('ERROR-MESSAGE.not-more-5-hastags'),
        this.translate.instant('CORE.close'), {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 5000,
      });
    }

    // Check if we already have the same
    if (!this.hastagList.indexOf(String(this.hastagContent.nativeElement.value))) {
      return this._snackBar.open(
        this.translate.instant('ERROR-MESSAGE.T-hashtag-is-already-there'),
        this.translate.instant('CORE.close'), {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 5000,
      });
    }

    // Push in the list
    this.hastagList.push(this.hastagContent.nativeElement.value)

    // Reset the search 
    this.hastagContent.nativeElement.value = null

  }

  // Delete an hastag
  removeHastag(hastag: string) {
    this.hastagList.splice(this.hastagList.indexOf(hastag), 1)
  }

  // Check if the keyboard touch is valid
  omit_special_char(event: KeyboardEvent) {
    let k = event.charCode;
    return ((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || (k >= 48 && k <= 57));
  }

  // To upload a file and compress
  uploadFileAndCompress(bucketName: string, file: File, reader: ArrayBuffer | String | any) {

    // Create the object to get the signed url from the backend
    const urlSigned: UrlSigned = {
      Bucket: bucketName,
      Key: uuid.v4(),
      ContentType: file.type
    }

    // To compress the file
    this.imageCompress.compressFile(reader, -1, 75, 50).then(
      (result: string) => {

        // To compress to a file
        this.uploadService.urltoFile(result, file.name, file.type)
          .then((file: File) =>

            // To get the s3 signed url
            this.uploadService2.getSignedUrl(urlSigned).subscribe(
              (response: RespondGetUploadUrl) => {
                // Upload to s3
                this.uploadPictureSub = this.uploadService.uploadfileAWSS3(response.url, file).subscribe(
                  (response: HttpEvent<{}>) => this.updateProgress(response, urlSigned, 'image'),
                  (error: any) => null)
              },
              (error: RespondGetUploadUrl) => null
            )
          )
      }

    )
  }

  // To upload a file
  uploadFile(bucketName: string, file: File, reader: ArrayBuffer | String) {

    // Create the object to get the signed url from the backend
    const urlSigned: UrlSigned = {
      Bucket: bucketName,
      Key: uuid.v4(),
      ContentType: file.type
    }

    // To get the s3 signed url
    this.uploadVideoSub = this.uploadService2.getSignedUrl(urlSigned).subscribe(
      (response: RespondGetUploadUrl) => {
        // Upload to s3
        this.uploadService.uploadfileAWSS3(response.url, file).subscribe(
          (response: HttpEvent<{}>) => this.updateProgress(response, urlSigned, 'video'),
          (error: any) => null)
      },
      (error: RespondGetUploadUrl) => null
    )

  }

  // To update the loading bar
  updateProgress(event: HttpEvent<{}>, urlSigned: UrlSigned, type: string): void {
    switch (type) {
      case 'video':
        switch (event.type) {
          case  HttpEventType.UploadProgress: { this.uploadVideo = Math.round((100 * event.loaded) / event.total); break }
          case HttpEventType.Response: { this.updateUrl(urlSigned.Bucket, urlSigned.Key, type); break }
          default: break
        }
        return null
      case 'picture':
        switch (event.type) {
          case HttpEventType.UploadProgress: { this.uploadPicture = Math.round((100 * event.loaded) / event.total); break }
          case HttpEventType.Response: { this.updateUrl(urlSigned.Bucket, urlSigned.Key, type); break }
          default: break
        }
        return null
      }
  }

  // Update url
  updateUrl(bucketName: string, key: string, type: string): void {
    switch (type) {
      case 'picture': { this.pictureUrl = this.uploadService.getFileUrlAfterUpload(bucketName, key); break; }
      case 'video': { this.videoUrl = this.uploadService.getFileUrlAfterUpload(bucketName, key); break; }
      default: break
    }
  }

}

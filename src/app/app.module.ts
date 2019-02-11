import { BrowserModule } from '@angular/platform-browser';
import { LOCALE_ID, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { registerLocaleData } from '@angular/common';
import localeMx from '@angular/common/locales/es-MX';
registerLocaleData(localeMx, 'mx');

// Plugins
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgxPaginationModule } from 'ngx-pagination';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
// Routing
import { AppRoutingModule } from './app-routing.module';

// Firebase Modules
import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireStorageModule } from 'angularfire2/storage';
import { AngularFireAuthModule } from 'angularfire2/auth';

import { environment } from '../environments/environment';

// Services
import { StudentService } from './services/student.service';
import { AuthGuard } from './services/auth.guard';
import { AuthService } from './services/auth.service';

// Pipes
import { KeysPipe } from './pipes/keys.pipe';
import { FileSizePipe } from './pipes/file-size.pipe';

// Directives
import { DropZoneDirective } from './drop-zone.directive';

// Components
import { AppComponent } from './app.component';
import { IndexComponent } from './components/index/index.component';
import { HeaderComponent } from './components/header/header.component';
import { LoginComponent } from './components/login/login.component';
import { LoaderComponent } from './shared/loader/loader.component';
import { StudentsAdminComponent } from './components/administrador/students-admin/students-admin.component';

// Students:
import { StudentProfileComponent } from './components/student/student-profile/student-profile.component';
import { StudentRegisterComponent } from './components/student/student-register/student-register.component';

// Enterprises:
import { EnterpriseProfileComponent } from './components/enterprise/enterprise-profile/enterprise-profile.component';
import { EnterpriseRegisterComponent } from './components/enterprise/enterprise-register/enterprise-register.component';

// JobOffers:
import { JobofferListComponent } from './components/joboffer/joboffer-list/joboffer-list.component';
import { JobofferRegisterComponent } from './components/joboffer/joboffer-register/joboffer-register.component';
import { JobofferEditComponent } from './components/joboffer/joboffer-edit/joboffer-edit.component';
import { JobofferViewComponent } from './components/joboffer/joboffer-view/joboffer-view.component';
import { JobofferMainComponent } from './components/joboffer/joboffer-main/joboffer-main.component';
import { EmailAvailableDirective } from './validators/email-available.directive';
import { MatchEmailValidatorDirective } from './validators/match-email.directive';
import { MatchPasswordValidatorDirective } from './validators/match-password.directive';
import { LoadingComponent } from './components/shared/loading/loading.component';
import { NotfoundComponent } from './shared/notfound/notfound.component';
import { EnterprisesAdminComponent } from './components/administrador/enterprises-admin/enterprises-admin.component';
import { JoboffersAdminComponent } from './components/administrador/joboffers-admin/joboffers-admin.component';

@NgModule({
  declarations: [
    KeysPipe,
    AppComponent,
    IndexComponent,
    HeaderComponent,
    LoginComponent,
    DropZoneDirective,
    FileSizePipe,
    StudentRegisterComponent,
    StudentProfileComponent,
    EnterpriseProfileComponent,
    EnterpriseRegisterComponent,
    JobofferListComponent,
    JobofferRegisterComponent,
    JobofferEditComponent,
    JobofferViewComponent,
    LoaderComponent,
    StudentsAdminComponent,
    JobofferMainComponent,
    EmailAvailableDirective,
    MatchEmailValidatorDirective,
    MatchPasswordValidatorDirective,
    LoadingComponent,
    NotfoundComponent,
    EnterprisesAdminComponent,
    JoboffersAdminComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule, // imports firebase/firestore, only needed for database features
    AngularFireAuthModule, // imports firebase/auth, only needed for auth features,
    AngularFireStorageModule, // imports firebase/storage only needed for storage features
    NgbModule.forRoot(),
    AppRoutingModule,
    NgxDatatableModule,
    MatFormFieldModule,
    NgxPaginationModule,
    MatInputModule,
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-top-center',
    })
  ],
  providers: [
    AuthService,
    AuthGuard,
    StudentService,
    { provide: LOCALE_ID, useValue: 'mx' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

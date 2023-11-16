import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

// * HttpClientModule
import { HttpClientModule } from '@angular/common/http';

// * Firebase
import { environment } from '../environments/environment';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';

// * primeNG
import {InputTextModule} from 'primeng/inputtext';

// * Graph
import { NgxEchartsModule } from 'ngx-echarts';
import { CakeGraphComponent } from './pages/cake-graph/cake-graph.component';

// * Pages and Components
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { BombDetailComponent } from './pages/bomb-detail/bomb-detail.component';
import { DisplayComponent } from './pages/display/display.component';
import { MachineDetailComponent } from './pages/machine-detail/machine-detail.component';
import { MachinesComponent } from './pages/machines/machines.component';
import { PrivilegesComponent } from './pages/privileges/privileges.component';
import { PrivilegesDetailComponent } from './pages/privileges-detail/privileges-detail.component';
import { RhComponent } from './pages/rh/rh.component';
import { FooterComponent } from './pages/footer/footer.component';
import { SidebarComponent } from './pages/sidebar/sidebar.component';
import { NavbarComponent } from './pages/navbar/navbar.component';
import { PreloaderComponent } from './pages/preloader/preloader.component';
import { GoogleMapsComponent } from './pages/google-maps/google-maps.component';
import { TableComponent } from './pages/table/table.component';
import { GraphComponent } from './pages/graph/graph.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    BombDetailComponent,
    DisplayComponent,
    MachineDetailComponent,
    MachinesComponent,
    PrivilegesComponent,
    PrivilegesDetailComponent,
    RhComponent,
    FooterComponent,
    SidebarComponent,
    NavbarComponent,
    PreloaderComponent,
    GoogleMapsComponent,
    TableComponent,
    GraphComponent,
    CakeGraphComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFirestoreModule,
    HttpClientModule,
    InputTextModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts'),
    }),
  ],
  providers: [
    DatePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

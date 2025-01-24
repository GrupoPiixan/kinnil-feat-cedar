import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// * AuthRoute
import { redirectUnauthorizedTo, redirectLoggedInTo, canActivate } from '@angular/fire/compat/auth-guard';
const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);
const redirectLoggedIn = () => redirectLoggedInTo(['dashboard']);

// * Pages
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { MachinesComponent } from './pages/machines/machines.component';
import { MachineDetailComponent } from './pages/machine-detail/machine-detail.component';
import { DisplayComponent } from './pages/display/display.component';
import { RhComponent } from './pages/rh/rh.component';
import { PrivilegesComponent } from './pages/privileges/privileges.component';
import { PrivilegesDetailComponent } from './pages/privileges-detail/privileges-detail.component';
import { BombDetailComponent } from './pages/bomb-detail/bomb-detail.component';
import { AuthGuard } from './guards/auth.guard';
const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, ...canActivate(redirectLoggedIn) },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'machines', component: MachinesComponent, ...canActivate(redirectUnauthorizedToLogin) },
  { path: 'machine-detail/:uid', component: MachineDetailComponent, ...canActivate(redirectUnauthorizedToLogin) },
  { path: 'bomb-detail/:uid', component: BombDetailComponent, ...canActivate(redirectUnauthorizedToLogin) },
  { path: 'display', component: DisplayComponent, ...canActivate(redirectUnauthorizedToLogin) },
  { path: 'rh', component: RhComponent, ...canActivate(redirectUnauthorizedToLogin) },
  { path: 'privileges', component: PrivilegesComponent, ...canActivate(redirectUnauthorizedToLogin) },
  { path: 'privileges-detail/:name/:uid', component: PrivilegesDetailComponent, ...canActivate(redirectUnauthorizedToLogin) },

  // * Ruta para redireccionar a login, si se escribe una url no válida
  { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

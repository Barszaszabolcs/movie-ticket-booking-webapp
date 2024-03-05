import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './shared/services/auth.guard';
import { ReverseAuthGuard } from './shared/services/reverse-auth.guard';
import { AdminGuard } from './shared/services/admin.guard';

const routes: Routes = [
  {
    path: 'main',
    loadChildren: () => import('./pages/main/main.module').then(m => m.MainModule)
  },
  {
    path: 'film',
    loadChildren: () => import('./pages/film/film.module').then(m => m.FilmModule)
  },
  { 
    path: 'ticket-booking',
    loadChildren: () => import('./pages/ticket-booking/ticket-booking.module').then(m => m.TicketBookingModule),
    canActivate: [AuthGuard]
  },
  /*{
    path: 'cinema',
    loadChildren: () => import('./pages/cinema/cinema.module').then(m => m.CinemaModule),
    canActivate: [AuthGuard]
  },*/
  { 
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginModule),
    canActivate: [ReverseAuthGuard]
  },
  { 
    path: 'registration',
    loadChildren: () => import('./pages/registration/registration.module').then(m => m.RegistrationModule),
    canActivate: [ReverseAuthGuard]
  },
  { 
    path: 'profile',
    loadChildren: () => import('./pages/profile/profile.module').then(m => m.ProfileModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'film-create',
    loadChildren: () => import('./pages/film-create/film-create.module').then(m => m.FilmCreateModule)
  },
  {
    path: 'screening-create',
    loadChildren: () => import('./pages/screening-create/screening-create.module').then(m => m.ScreeningCreateModule),
    canActivate: [AuthGuard, AdminGuard]
  },
  { 
    path: 'cancel-payment',
    loadChildren: () => import('./pages/payment/cancel-payment/cancel-payment.module').then(m => m.CancelPaymentModule)
  },
  { 
    path: 'success-payment',
    loadChildren: () => import('./pages/payment/success-payment/success-payment.module').then(m => m.SuccessPaymentModule)
  },
  {
    path: '',
    redirectTo: '/main',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/main'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

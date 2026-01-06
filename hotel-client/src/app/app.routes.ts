import { Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';

import { ManagerDashboard } from './pages/manager-pages/dashboard/dashboard';
import { ReceptionDashboard } from './pages/reception-pages/dashboard/dashboard';
import { MyBookingsComponent } from './pages/guest-pages/my-bookings/my-bookings';

import { AdminLayoutComponent } from './pages/admin-pages/admin-layout/admin-layout';
import { AdminDashboardComponent } from './pages/admin-pages/dashboard/admin-dashboard';

import { HotelsComponent } from './pages/admin-pages/hotels/hotels';
import { HotelFormComponent } from './pages/admin-pages/hotel-form/hotel-form';

import { UsersComponent } from './pages/admin-pages/users/users';
import { UserFormComponent } from './pages/admin-pages/user-form/user-form';

import { RoomTypesComponent } from './pages/admin-pages/roomtypes/roomtypes';
import { RoomTypeFormComponent } from './pages/admin-pages/roomtype-form/roomtype-form';
import { RoomFormComponent } from './pages/admin-pages/room-form/room-form';

import { RoomsComponent } from './pages/admin-pages/rooms/rooms';

import { adminGuard } from './core/guards/admin-guard';
import { managerGuard } from './core/guards/manager-guard';
import { receptionGuard } from './core/guards/reception-guard';
import { authGuard } from './core/guards/auth-guard';
import { SeasonalPricesListComponent } from './pages/admin-pages/seasonal-prices-list/seasonal-prices-list';
import { SeasonalPriceFormComponent } from './pages/admin-pages/seasonal-price-form/seasonal-price-form';
import { UserHotelAssignmentsComponent } from './pages/admin-pages/user-hotel-assignments/user-hotel-assignments';
import { GuestLayoutComponent } from './pages/guest-pages/guest-layout/guest-layout';
import { GuestHomeComponent } from './pages/guest-pages/guest-home/guest-home';
import { GuestHotelsComponent } from './pages/guest-pages/guest-hotels/guest-hotels';
import { GuestSearchComponent } from './pages/guest-pages/guest-search/guest-search';
import { GuestRoomsComponent } from './pages/guest-pages/guest-rooms/guest-rooms';
import { GuestReservationsComponent } from './pages/guest-pages/guest-reservations/guest-reservations';
import { GuestConfirmComponent } from './pages/guest-pages/guest-confirm/guest-confirm';
import { ManagerHomeComponent } from './pages/manager-pages/manager-home/manager-home';
import { ManagerLayoutComponent } from './pages/manager-pages/manager-layout/manager-layout';
import { PendingReservationsComponent } from './pages/manager-pages/pending-reservations/pending-reservations';
import { ManageRoomsComponent } from './pages/manager-pages/manage-rooms/manage-rooms.component';



export const routes: Routes = [

  { path: '', component: HomeComponent },

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  //{ path: 'manager/dashboard', component: ManagerDashboard, canActivate: [managerGuard] },

  { path: 'reception/reservations', component: ReceptionDashboard, canActivate: [receptionGuard] },

  { path: 'guest/bookings', component: MyBookingsComponent, canActivate: [authGuard] },

  
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [

      { path: '', component: AdminDashboardComponent },

      // HOTELS
      { path: 'hotels', component: HotelsComponent },
      { path: 'hotels/add', component: HotelFormComponent },
      { path: 'hotels/edit/:id', component: HotelFormComponent },

      // USERS
      { path: 'users', component: UsersComponent },
      { path: 'users/add', component: UserFormComponent },
      { path: 'users/edit/:id', component: UserFormComponent },

      // ROOM TYPES
      { path: 'roomtypes', component: RoomTypesComponent },
      { path: 'roomtypes/add', component: RoomTypeFormComponent },
      { path: 'roomtypes/edit/:id', component: RoomTypeFormComponent },

      // ROOMS
      { path: 'rooms', component: RoomsComponent },
      { path: 'rooms/add', component: RoomFormComponent },
      { path: 'rooms/edit/:id', component: RoomFormComponent },


      { path: 'seasonal-prices', component: SeasonalPricesListComponent },
      { path: 'seasonal-prices/add', component: SeasonalPriceFormComponent },
      { path: 'seasonal-prices/edit/:id', component: SeasonalPriceFormComponent },
      {
        path: 'assignments',
        component: UserHotelAssignmentsComponent
      }
    ]
  },
  {
    path: 'guest',
    component: GuestLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'hotels', pathMatch: 'full' },
      { path: 'home', component: GuestHomeComponent },
      { path: 'hotels', component: GuestHotelsComponent },
      { path: 'search', component: GuestSearchComponent },
      { path: 'rooms', component: GuestRoomsComponent },
      { path: 'reservations', component: GuestReservationsComponent },
      { path: 'confirm', component: GuestConfirmComponent },
      {
        path: 'room-service',
        loadComponent: () => import('./pages/guest-pages/guest-room-service/guest-room-service').then(m => m.GuestRoomServiceComponent)
      },

    ]
  },
  {
    path: 'manager',
    component: ManagerLayoutComponent, // New Layout as parent
    canActivate: [managerGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, // Redirect to dashboard
      { path: 'dashboard', component: ManagerDashboard },      // Dashboard (Cards View)

      { path: 'pending', component: PendingReservationsComponent },
      { path: 'rooms', component: ManageRoomsComponent },
      {
        path: 'reports/:hotelId',
        loadComponent: () => import('./pages/manager-pages/manager-reports/manager-reports').then(m => m.ManagerReportsComponent)
      },
      {
        path: 'reservations-list/:hotelId',
        loadComponent: () => import('./pages/manager-pages/manager-all-reservations/manager-all-reservations.component').then(m => m.ManagerAllReservationsComponent)
      }
    ]
  },




  // USER PROFILE
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile').then(m => m.ProfileComponent),
    title: 'My Profile'
  },

  // fallback
  { path: '**', redirectTo: '' }
];

import { Routes } from '@angular/router';
import { ProductComponent } from './component/product/product.component';
import { BrandsComponent } from './component/brands/brands.component'; 
import { LoginComponent } from './auth/login.component';
import { AboutComponent } from './component/about/about.component';
import { ProfileComponent } from './component/profile/profile.component';


export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'brands', component: BrandsComponent }, 
  { path: 'products', component: ProductComponent },
   { path: 'about', component: AboutComponent },
      { path: 'profile', component: ProfileComponent },

  { path: '', redirectTo: 'brands', pathMatch: 'full' }
  
];
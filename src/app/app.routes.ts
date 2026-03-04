import { Routes } from '@angular/router';
import { ProductComponent } from './component/product/product.component';
import { BrandsComponent } from './component/brands/brands.component'; 
import { LoginComponent } from './auth/login.component';
import { AboutComponent } from './component/about/about.component';
import { ProfileComponent } from './component/profile/profile.component';
import { HomeComponent } from './component/home/home.component';
import { ContactComponent } from './component/contact/contact.component';
import { ProdcutDetailComponent } from './component/prodcut-detail/prodcut-detail.component';
import { AuthGuard } from './auth/auth.guard';
import { AdminBrandsComponent } from './component/Admin/brands/brands.component';
import { AdminModelsComponent } from './component/Admin/models/models.component';
import { AdminProductsComponent } from './component/Admin/products/products.component';
import { AdminLayoutComponent } from './component/Admin/admin-layout/admin-layout.component';
import { AdminColorsComponent } from './component/Admin/colors/colors.component';
import { AdminProductDetailsComponent } from './component/Admin/product-details/product-details.component';
import { AdminSalesComponent } from './component/Admin/sales-report/sales.component';
import { AdminUsersComponent } from './component/Admin/users/users.component';
import { AdminDashboardComponent } from './component/Admin/dashboard/dashboard.component';
import { NotificationsComponent } from './component/Admin/notifications/notifications.component';
import { WishlistComponent } from './component/wishlist/wishlist.component';
import { OrdersComponent } from './component/orders/orders.component';


export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'brands', component: BrandsComponent }, 
  { path: 'products', component: ProductComponent },
   { path: 'about', component: AboutComponent },
      { path: 'profile', component: ProfileComponent },
       { path: 'home', component: HomeComponent },
         { path: 'contact', component:ContactComponent  },
          { path: 'product-details/:id', component: ProdcutDetailComponent },
          { path: 'wishlist', component: WishlistComponent },
          { path: 'orders', component: OrdersComponent },
         

            
    {
  path: 'admin',
  component: AdminLayoutComponent,
  canActivate: [AuthGuard],
  children: [
    { path: 'brands', component: AdminBrandsComponent },
    { path: 'dashboard', component: AdminDashboardComponent },
    { path: 'models', component: AdminModelsComponent },
    { path: 'colors', component: AdminColorsComponent },
    { path: 'products', component: AdminProductsComponent },
     { path: 'product-details/:id', component: AdminProductDetailsComponent },
    { path: 'sales', component: AdminSalesComponent },
    { path: 'users', component: AdminUsersComponent },
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' } ,
    // start here

    { path: 'notifications', component: NotificationsComponent }
  ]
},




  
  { path: '', redirectTo: 'brands', pathMatch: 'full' }
  
];
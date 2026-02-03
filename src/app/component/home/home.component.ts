import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ProductService } from '../product/product.service';
import { Product } from '../../../models/product.model';



@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  products: Product[] = [];
  isLoading: boolean = true;

  // Injection works because ProductService is a class
  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (data: Product[]) => {
        this.products = data;
        this.isLoading = false;
      },
      // Fixed TS7006 by adding :HttpErrorResponse
      error: (err: HttpErrorResponse) => {
        console.error('Fetch error:', err.message);
        this.isLoading = false;
      }
    });
  }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  id: string;
  name: string;
  price: number;
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  constructor(private http: HttpClient) {}

  list(): Observable<Product[]> {
    return this.http.get<Product[]>('/products');
  }

  create(product: Omit<Product, 'id'>): Observable<Product> {
    return this.http.post<Product>('/products', product);
  }
}
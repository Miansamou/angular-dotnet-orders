import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyPipe } from '@angular/common'; 
import { ProductsService, Product } from '../../core/products/products.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyPipe],
  templateUrl: './products.html',
  styleUrl: './products.scss'
})
export class Products implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ProductsService);
  loading = signal(true);
  
  products: Product[] = [];
  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    price: [0, [Validators.required, Validators.min(0)]],
  });  

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.api.list()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe(p => this.products = p);
  }

  add() {
    if (this.form.invalid) return;
    const dto = this.form.getRawValue();
    this.api.create(dto).subscribe(p => {
      this.products.unshift(p);
      this.form.reset({ name: '', price: 0 });
    });
  }
}

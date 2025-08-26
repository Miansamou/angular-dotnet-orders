import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../../../core/login/login.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);
  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  private api = inject(LoginService);
  
  async submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set(null);

    try {
      const { email, password } = this.form.getRawValue();
      await firstValueFrom(this.api.login({ email, password }));

      const key = this.api.token();
      localStorage.setItem(key!, JSON.stringify({ email, at: Date.now() }));

      this.router.navigateByUrl('/products');
    } catch (e: any) {
      const msg =
        e?.error?.message ??
        (typeof e?.error === 'string' ? e.error : null) ??
        'Falha na autenticação';
      this.error.set(msg);
    } finally {
      this.loading.set(false);
    }
  }

  goRegister() { this.router.navigateByUrl('/register'); }
}

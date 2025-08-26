import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../../../core/login/login.service';
import { firstValueFrom } from 'rxjs';

function match(ctrl: AbstractControl) {
  const p = ctrl.get('password')?.value;
  const c = ctrl.get('confirm')?.value;
  return p && c && p === c ? null : { mismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  loading = signal(false);
  error = signal<string | null>(null);

  form = this.fb.nonNullable.group(
    {
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm: ['', [Validators.required]],
    },
    { validators: match }
  );

  private api = inject(LoginService);
  
  async submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set(null);
    try {
      const { name, email, password } = this.form.getRawValue();
      await firstValueFrom(this.api.register({ name, email, password }));

      localStorage.setItem('demo_user', JSON.stringify({ name, email, at: Date.now() }));
      this.router.navigateByUrl('/login');
    } catch (e:any) {
      this.error.set(e?.error?.message ?? 'Falha ao registrar');
    } finally {
      this.loading.set(false);
    }
  }
}

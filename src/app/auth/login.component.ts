import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="page">
      <!-- big rounded stage -->
      <div class="stage">
        <!-- decorative background blobs -->
        <span class="shape s-a" aria-hidden="true"></span>
        <span class="shape s-b" aria-hidden="true"></span>
        <span class="shape s-c" aria-hidden="true"></span>
        <span class="shape s-d" aria-hidden="true"></span>
        <span class="shape s-e" aria-hidden="true"></span>

        <!-- login glass card -->
        <div class="glass" [class.shake]="shake">
          <div class="head">
            <div class="logoWrap">
              <div class="mark" aria-hidden="true">
                <span class="m1"></span>
                <span class="m2"></span>
              </div>
            </div>

            <div class="titles">
              <div class="tiny">Your logo</div>
              <h1>Login</h1>
            </div>
          </div>

          <form (ngSubmit)="onSubmit()" novalidate>
            <label class="lbl">Email</label>
            <div class="field">
              <input
                type="text"
                name="username"
                [(ngModel)]="username"
                required
                placeholder="username@gmail.com"
                autocomplete="username"
              />
            </div>

            <label class="lbl">Password</label>
            <div class="field">
              <input
                type="password"
                name="password"
                [(ngModel)]="password"
                required
                placeholder="Password"
                autocomplete="current-password"
              />
              <span class="eye" aria-hidden="true">•</span>
            </div>

            <a class="forgot" href="javascript:void(0)">Forgot Password?</a>

            <button type="submit" class="btn" [disabled]="isLoading">
              {{ isLoading ? 'Signing in...' : 'Sign in' }}
            </button>

            <div class="divider">
              <span>or continue with</span>
            </div>

            <div class="social">
              <button type="button" class="sbtn g" aria-label="Continue with Google">
                <span class="ic">G</span>
              </button>
              <button type="button" class="sbtn gh" aria-label="Continue with GitHub">
                <span class="ic">⌂</span>
              </button>
              <button type="button" class="sbtn f" aria-label="Continue with Facebook">
                <span class="ic">f</span>
              </button>
            </div>

            <div class="foot">
              <span>Don't have an account?</span>
              <a href="javascript:void(0)" class="reg">Register for free</a>
            </div>
          </form>

          <div *ngIf="error" class="err">
            <strong>Oops:</strong> {{ error }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host{ display:block; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; }

    /* ===== page background like screenshot ===== */
    .page{
      min-height: 100vh;
      display:grid;
      place-items:center;
      padding: 28px 18px;
      background:
        radial-gradient(900px 520px at 18% 12%, rgba(255,255,255,.25), transparent 60%),
        radial-gradient(700px 520px at 92% 20%, rgba(255,255,255,.18), transparent 62%),
        linear-gradient(180deg, #79bfff 0%, #6ab1ff 55%, #66adff 100%);
    }

    /* ===== big rounded container ===== */
    .stage{
      width: min(1040px, 96vw);
      height: min(520px, 78vh);
      border-radius: 22px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 30px 80px rgba(2, 40, 80, .28);
      background:
        radial-gradient(900px 520px at 30% 35%, rgba(0, 210, 255, .16), transparent 60%),
        radial-gradient(800px 560px at 70% 60%, rgba(0, 120, 255, .20), transparent 62%),
        linear-gradient(135deg, #003b8d 0%, #0a6fd0 55%, #0b7ee0 100%);
    }

    /* soft glare top */
    .stage::before{
      content:"";
      position:absolute; inset:0;
      background:
        radial-gradient(700px 260px at 50% 0%, rgba(255,255,255,.12), transparent 70%),
        radial-gradient(560px 420px at 100% 0%, rgba(255,255,255,.10), transparent 64%);
      pointer-events:none;
    }

    /* ===== background "3D" shapes (pure CSS) ===== */
    .shape{
      position:fixed;
      border-radius: 999px;
      filter: blur(.2px);
      opacity: .92;
      background: linear-gradient(180deg, rgba(255,255,255,.55), rgba(255,255,255,.18));
      box-shadow:
        inset 0 10px 24px rgba(255,255,255,.18),
        inset 0 -18px 26px rgba(0,0,0,.18),
        0 22px 42px rgba(0,0,0,.22);
      transform: rotate(18deg);
    }

    .s-a{ width: 86px; height: 48px; left: 160px; top: 180px; transform: rotate(35deg); }
    .s-b{ width: 86px; height: 48px; left: 120px; top: 250px; transform: rotate(35deg); opacity:.85; }
    .s-c{ width: 120px; height: 40px; right: 140px; bottom: 140px; transform: rotate(-18deg); opacity:.85; }
    .s-d{ width: 92px; height: 30px; right: 210px; bottom: 95px; transform: rotate(-18deg); opacity:.82; }
    .s-e{
      width: 240px; height: 240px;
      left: -70px; bottom: -90px;
      opacity: .22;
      filter: blur(0px);
      background: radial-gradient(circle at 30% 30%, rgba(255,255,255,.55), rgba(255,255,255,.05));
      box-shadow: 0 28px 70px rgba(0,0,0,.25);
      transform: rotate(0);
    }

    /* ===== center glass card ===== */
    .glass{
      position:absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: min(420px, 90vw);
      border-radius: 18px;
      padding: 20px 20px 16px;
      background: rgba(255,255,255,.14);
      border: 1px solid rgba(255,255,255,.18);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      box-shadow: 0 28px 80px rgba(0,0,0,.35);
      color: rgba(255,255,255,.95);
    }

    /* inner glow frame */
    .glass::before{
      content:"";
      position:absolute; inset:10px;
      border-radius: 14px;
      border: 1px solid rgba(255,255,255,.12);
      pointer-events:none;
    }

    .head{
      display:flex;
      align-items:center;
      gap: 14px;
      margin-bottom: 8px;
      position:relative;
      z-index:1;
    }

    /* logo mark like screenshot */
    .logoWrap{ width: 72px; height: 64px; display:grid; place-items:center; }
    .mark{
      width: 62px; height: 48px;
      position:relative;
      filter: drop-shadow(0 14px 18px rgba(0,0,0,.22));
    }
    .mark .m1, .mark .m2{
      position:absolute;
      width: 34px; height: 22px;
      border-radius: 999px;
      background: linear-gradient(180deg, rgba(200,235,255,.95), rgba(120,200,255,.75));
      box-shadow:
        inset 0 10px 18px rgba(255,255,255,.22),
        inset 0 -10px 18px rgba(0,0,0,.18);
    }
    .mark .m1{ left: 0; top: 8px; transform: rotate(-20deg); }
    .mark .m2{ left: 22px; top: 18px; transform: rotate(-20deg); opacity:.92; }

    .titles .tiny{
      font-size: 12px;
      opacity: .86;
      margin-bottom: 2px;
    }
    .titles h1{
      margin:0;
      font-size: 34px;
      line-height: 1;
      letter-spacing: -.6px;
      font-weight: 900;
    }

    form{ margin-top: 10px; position:relative; z-index:1; }

    .lbl{
      display:block;
      font-size: 12px;
      margin: 10px 0 6px;
      opacity: .92;
      font-weight: 700;
    }

    .field{
      height: 38px;
      border-radius: 8px;
      background: rgba(255,255,255,.92);
      border: 1px solid rgba(0,0,0,.08);
      display:flex;
      align-items:center;
      padding: 0 10px;
      box-shadow: 0 12px 22px rgba(0,0,0,.10);
    }
    .field:focus-within{
      border-color: rgba(255,255,255,.55);
      box-shadow: 0 14px 26px rgba(0,0,0,.16);
    }

    input{
      width:100%;
      border:none;
      outline:none;
      background:transparent;
      font-size: 13px;
      color: #0b1b35;
    }
    input::placeholder{ color: rgba(11,27,53,.45); }

    .eye{
      color: rgba(11,27,53,.35);
      font-weight: 900;
      margin-left: 8px;
      transform: translateY(-1px);
      user-select:none;
    }

    .forgot{
      display:inline-block;
      margin-top: 8px;
      font-size: 12px;
      color: rgba(255,255,255,.88);
      text-decoration:none;
      opacity:.92;
    }
    .forgot:hover{ text-decoration: underline; }

    .btn{
      margin-top: 12px;
      width: 100%;
      height: 38px;
      border: none;
      border-radius: 8px;
      background: linear-gradient(180deg, #0a2e5a, #062445);
      color: #fff;
      font-weight: 800;
      letter-spacing: .2px;
      box-shadow: 0 18px 34px rgba(0,0,0,.22);
      cursor:pointer;
    }
    .btn:hover{ filter: brightness(1.03); transform: translateY(-1px); }
    .btn:disabled{ opacity: .75; cursor:not-allowed; transform:none; }

    .divider{
      margin: 12px 0 10px;
      text-align:center;
      font-size: 12px;
      opacity: .85;
    }

    .social{
      display:flex;
      gap: 12px;
      justify-content:center;
      margin-bottom: 8px;
    }

    .sbtn{
      width: 64px;
      height: 28px;
      border-radius: 8px;
      border: 1px solid rgba(0,0,0,.08);
      background: rgba(255,255,255,.95);
      box-shadow: 0 12px 20px rgba(0,0,0,.10);
      cursor:pointer;
      display:grid;
      place-items:center;
    }
    .sbtn:hover{ transform: translateY(-1px); }
    .ic{
      font-weight: 900;
      color: #0b1b35;
      font-size: 14px;
      opacity:.9;
    }

    .foot{
      margin-top: 10px;
      display:flex;
      justify-content:center;
      gap: 6px;
      font-size: 12px;
      opacity: .92;
      flex-wrap: wrap;
    }
    .reg{
      color: #ffffff;
      font-weight: 900;
      text-decoration:none;
    }
    .reg:hover{ text-decoration: underline; }

    .err{
      margin-top: 10px;
      padding: 10px 12px;
      border-radius: 12px;
      background: rgba(255,59,48,.14);
      border: 1px solid rgba(255,59,48,.25);
      color: rgba(255,255,255,.95);
      font-size: 13px;
      font-weight: 700;
      position:relative;
      z-index:1;
    }

    /* shake */
    .shake{ animation: shake .35s linear; }
    @keyframes shake{
      0%,100%{ transform: translate(-50%, -50%) translateX(0); }
      25%{ transform: translate(-50%, -50%) translateX(-6px); }
      50%{ transform: translate(-50%, -50%) translateX(6px); }
      75%{ transform: translate(-50%, -50%) translateX(-4px); }
    }

    @media (max-width: 560px){
      .stage{ height: 560px; }
      .glass{ width: min(420px, 92vw); }
      .titles h1{ font-size: 30px; }
    }

    @media (prefers-reduced-motion: reduce){
      *{ animation:none !important; transition:none !important; }
    }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';
  isLoading = false;
  shake = false;

  constructor(public auth: AuthService, private router: Router) {}

  onSubmit() {
    this.error = '';
    this.isLoading = true;

    // LOG DATA BEFORE SENDING (your logic)
    console.log('--- LOGIN FORM DATA ---');
    console.log('Username:', this.username);
    console.log('Password:', this.password);
    console.log('-----------------------');

    this.auth.login(this.username, this.password).subscribe({
      next: () => {
        this.isLoading = false;

        const decoded = this.auth.getDecodedToken();
        console.log('✅ Decoded token:', decoded);

        if (this.auth.isAdmin()) {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/brands']);
        }
      },
      error: (err) => {
        console.error('❌ Login Error:', err);
        this.isLoading = false;

        this.error = 'Invalid credentials.';
        this.shake = true;
        setTimeout(() => (this.shake = false), 400);
      }
    });
  }
}
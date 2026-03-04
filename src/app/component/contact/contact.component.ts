import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {

  private readonly API = 'http://carproject-t9tv.onrender.com';

  // Form Data
  contactData = {
    firstName: '',
    lastName: '',
    mobileNo: '',
    emailId: '',
    message: ''
  };

  // Verification state
  userCode: string = '';
  isEmailVerified = false;
  isSendingCode = false;
  codeError = '';
  codeSentTo = '';

  // Submit state
  isSending = false;

  contactInfo = {
    phone: '+885 963 425 332',
    emails: ['unpheasa.biu@gamil.com', 'sales@expertwebdesigning.com'],
    location: '518, Rhythm Plaza, Amar Javan Circle, Nikol, Ahmedabad, Gujarat - 382350'
  };

  constructor(private http: HttpClient) {}

  // ====== Send code via backend ======
  sendVerificationCode() {
    const email = (this.contactData.emailId || '').trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.codeError = 'Please enter a valid email first.';
      return;
    }

    this.isSendingCode = true;
    this.codeError = '';

    this.http.post(`${this.API}/api/email/send-code`, { email }).subscribe({
      next: () => {
        this.isSendingCode = false;
        this.codeSentTo = email;
      },
      error: (err) => {
        console.error('Send code error:', err);
        this.isSendingCode = false;
        this.codeError = 'Failed to send code. Try again.';
      }
    });
  }

  // ====== Verify code via backend ======
  verifyEmail() {
    const email = (this.contactData.emailId || '').trim();

    this.http.post<any>(`${this.API}/api/email/verify-code`, {
      email,
      code: this.userCode.trim()
    }).subscribe({
      next: (res) => {
        if (res?.verified) {
          this.isEmailVerified = true;
          this.codeError = '';
        } else {
          this.codeError = 'Invalid code. Please try again.';
        }
      },
      error: () => {
        this.codeError = 'Invalid code. Please try again.';
      }
    });
  }

  // ====== Submit the message ======
  onSubmit(form: NgForm) {
    if (!form.valid || !this.isEmailVerified) return;

    this.isSending = true;

    const payload = {
      firstName: this.contactData.firstName,
      lastName: this.contactData.lastName,
      email: this.contactData.emailId,
      mobileNo: this.contactData.mobileNo,
      message: this.contactData.message
    };

    this.http.post(`${this.API}/notifications`, payload)
      .subscribe({
        next: () => {
          alert('✅ Message sent successfully!');
          this.isSending = false;
          this.isEmailVerified = false;
          this.codeSentTo = '';
          this.userCode = '';
          form.resetForm();
        },
        error: (err) => {
          console.error('Notification Error:', err);
          alert('❌ Failed to send message.');
          this.isSending = false;
        }
      });
  }
}
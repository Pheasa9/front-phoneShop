import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {
  // Your Telegram Credentials
  private botToken = '8545203039:AAFRJD8BNuXb9hjxe3ALh89qq0C5ZWCcot0';
  private chatId = '1551363178';

  // Form Data Model
  contactData = {
    firstName: '',
    lastName: '',
    mobileNo: '',
    emailId: '',
    message: '',
    captchaInput: ''
  };

  // UI State
  isSending = false;

  // Contact Info to avoid @ compiler error
  contactInfo = {
    phone: '+885 963 425 332',
    emails: ['unpheasa.biu@gamil.com', 'sales@expertwebdesigning.com'],
    location: '518, Rhythm Plaza, Amar Javan Circle, Nikol, Ahmedabad, Gujarat - 382350'
  };

  constructor(private http: HttpClient) {}

  onSubmit(form: NgForm) {
    if (form.valid) {
      this.isSending = true;

      const telegramText = `
🚀 <b>ke report mer phg</b>
━━━━━━━━━━━━━━━━━━
👤 <b>Name:</b> ${this.contactData.firstName} ${this.contactData.lastName}
✉️ <b>Email:</b> ${this.contactData.emailId}
💬 <b>Message:</b> 
<i>"${this.contactData.message}"</i>
      `;

      const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;

      this.http.post(url, {
        chat_id: this.chatId,
        text: telegramText,
        parse_mode: 'HTML'
      }).subscribe({
        next: () => {
          alert('✅ Message sent to Telegram!');
          this.isSending = false;
          form.resetForm();
        },
        error: (err) => {
          console.error('Telegram Error:', err);
          alert('❌ Error sending message. Check console.');
          this.isSending = false;
        }
      });
    }
  }
}
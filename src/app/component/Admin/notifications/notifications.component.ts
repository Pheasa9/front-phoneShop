import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

type NotificationItem = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  mobileNo?: string;
  message: string;
  readStatus: boolean;
  createdAt?: string;  // from Auditable
  createdBy?: string;
};

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {

  readonly API = 'http://localhost:8080/notifications';

  isLoading = false;
  errorMsg = '';
  notifications: NotificationItem[] = [];

  selected?: NotificationItem;
  isOpen = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.errorMsg = '';

    this.http.get<NotificationItem[]>(this.API).subscribe({
      next: (data) => {
        this.notifications = data || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = 'Failed to load notifications.';
        this.isLoading = false;
      }
    });
  }

  open(n: NotificationItem): void {
    this.selected = n;
    this.isOpen = true;

    // auto mark read when open
    if (!n.readStatus) {
      this.http.put<void>(`${this.API}/${n.id}/read`, null).subscribe({
        next: () => {
          n.readStatus = true;
          if (this.selected?.id === n.id) this.selected.readStatus = true;
        },
        error: (err) => console.error('markRead error:', err)
      });
    }
  }

  close(): void {
    this.isOpen = false;
    this.selected = undefined;
  }

  delete(n: NotificationItem): void {
    const ok = confirm(`Delete message from ${n.firstName} ${n.lastName}?`);
    if (!ok) return;

    this.http.delete(`${this.API}/${n.id}`).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(x => x.id !== n.id);
        if (this.selected?.id === n.id) this.close();
      },
      error: (err) => {
        console.error(err);
        alert('Delete failed');
      }
    });
  }

  fullName(n: NotificationItem): string {
    return `${n.firstName || ''} ${n.lastName || ''}`.trim() || 'Unknown';
  }

  trackById(_: number, n: NotificationItem) {
    return n.id;
  }
}
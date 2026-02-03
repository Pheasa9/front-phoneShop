import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent {
  // This array provides the data for the HTML loop
  team = [
    { 
      name: 'Vannak Serey', 
      role: 'Sales Manager', 
      img: 'assets/img/abouts/nora.jpg', 
      tg: 'https://t.me/v_serey', 
      fb: 'https://fb.com/v_serey' 
    },
    { 
      name: 'Sokha Dara', 
      role: 'Tech Lead', 
      img: 'assets/img/abouts/team2.jpg', 
      tg: 'https://t.me/s_dara', 
      fb: 'https://fb.com/s_dara' 
    },
    { 
      name: 'Bopha Roth', 
      role: 'Relations', 
      img: 'assets/img/abouts/team3.jpg', 
      tg: 'https://t.me/b_roth', 
      fb: 'https://fb.com/b_roth' 
    },
    { 
      name: 'Chantrea Nimol', 
      role: 'Logistics', 
      img: 'assets/img/abouts/team4.jpg', 
      tg: 'https://t.me/c_nimol', 
      fb: 'https://fb.com/c_nimol' 
    }
  ];

  handleMemberError(event: any) {
    event.target.src = 'assets/img/abouts/placeholder.png'; // Fallback if image missing
  }
}
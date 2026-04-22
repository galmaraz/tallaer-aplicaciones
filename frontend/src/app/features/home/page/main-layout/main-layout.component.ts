import { Component, ViewEncapsulation } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css',
  encapsulation: ViewEncapsulation.None, 
  imports: 
  [
    RouterOutlet, 
    RouterLink,
    RouterLinkActive
  ]
})
export class MainLayoutComponent {}
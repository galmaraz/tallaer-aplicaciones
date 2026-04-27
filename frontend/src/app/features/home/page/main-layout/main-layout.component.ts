import { Component, inject, signal, ViewEncapsulation } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NoteFilterService } from '../../../../features/note/services/note-filter.service';
import { UserSwitcherComponent } from "../../../../core/user/components/user-switcher/user-switcher.component";

@Component({
  selector: 'app-main-layout',
  standalone: true,
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css',
  encapsulation: ViewEncapsulation.None,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, UserSwitcherComponent],
})
export class MainLayoutComponent {
  protected filterService = inject(NoteFilterService);

  sidebarOpen = signal(true);

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }
}

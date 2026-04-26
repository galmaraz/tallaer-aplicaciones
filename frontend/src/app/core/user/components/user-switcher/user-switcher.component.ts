import { Component, computed, ElementRef, HostListener, inject, OnInit, signal } from '@angular/core';
import { CurrentUserService } from '../../services/current.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.interface';

@Component({
  selector: 'app-user-switcher',
  standalone: true,
  templateUrl: './user-switcher.component.html',
})
export class UserSwitcherComponent implements OnInit {
  #userService = inject(UserService);
  #currentUser = inject(CurrentUserService);
  #elementRef = inject(ElementRef<HTMLElement>);

  protected users = signal<User[]>([]);
  protected isOpen = signal(false);

  protected readonly currentUserId = this.#currentUser.currentUserId;

  protected readonly activeUser = computed<User | null>(() => {
    const id = this.currentUserId();
    if (id === null) return null;
    return this.users().find(u => u.id === id) ?? null;
  });

  ngOnInit(): void {
    this.#userService.getAll().subscribe(users => {
      this.users.set(users);
      // Si no hay usuario guardado, seleccionamos el primero
      if (this.#currentUser.currentUserId() === null && users.length > 0) {
        this.#currentUser.setCurrentUserId(users[0].id);
      }
    });
  }

  toggle(): void {
    this.isOpen.update(v => !v);
  }

  selectUser(user: User): void {
    this.#currentUser.setCurrentUserId(user.id);
    this.isOpen.set(false);
  }

  /** Iniciales para el avatar (máx. 2 letras) */
  protected getInitials(name: string): string {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(part => part[0] ?? '')
      .join('')
      .toUpperCase();
  }

  /** Cierra el dropdown al hacer click fuera */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.#elementRef.nativeElement.contains(event.target as Node)) {
      this.isOpen.set(false);
    }
  }

  /** Cierra con Escape */
  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.isOpen.set(false);
  }
}
import {
  Component,
  computed,
  DestroyRef,
  HostListener,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CurrentUserService } from '../../../../core/user/services/current.service';
import { UserService } from '../../../../core/user/services/user.service';
import { NoteShareService } from '../../services/noteshare.service';
import { NoteShareRole, ROLE_LABELS } from '../../models/noteshare-role.enum';
import { NoteShare } from '../../models/noteshare.interface';
import { User } from '../../../../core/user/models/user.interface';

@Component({
  selector: 'app-share-dialog',
  standalone: true,
  templateUrl: './share-dialog.component.html',
})
export class ShareDialogComponent implements OnInit {
  // Inputs / Outputs
  noteId = input.required<number>();
  initialCollaborators = input<NoteShare[]>([]);
  closed = output<void>();
  collaboratorsChanged = output<NoteShare[]>();

  // Servicios
  #shareService = inject(NoteShareService);
  #userService = inject(UserService);
  #currentUser = inject(CurrentUserService);
  #destroyRef = inject(DestroyRef);

  // Estado
  protected collaborators = signal<NoteShare[]>([]);
  protected allUsers = signal<User[]>([]);
  protected query = signal('');
  protected selectedRole = signal<NoteShareRole>(NoteShareRole.EDITOR);
  protected saving = signal(false);
  protected deletingId = signal<number | null>(null);
  protected error = signal<string | null>(null);

  // Constantes para el template
  protected readonly NoteShareRole = NoteShareRole;
  protected readonly ROLE_LABELS = ROLE_LABELS;
  protected readonly currentUserId = this.#currentUser.currentUserId;

  /** Usuarios que aún no son colaboradores (filtra al actual y a los ya añadidos) */
  protected readonly suggestedUsers = computed<User[]>(() => {
    const q = this.query().toLowerCase().trim();
    const collabIds = new Set(this.collaborators().map(c => c.usuario.id));
    const ownerId = this.currentUserId();

    return this.allUsers().filter(u => {
      if (u.id === ownerId) return false;
      if (collabIds.has(u.id)) return false;
      if (!q) return true;
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    });
  });

  ngOnInit(): void {
    this.collaborators.set(this.initialCollaborators());

    this.#userService
      .getAll()
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: (users) => this.allUsers.set(users),
        error: () => this.error.set('No se pudieron cargar los usuarios.'),
      });
  }

  protected getInitials(name: string): string {
    return name.trim().split(/\s+/).slice(0, 2).map(p => p[0] ?? '').join('').toUpperCase();
  }

  protected getCurrentUserName(): string {
    const id = this.currentUserId();
    if (id === null) return '';
    return this.allUsers().find(u => u.id === id)?.name ?? '';
  }

  protected getCurrentUserEmail(): string {
    const id = this.currentUserId();
    if (id === null) return '';
    return this.allUsers().find(u => u.id === id)?.email ?? '';
  }

  protected addCollaborator(user: User): void {
    if (this.saving()) return;
    this.error.set(null);
    this.saving.set(true);

    this.#shareService
      .save({
        role: this.selectedRole(),
        note: { id: this.noteId() },
        usuario: { id: user.id },
      })
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: () => {
          // Refresca desde el backend para obtener el id real del share
          this.#refresh();
          this.query.set('');
        },
        error: () => {
          this.error.set('No se pudo agregar el colaborador.');
          this.saving.set(false);
        },
      });
  }

  protected removeCollaborator(share: NoteShare): void {
    this.deletingId.set(share.id);
    this.error.set(null);

    this.#shareService
      .delete(share.id)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: () => {
          this.collaborators.update(list => list.filter(c => c.id !== share.id));
          this.collaboratorsChanged.emit(this.collaborators());
          this.deletingId.set(null);
        },
        error: () => {
          this.error.set('No se pudo quitar el colaborador.');
          this.deletingId.set(null);
        },
      });
  }

  #refresh(): void {
    this.#shareService
      .getByNote(this.noteId())
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: (shares) => {
          this.collaborators.set(shares);
          this.collaboratorsChanged.emit(shares);
          this.saving.set(false);
        },
        error: () => {
          this.error.set('No se pudo refrescar la lista.');
          this.saving.set(false);
        },
      });
  }

  protected close(): void {
    if (this.saving()) return;
    this.closed.emit();
  }

  protected onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).dataset['shareBackdrop'] === 'true') {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.close();
  }

  protected getRoleLabel(role: NoteShareRole): string {
    return ROLE_LABELS[role] ?? '';
  }
}
import { Component, inject, output, signal, OnInit, computed } from '@angular/core';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-user-selector',
  standalone: true,
  templateUrl: './user-selector.component.html',
})
export class UserSelectorComponent implements OnInit {
  #usuarioService = inject(UsuarioService);
  
  usuarios = signal<any[]>([]);
  searchTerm = signal(''); 
  
  filteredUsers = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.usuarios().filter(u => 
      u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
    );
  });

  userSelected = output<number>(); 
  canceled = output<void>();

  ngOnInit() {
    this.#usuarioService.getAll().subscribe({
      next: (data) => this.usuarios.set(data),
      error: (err) => console.error('Error:', err)
    });
  }

  select(id: number) {
    this.userSelected.emit(id);
  }

}
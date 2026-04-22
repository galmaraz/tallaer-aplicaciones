import { Component, inject, signal } from '@angular/core';
import { NoteService } from '../../../note/services/note.service';

@Component({
  selector: 'app-main-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './main-dashboard.component.html',
  styleUrl: './main-dashboard.component.css'
})
export class MainDashboardComponent {
  #noteService = inject(NoteService);

  notes = signal<any[]>([]);
  error = signal<string | null>(null);
  loading = signal(true);

  ngOnInit(): void {
    this.#noteService.getAll().subscribe({
      next: (data) => {
        console.log('✅ Backend respondió:', data);
        this.notes.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('❌ Error conectando al backend:', err);
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }
}

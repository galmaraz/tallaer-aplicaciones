import { Component, computed, inject, signal } from '@angular/core';
import { Recordatorio, RecordatorioDto } from '../../models/recordatorio.model';
import { RecordatorioService } from '../../services/recordatorio.service';
import { RecordatorioCardComponent } from '../../components/recordatorio-card/recordatorio-card.component';
import { RecordatorioEditorComponent } from '../../components/recordatorio-editor/recordatorio-editor.component';
import { NoteFilterService } from '../../../note/services/note-filter.service';

type VistaRecordatorio = 'todos' | 'pendientes' | 'completados';

const ordenarPorFecha = (a: Recordatorio, b: Recordatorio): number =>
  new Date(a.fechaRecordatorio).getTime() - new Date(b.fechaRecordatorio).getTime();

@Component({
  selector: 'app-recordatorios',
  standalone: true,
  imports: [RecordatorioCardComponent, RecordatorioEditorComponent],
  templateUrl: './recordatorios.component.html',
})
export class RecordatoriosComponent {
  private readonly recordatorioService = inject(RecordatorioService);
  private readonly filterService = inject(NoteFilterService);

  recordatorios = signal<Recordatorio[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  editorOpen = signal(false);
  selectedRecordatorio = signal<Recordatorio | null>(null);
  vista = signal<VistaRecordatorio>('todos');

  readonly filtrados = computed(() => {
    const q = this.filterService.searchQuery().toLowerCase().trim();
    const vista = this.vista();

    return [...this.recordatorios()]
      .filter(r => {
        if (vista === 'pendientes') return !r.completado;
        if (vista === 'completados') return r.completado;
        return true;
      })
      .filter(r => {
        if (!q) return true;
        return (
          r.titulo.toLowerCase().includes(q) ||
          (r.descripcion ?? '').toLowerCase().includes(q) ||
          (r.note?.title ?? '').toLowerCase().includes(q)
        );
      })
      .sort(ordenarPorFecha);
  });

  readonly pendientes = computed(() => this.recordatorios().filter(r => !r.completado).length);
  readonly completados = computed(() => this.recordatorios().filter(r => r.completado).length);

  ngOnInit(): void {
    this.cargarRecordatorios();
  }

  cargarRecordatorios(): void {
    this.loading.set(true);
    this.error.set(null);

    this.recordatorioService.listar().subscribe({
      next: data => {
        this.recordatorios.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar los recordatorios');
        this.loading.set(false);
      },
    });
  }

  abrirNuevo(): void {
    this.selectedRecordatorio.set(null);
    this.editorOpen.set(true);
  }

  abrirEditar(recordatorio: Recordatorio): void {
    this.selectedRecordatorio.set(recordatorio);
    this.editorOpen.set(true);
  }

  cerrarEditor(): void {
    this.editorOpen.set(false);
    this.selectedRecordatorio.set(null);
  }

  guardarRecordatorio(data: RecordatorioDto): void {
    const seleccionado = this.selectedRecordatorio();

    if (seleccionado?.id) {
      this.recordatorioService.actualizar(seleccionado.id, data).subscribe({
        next: actualizado => {
          this.recordatorios.update(lista =>
            lista.map(item => item.id === actualizado.id ? actualizado : item),
          );
          this.cerrarEditor();
        },
      });
      return;
    }

    this.recordatorioService.crear(data).subscribe({
      next: creado => {
        this.recordatorios.update(lista => [creado, ...lista]);
        this.cerrarEditor();
      },
    });
  }

  eliminarRecordatorio(id: number): void {
    this.recordatorios.update(lista => lista.filter(item => item.id !== id));

    this.recordatorioService.eliminar(id).subscribe({
      error: () => this.cargarRecordatorios(),
    });
  }

  completarRecordatorio(id: number): void {
    this.recordatorioService.completar(id).subscribe({
      next: actualizado => {
        this.recordatorios.update(lista =>
          lista.map(item => item.id === actualizado.id ? actualizado : item),
        );
      },
    });
  }
}

import { Component, computed, effect, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Recordatorio, RecordatorioDto } from '../../models/recordatorio.model';

@Component({
  selector: 'app-recordatorio-editor',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './recordatorio-editor.component.html',
})
export class RecordatorioEditorComponent {
  recordatorio = input<Recordatorio | null>(null);
  noteId = input<number | null>(null);
  noteTitle = input<string | null>(null);

  guardar = output<RecordatorioDto>();
  cerrar = output<void>();

  titulo = signal('');
  descripcion = signal('');
  fechaRecordatorio = signal('');
  completado = signal(false);

  readonly tituloModal = computed(() =>
    this.recordatorio() ? 'Editar recordatorio' : 'Nuevo recordatorio'
  );

  constructor() {
    effect(() => {
      const r = this.recordatorio();

      if (!r) {
        this.titulo.set('');
        this.descripcion.set('');
        this.completado.set(false);
        this.fechaRecordatorio.set(this.convertirAInputDateTime());
        return;
      }

      this.titulo.set(r.titulo);
      this.descripcion.set(r.descripcion ?? '');
      this.completado.set(r.completado);
      this.fechaRecordatorio.set(this.convertirAInputDateTime(r.fechaRecordatorio));
    });
  }

  private convertirAInputDateTime(fecha?: string | Date): string {
    const date = fecha ? new Date(fecha) : new Date();
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
  }

  private obtenerNoteId(): number | null {
    return this.noteId() ?? this.recordatorio()?.note?.id ?? null;
  }

  guardarFormulario(): void {
    const titulo = this.titulo().trim();
    const idNota = this.obtenerNoteId();

    if (!titulo || !idNota) return;

    this.guardar.emit({
      titulo,
      descripcion: this.descripcion().trim(),
      fechaRecordatorio: new Date(this.fechaRecordatorio()).toISOString(),
      completado: this.completado(),
      estado: true,
      noteId: idNota,
    });
  }

  cerrarModal(): void {
    this.cerrar.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).dataset['backdrop'] === 'true') {
      this.cerrarModal();
    }
  }
}

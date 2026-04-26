import { Component, effect, input, output, signal } from '@angular/core';
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

  guardar = output<RecordatorioDto>();
  cerrar = output<void>();

  titulo = signal('');
  descripcion = signal('');
  fechaRecordatorio = signal('');
  completado = signal(false);

  constructor() {
    effect(() => {
      const r = this.recordatorio();

      this.titulo.set(r?.titulo ?? '');
      this.descripcion.set(r?.descripcion ?? '');
      this.completado.set(r?.completado ?? false);
      this.fechaRecordatorio.set(this.convertirAInputDateTime(r?.fechaRecordatorio));
    });
  }

  private convertirAInputDateTime(fecha?: string): string {
    const date = fecha ? new Date(fecha) : new Date();
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
  }

  guardarFormulario(): void {
    const titulo = this.titulo().trim();

    if (!titulo) return;

    this.guardar.emit({
      titulo,
      descripcion: this.descripcion().trim(),
      fechaRecordatorio: new Date(this.fechaRecordatorio()).toISOString(),
      completado: this.completado(),
      estado: true,
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

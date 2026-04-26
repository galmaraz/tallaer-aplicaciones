import { Component, computed, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Recordatorio } from '../../models/recordatorio.model';

@Component({
  selector: 'app-recordatorio-card',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './recordatorio-card.component.html',
})
export class RecordatorioCardComponent {
  recordatorio = input.required<Recordatorio>();

  editar = output<Recordatorio>();
  eliminar = output<number>();
  completar = output<number>();

  estaVencido = computed(() => {
    const r = this.recordatorio();
    return !r.completado && new Date(r.fechaRecordatorio).getTime() < Date.now();
  });

  editarRecordatorio(): void {
    this.editar.emit(this.recordatorio());
  }

  eliminarRecordatorio(event: MouseEvent): void {
    event.stopPropagation();
    const id = this.recordatorio().id;
    if (id) this.eliminar.emit(id);
  }

  completarRecordatorio(event: MouseEvent): void {
    event.stopPropagation();
    const id = this.recordatorio().id;
    if (id) this.completar.emit(id);
  }
}

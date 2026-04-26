// features/home/routes/home.routes.ts
import { Routes } from '@angular/router';
import { MainDashboardComponent } from './page/main-dashboard/main-dashboard.component';
import { MainLayoutComponent } from './page/main-layout/main-layout.component';


export const HOME_ROUTES: Routes = [
  {
    path: '',
    component: MainLayoutComponent,   // ← el layout envuelve todo
    children: [
      {
        path: '',
        component: MainDashboardComponent,   // ← vista por defecto
      },
      {
  path: 'recordatorios',
  loadComponent: () =>
    import('../recordatorio/pages/recordatorio-page/recordatorio-page.component')
      .then(m => m.RecordatorioPageComponent),
},
      // {
      //   path: 'archivados',
      //   loadComponent: () =>
      //     import('../../archived/pages/archived.component')
      //       .then(m => m.ArchivedComponent),
      // },
      // {
      //   path: 'papelera',
      //   loadComponent: () =>
      //     import('../../trash/pages/trash.component')
      //       .then(m => m.TrashComponent),
      // },
      // {
      //   path: 'nota/:id',
      //   loadComponent: () =>
      //     import('../../note/pages/note-detail.component')
      //       .then(m => m.NoteDetailComponent),
      // },
      // ...
    ],
  },
];
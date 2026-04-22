# Fullstack Application (NestJS + Angular)

## Descripción

Este proyecto corresponde a una aplicación fullstack compuesta por:

* Backend desarrollado con NestJS
* Frontend desarrollado con Angular

Ambos proyectos se encuentran organizados dentro de un mismo repositorio y pueden ejecutarse de manera conjunta o independiente.

---

## Estructura del proyecto

```
/project-root
  /backend     Aplicación NestJS (API)
  /frontend    Aplicación Angular
  package.json Configuración de scripts globales
```

---

## Requisitos

Antes de ejecutar el proyecto, asegúrese de tener instalado:

* Node.js (versión 20 o superior)
* npm (versión 10 o superior)

Puede verificar las versiones con los siguientes comandos:

```bash
node -v
npm -v
```

---

## Instalación

Para instalar todas las dependencias del proyecto (backend y frontend), ejecute desde la raíz:

```bash
npm run install:all
```

---

## Ejecución del proyecto

### Ejecución conjunta (backend y frontend)

Desde la raíz del proyecto:

```bash
npm run start:dev
```

Servicios disponibles:

* Backend: http://localhost:3000
* Frontend: http://localhost:4200

---

## Ejecución por separado

### Backend

```bash
cd backend
npm run start:dev
```

### Frontend

```bash
cd frontend
npm start
```

---

## Consideraciones por sistema operativo

### macOS / Linux

Los scripts funcionan directamente sin configuración adicional.

### Windows

En algunos entornos, los comandos encadenados pueden presentar inconvenientes. En ese caso, se recomienda ejecutar backend y frontend en terminales separadas.

---

## Scripts disponibles

En el archivo package.json de la raíz:

```bash
npm run start:backend    Ejecuta únicamente el backend
npm run start:frontend   Ejecuta únicamente el frontend
npm run start:dev        Ejecuta backend y frontend en paralelo
npm run install:all      Instala todas las dependencias
```

---

## Notas

* Verifique que los puertos 3000 y 4200 se encuentren disponibles
* El frontend depende del backend para el consumo de datos
* No se recomienda incluir la carpeta node_modules en el repositorio

---
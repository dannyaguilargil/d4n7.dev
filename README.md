# d4n7.dev

Portafolio personal inspirado en programación y cultura hacker, con águila cibernética interactiva, terminal y diseño adaptable a móviles.

## Desarrollo local

No requiere instalación de dependencias ni compilación:

```sh
python3 -m http.server 4173
```

Abre http://localhost:4173.

## Archivos

- `index.html`: estructura, perfil y contenido.
- `style.css`: estilos y diseño responsive.
- `app.js`: movimiento con perspectiva y cambio de pose del águila, terminal, fichas y controles.

La animación respeta la preferencia de movimiento reducido y puede pausarse manualmente. Las tipografías se cargan desde Google Fonts, con fuentes locales de respaldo.

## Personalización

Ghost Protocol y Syntax Studio son proyectos de muestra. Null Space es un concepto de geometría generativa. Confirma o reemplaza el perfil, tecnologías y proyectos antes de presentar el sitio como portafolio profesional. Añade tus enlaces y contacto reales: el botón actual solo copia el dominio.

## Publicación

El sitio se puede alojar en cualquier servidor de archivos estáticos, sirviendo estos tres archivos desde la raíz. Subir cambios a este repositorio no activa por sí solo un despliegue.

El dominio deseado es `d4n7.dev`. La conexión DNS y el proveedor de hosting se configuran por separado.

## Ilustración del águila

`assets/eagle-idle.png` y `assets/eagle-spread.png` son ilustraciones originales generadas con la herramienta integrada de imágenes. La interacción usa dos imágenes con transición, perspectiva al cursor y flotación; no es un modelo 3D articulado. Pulsa el águila (o usa Enter/Espacio al enfocarla) para desplegar o replegar las alas.

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
- `app.js`: terminal, fichas y controles, terminal, fichas y controles.

La escena 3D respeta la preferencia de movimiento reducido y puede pausarse manualmente. Las tipografías se cargan desde Google Fonts, con fuentes locales de respaldo.

## Personalización

Ghost Protocol y Syntax Studio son proyectos de muestra. Null Space es un concepto de geometría generativa. Confirma o reemplaza el perfil, tecnologías y proyectos antes de presentar el sitio como portafolio profesional. Añade tus enlaces y contacto reales: el botón actual solo copia el dominio.

## Publicación

El sitio se puede alojar en cualquier servidor de archivos estáticos, sirviendo estos tres archivos desde la raíz. Subir cambios a este repositorio no activa por sí solo un despliegue.

El dominio deseado es `d4n7.dev`. La conexión DNS y el proveedor de hosting se configuran por separado.

## Águila 3D con Three.js

`eagle3d.js` construye una escultura mecánica de geometría real: plumas con relieve, pecho acorazado, pico curvo, garras, sensores, conductores luminosos y articulaciones en cuello, hombros y alas. Los materiales físicos reciben iluminación de estudio y reflejos de entorno. No se usan imágenes para el render 3D, salvo la etiqueta del pecho; la ilustración original solo es respaldo cuando WebGL no está disponible.

El scroll controla el recorrido reversible entre títulos. El ave permanece sólida y aletea durante el trayecto, con movimiento de muñecas retrasado respecto de los hombros y una inclinación ligada a la velocidad del scroll. En reposo respira y orienta la cabeza sutilmente hacia el cursor. Pausar movimiento y la preferencia de movimiento reducido desactivan el vuelo.

Three.js 0.180.0 está incluido en `vendor/three/` con su licencia MIT; no requiere servicios externos para cargar la escena. Sirve el proyecto mediante HTTP para los módulos ES. El render limita la densidad de píxeles y se suspende al ocultar la pestaña.

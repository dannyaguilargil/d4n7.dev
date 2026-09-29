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

## Águila Phoenix

La ilustración original se muestrea en una escultura de puntos WebGL con profundidad aproximada, perspectiva y movimiento mecánico sutil. No es una malla 3D articulada. Al cambiar de sección, las partículas se dispersan como cenizas y vuelven a construir la silueta junto al título; la portada reserva una composición de gran tamaño.

El render funciona sin dependencias externas, limita la resolución para móviles, se detiene en pestañas ocultas y respeta movimiento reducido. Sin WebGL se utiliza la ilustración estática. La pausa desactiva tanto la transición como el movimiento ambiental.

### Scroll reversible y reposo nítido

El progreso de cada transición depende exclusivamente de la posición de scroll: se puede detener o invertir al desplazarse. El giro de las cenizas también depende del progreso, sin temporizadores. En reposo se muestra el PNG original de alta resolución con respiración y orientación suave hacia el cursor; las partículas solo aparecen durante la transición. Es una composición 2.5D, no una nueva malla articulada.

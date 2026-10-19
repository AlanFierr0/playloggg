# Rendimiento de Playlogg — 19 de octubre de 2026

## Cambios

- **React:** la traducción usa un contexto de idioma separado del tema y una función estable. Cambiar el tema no notifica a todos los consumidores de traducciones. Las expresiones de traducción se construyen una sola vez. El tablero conserva sus agrupaciones mientras no cambien los juegos o los movimientos optimistas; sus tarjetas memorizadas reciben callbacks estables para no redibujar toda la colección al cambiar el destino del arrastre. El selector de tipo de juego notifica solamente cambios de tipo; una preferencia guardada evita otra detección remota.
- **Lazy loading:** el editor de valoración de Steam se carga cuando hay una sesión activa. La validación de las sesiones persistidas quedó en un módulo pequeño compartido, conservando compatibilidad con sesiones anteriores.
- **Requests y caché:** la búsqueda de perfiles conserva hasta 20 consultas exitosas en memoria mientras está abierta, mantiene cancelación/debounce y deja de buscar perfiles en la pestaña Juegos. Las lecturas de puntuaciones comunitarias deduplican IDs, usan una clave primitiva para la caché por request de React y ejecutan como máximo dos lotes de 100 IDs en paralelo. No se añadió caché pública de datos personales.
- **Precarga:** las tarjetas dejan de precargar automáticamente cada destino y su editor. La navegación principal conserva su comportamiento. Esto evita multiplicar lecturas de sesión y datos antes de que el usuario elija un juego.
- **Postgres:** `catalog_page` separa las palabras una vez por consulta y evita materializar los metadatos de IGDB en todas las filas filtradas. Mantiene filtros, orden, paginación y permisos existentes. No requiere índices nuevos ni modifica registros.
- **Imágenes:** portadas responsivas WebP desde el CDN de IGDB en búsqueda, catálogo, home, ranking y tiers; tamaños reservados y decodificación asíncrona. Se conservan fuentes externas, placeholders y avatares privados. El fallback de búsqueda elimina `srcset` antes de mostrar la portada de reemplazo.
- **Fuentes y scripts:** la fuente local de iconos baja de 230 a 105 nombres utilizados, conservando sus ejes y licencia. Se eliminan las variantes cursivas que no usa la aplicación y la precarga de la fuente de etiquetas. No hay scripts externos bloqueantes que quitar ni se incorporan dependencias.

## Evidencia

| Medición | Antes | Después |
| --- | ---: | ---: |
| Fuente de iconos WOFF2 | 212.012 bytes | 101.972 bytes |
| JS inicial Steam, sin comprimir | 669.940 bytes | 656.120 bytes |
| Catálogo: ejemplo EXPLAIN ANALYZE en producción | 69,416 ms | 27,727 ms |
| Catálogo: bloques temporales escritos/leídos | 367 / 367 | 0 / 0 |

El tamaño inicial de Steam cae aproximadamente 2,1%; la división retrasa código, no elimina las funciones. El JS inicial general crece unos 650 bytes por el helper de portadas y los cambios de hooks; el ahorro principal de transferencia viene de fuentes y requests evitados. No se presenta el peso sin comprimir como tráfico real.

La comparación SQL anterior/nueva devolvió JSON idéntico en siete variantes: consulta vacía, una y varias palabras, género, plataforma, orden comunitario, lotes y filtros inválidos. Se mantuvo `EXECUTE` exclusivo de `service_role`. Los tiempos SQL son ejemplos de una base pequeña con carga variable, no percentiles ni una garantía bajo carga. Los planes confirman la eliminación del derrame temporal. Las lecturas existentes ya usaban lotes; no apareció un RPC por cada rating. Sí se eliminó la separación de palabras por cada fila y se acotó la concurrencia de lotes comunitarios.

## Verificación

Pruebas de unidad para portadas y seguridad de URLs, recuperación de sesiones antiguas, lotes comunitarios, concurrencia y errores. Pruebas de navegador para caché de búsqueda, detección de tipo sin requests al editar puntuaciones, navegación sin precarga de tarjetas, tamaños de portadas y ligaduras de la fuente. También se verifican los flujos existentes de Steam, rankings y arrastre en escritorio y móvil.

Las mediciones Lighthouse usan una build de producción con proveedores y datos locales controlados, emulación móvil, red y CPU simuladas. No son Core Web Vitals de usuarios reales. INP requiere observación de interacciones/campo; TBT se informa como diagnóstico de carga, sin reemplazarlo por INP. Se conservan las tres familias tipográficas aprobadas.

## Medición final de carga y renders

Lighthouse móvil sobre la build final: **LCP 3,62 s**, **CLS 0**, **TBT 29,5 ms**, **449.576 bytes transferidos**, puntuación **90/100**. Una pasada intermedia de esta misma sesión registró LCP 3,98 s, CLS 0, TBT 2.286 ms y 617.417 bytes. No es una comparación completa contra el commit original: esa pasada ya incluía algunos cambios. Los valores absolutos dependen de la simulación y de la máquina local.

Las precargas RSC bajaron de 22 a 8 y los requests totales de 44 a 28. La navegación principal sigue precargando. El ahorro de la fuente de iconos es de 110.040 bytes (51,9%). La build final de la home carga unos 192,8 KB de JS comprimido con gzip; incluye React/Next y el diccionario español compartido.

El LCP todavía supera el presupuesto de 2,5 s en esta simulación. No se declara cumplido: quedan CSS/fuentes críticas y JS compartido para una siguiente medición en producción, manteniendo la tipografía aprobada. No se hizo una reescritura del sistema de traducciones ni se añadieron servicios de telemetría.

La cobertura precisa de V8 sobre un tablero de 16 juegos identificó 16 ejecuciones iniciales de la función de render de tarjeta y **0 ejecuciones adicionales al pasar el arrastre a otra tier** después de iniciarlo. Se verificó en la build de producción con Chromium; las pruebas de arrastre comprueban aparte persistencia, cancelación y recuperación de fallos.

Comprobación local: typecheck y lint correctos, 141 pruebas de unidad, build de producción con proveedores controlados, 121 pruebas de navegador aprobadas y una exclusión deliberada (gesto táctil en escritorio). Después de la última optimización de tarjetas y fuentes, se aprobaron otras 33 comprobaciones afectadas y la misma exclusión. La batería SQL y la recuperación con Postgres real se ejecutan en el workflow de GitHub; Docker no está disponible en esta máquina.

Referencia del CDN de imágenes: [documentación oficial de IGDB](https://api-docs.igdb.com/#images). El tamaño pequeño WebP se comprobó también con una respuesta HTTP 200 del CDN.

La verificación completa en GitHub detectó además una carrera de foco al deshacer una omisión de Steam: `requestAnimationFrame` podía ejecutarse antes del commit de React que habilita el botón. El foco vuelve ahora en un efecto posterior al commit, cuando el botón está habilitado, conservando la prueba de accesibilidad que detectó el problema.

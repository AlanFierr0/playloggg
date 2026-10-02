# Playlogg — revisión general

Fecha: 2 de octubre de 2026. Commit revisado: `ce45ea492742f177383a16c914747690f4f9a486`.

Revisión de código, sitio público en producción, Supabase y Vercel. Este informe propone cambios; no modifica datos, configuración de infraestructura ni comportamiento de la aplicación.

## Resultado

La base de permisos está bien estructurada: las 11 tablas públicas tienen RLS, la propiedad se resuelve con Auth y la base de datos, el bucket de imágenes es privado y la eliminación de perfiles no puede ejecutarse desde roles de navegador. No encontré un acceso indebido confirmado en el alcance revisado. Eso no equivale a una auditoría de penetración completa.

Las prioridades son proteger el uso de servicios externos, completar la protección del navegador, ordenar las migraciones y reducir trabajo innecesario en las consultas. Antes de agregar funciones grandes, conviene resolver esos puntos.

## Hallazgos y acciones propuestas

| Prioridad | Área | Hallazgo verificado | Acción propuesta |
| --- | --- | --- | --- |
| Alta | Seguridad / disponibilidad | La cola de IGDB vive en memoria de una instancia. Search/import autentican al usuario, pero no encontré cuotas compartidas por usuario para búsqueda, importación, Steam o imágenes. Varias instancias pueden consumir simultáneamente la cuota externa. | Límites compartidos por cuenta y operación; controles por IP para acceso anónimo. Responder con tiempo de espera y permitir reintentar. Verificar las reglas de Vercel antes de asumir que están ausentes. |
| Alta | Seguridad del navegador | Las páginas públicas revisadas sirven HSTS, pero no CSP, protección de frames, `X-Content-Type-Options`, `Referrer-Policy` ni `Permissions-Policy` generales. Algunos endpoints sí tienen protección específica. | Añadir `frame-ancestors` y/o `X-Frame-Options`, `nosniff`, política de referencias y permisos. Probar CSP inicialmente en modo de reporte, contemplando Next, fuentes y arte externo. Es prevención adicional; no encontré una inyección confirmada. |
| Alta | Supabase Auth | El asesor de seguridad confirma protección contra contraseñas filtradas desactivada. | Activarla si el plan lo permite y verificar que la política de longitud también esté aplicada en Auth, no solamente en el formulario. Supabase indica que la protección contra filtradas requiere Pro o superior; no propongo contratarlo automáticamente. |
| Alta | Migraciones | Los nombres corresponden, pero 7 de las 16 versiones aplicadas difieren de los archivos locales. Ejemplo: `delete_owned_profile`, local `20261002153000`, aplicada `20261002164955`. | Conciliar el historial con el registro remoto y verificar un despliegue limpio en un entorno aislado. No volver a ejecutar esas migraciones a ciegas ni resetear producción. Comparar definiciones antes de reparar el historial. |
| Media | GitHub / Vercel | `main` no está protegida. Vercel publica desde Git mientras los checks de GitHub corren por separado. El último despliegue estuvo listo antes de que terminara CI, aunque ambos workflows finalmente pasaron. | Mantener el flujo acordado de trabajo en `main`, pero condicionar la publicación de producción a checks exitosos. Evaluar reglas de rama compatibles con ese flujo, sin imponer PR obligatoria. |
| Media | Rendimiento | `getPortfolio` sigue leyendo listas y `getCommunity` lee listas, items y likes que ya no se muestran. La desaparición de UI no eliminó esas dependencias. Además, el éxito de esas consultas sigue siendo necesario para cargar pantallas activas. | Separar los lectores activos de los lectores heredados; conservar los datos, pero dejar de cargarlos en perfil, comunidad y fichas de juegos. Revisar luego las acciones y exports retirados que siguen disponibles. |
| Media | Escalabilidad | Comunidad carga todas las puntuaciones elegibles y eventos, y calcula resultados en JavaScript. Las páginas que usan `getCommunity` pagan ese trabajo; `cache()` deduplica dentro de una petición, no entre todas las visitas. | Agregaciones acotadas en base de datos y consultas específicas por juego. Mantener comprobaciones de publicación/discovery para que una caché no prolongue la exposición tras retirar consentimiento. |
| Media | Steam | Cada `importSteamGame` descarga de nuevo la biblioteca y resuelve el app ID; luego puede consultar metadata otra vez al importar. La UI procesa uno por uno. Los filtros también provocan nuevas lecturas. | Una operación de lote con contexto confiable del servidor, IDs exactos y vigencia breve; reutilizar correspondencias app ID/catálogo. Mantener autorización fresca, no confiar en horas o IDs de catálogo enviados por el cliente. Conservar el progreso real y errores por juego. |
| Media | Supabase | Falta un índice que cubra `profile_activity.game_id` para su clave foránea. Hay 8 avisos de políticas SELECT permisivas múltiples y 3 índices sin uso registrado. | Agregar el índice faltante tras revisar consultas. Evaluar políticas con EXPLAIN y volumen real. No eliminar índices por falta de uso en una aplicación tan nueva. |
| Baja | Producto / texto | `importIgdb` todavía devuelve “Save a log entry or list separately”. Permanecen rutas de Quick rating y Year in Gaming, aunque sus accesos fueron retirados; la API de exportar listas también continúa. | Eliminar el texto de listas y acordar si las funciones retiradas deben desactivarse por completo. Preservar datos y no restaurar botones eliminados. |

Referencias de código: `src/lib/igdb-http.ts:48`, `src/app/actions/catalog.ts:58`, `src/app/actions/steam-library.ts:107`, `src/lib/portfolio.ts:62`, `src/lib/community.ts:59`, `src/proxy.ts:6`, `.github/workflows/checks.yml`.

## Interfaz y funciones que mejoraría

Estas son propuestas visuales o de producto, no errores de seguridad:

1. **Inicio en móvil:** el encabezado ocupa tres filas y aparecen cuatro llamados a la acción antes del catálogo. Mantendría una acción principal y agruparía las secundarias para llegar antes a los juegos. No eliminaría navegación sin aprobación.
2. **Tarjetas:** títulos largos como The Curse of Monkey Island quedan truncados y los nombres de estudios ocupan varias líneas. Usaría dos líneas para el título y un tratamiento compacto para los estudios, con nombre completo accesible al abrir la ficha.
3. **Carga:** no hay archivos `loading.tsx` en las rutas. Agregaría estados de carga para perfil, catálogo, comparación y Steam, respetando la barra de progreso existente. Las navegaciones medidas tardaron aproximadamente 2–4 segundos hasta `networkidle`; no son mediciones de LCP ni una prueba de carga.
4. **Amigos y Compare:** selector de amigos seguidos y búsqueda por nombre/handle, conservando tu perfil como primer lado. Si faltan cinco juegos compartidos, mostrar cuántos faltan y qué juegos comparten; nunca inventar Taste Match.
5. **Steam:** resumen final de importados, omitidos y fallidos, con “Reintentar fallidos”. Para juegos sin correspondencia exacta, ofrecer una revisión manual explícita, sin asociarlos automáticamente por similitud de títulos.
6. **Organización del perfil:** filtro por plataforma y horas, búsqueda en los juegos propios y edición de datos comunes por lotes. Cambios de score, tier y favoritos seguirían independientes.
7. **Descubrimiento temprano:** actualmente hay cero perfiles optados a discovery. El estado vacío es correcto; conviene explicar una acción concreta para invitar a un amigo, en lugar de agregar más secciones vacías o datos de ejemplo.
8. **Cuentas:** conectar Steam a una cuenta de email evitaría perder acceso al importador por el método de login. Requiere diseñar vinculación verificada y conflictos entre cuentas; no se debe fusionar automáticamente.

## Verificaciones realizadas

- Producción: inicio, Games, Login, Compare, Explore profiles y Search en 1440×1000 y 375×812.
- Auditoría automática Axe: sin alertas de las reglas WCAG 2 A/AA y WCAG 2.1 AA ejecutadas en esas 12 visitas. Sin overflow horizontal, errores JavaScript ni imágenes rotas en esas páginas.
- Comprobación adicional en español y tema claro en móvil para inicio, login, Games y Compare. Sin alertas automáticas ni overflow.
- Revisión visual de capturas de inicio, login y comparación. Un chequeo automático limpio no garantiza accesibilidad completa; faltan pruebas manuales exhaustivas de teclado y lector de pantalla.
- `pnpm audit`: cero vulnerabilidades reportadas para las dependencias instaladas, incluyendo desarrollo. Esto no prueba ausencia de vulnerabilidades desconocidas ni secretos históricos.
- GitHub: Application checks y Production deployment smoke terminaron correctamente para el commit revisado.
- Vercel: producción READY en `iad1`, commit correcto. Supabase ACTIVE_HEALTHY en `us-east-1`; las regiones están alineadas.
- Logs de siete días: 8 errores de conexión a Supabase y 7 errores por el antiguo perfil sample, en despliegues anteriores. No se deben atribuir esos fallos al commit actual. La consulta agrupada del despliegue actual mostró respuestas 200, redirects y 404; no se examinó cada petición individual.
- Supabase: 11 tablas públicas con RLS. RPC pública de eliminación no ejecutable por `anon`/`authenticated`. Columnas de identidad Auth del perfil fuera del permiso de lectura anónimo. Bucket privado limitado a WebP de 1 MB.
- Volumen agregado: 1.134 juegos, 142 entradas, 1 perfil y 0 perfiles discoverable. No se modificaron registros ni se reprodujeron operaciones destructivas con usuarios reales.

## Límites de esta revisión

No tuve una sesión de propietario en el navegador automatizado de producción: las pantallas autenticadas se revisaron mediante código y los tests existentes, sin importar juegos, editar perfiles o eliminar datos reales. El conector de detalle de proyecto Vercel falló por un error de validación de argumentos; por eso no confirmo reglas WAF, protección de previews, configuración SMTP/CAPTCHA, límites de Auth, alertas de gasto ni valores de variables de entorno. Tampoco realicé carga agresiva ni escaneo exhaustivo del historial Git.

## Orden sugerido

Primero cuotas de uso, cabeceras y configuración Auth; luego conciliar migraciones y asegurar checks antes de publicar. Después eliminar consultas heredadas y optimizar Steam/comunidad. Finalmente aplicar mejoras visuales y selector de amigos. La vinculación Steam/email necesita una decisión de producto aparte.

Documentación oficial: [Seguridad de contraseñas de Supabase](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection), [índices de claves foráneas](https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys), [cabeceras en Next.js](https://nextjs.org/docs/app/api-reference/config/next-config-js/headers), [protección de despliegues Vercel](https://vercel.com/docs/deployment-protection).

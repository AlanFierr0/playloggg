# Ejecución de la revisión general

Basado en [el informe completo](general-review-2026-10-02.md). Autorizado el 2 de octubre de 2026.

## Decisiones confirmadas

- Desactivar Quick rating, Year in Gaming y exports de listas; conservar sus datos.
- Dejar Steam/email y la resolución de conflictos de identidad para otra etapa.
- Editar por lotes únicamente estado y plataforma. Score, tier, favoritos, horas, reseñas, tags y fecha de finalización conservan sus valores.
- Mantener defaults privados, consentimiento separado para discovery y autorización basada en Auth verificado.
- No contratar planes, fusionar cuentas, resetear infraestructura ni borrar datos personales.

## Plan y resultados

| Fase | Implementación | Estado |
| --- | --- | --- |
| Seguridad | Cabeceras generales; CSP mínima aplicada y política más amplia en modo reporte; cuotas compartidas para búsqueda externa, importación, Steam y avatar | Implementada y verificada |
| Supabase | Conciliar versiones de migraciones; índice de activity; RPC de cuotas y agregaciones con permisos explícitos; regenerar tipos | Aplicada y verificada |
| Rendimiento | Retirar lecturas activas de listas; agregaciones comunitarias acotadas; score por juego; contexto Steam confiable de 30 segundos | Implementado |
| UI | Encabezado móvil en dos filas; CTA principal y secundarias agrupadas; títulos de dos líneas; carga de catálogo, Compare, perfil y Steam; sugerencias de amigos | Implementada |
| Funciones | Filtros de juegos propios en Ranking; edición por lotes; resumen y reintento de importación; búsqueda manual de juegos sin correspondencia; desactivar rutas retiradas | Implementadas |
| Repo y publicación | Checks también en PR; typegen, TypeScript, lint y unit tests dentro del build de producción; pruebas de navegador, commit, CI y smoke | Build y pipeline implementados; gate externo pendiente |

## Seguridad y límites

Las cuotas se consumen mediante una RPC SECURITY INVOKER ejecutable únicamente por `service_role`. Los contadores están en `private.operation_limits`, sin grants ni políticas para roles del navegador. El aviso informativo de RLS sin políticas en esa tabla es deliberado: no existe acceso de usuario final. Los rechazos devuelven tiempo de espera; si no se puede comprobar la cuota, la operación externa falla de forma cerrada. Leer el catálogo y los juegos guardados sigue disponible.

| Operación | Por minuto | Por día |
| --- | ---: | ---: |
| Búsqueda externa | 30 | 600 |
| Importar metadata nueva | 120 | 1.500 |
| Steam: biblioteca, importación y sync | 120 | 1.500 |
| Avatar | 6 | 30 |

Las cuotas corresponden a un Auth user verificado, no a IDs enviados por el cliente. Reutilizar metadata ya guardada no consume cuota de importación nueva. Estos controles de aplicación no sustituyen los límites de Auth del proveedor ni un WAF; la configuración de CAPTCHA, SMTP, previews y WAF no se pudo verificar con el conector disponible.

La CSP aplicada bloquea frames, objetos y cambios de base URL. La política más amplia queda en reporte para comprobar compatibilidad con Next, fuentes y artwork. No hay endpoint central de reportes configurado; no se afirma que exista telemetría CSP centralizada.

Supabase está en Free. La [protección de contraseñas filtradas requiere Pro](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection); no se cambió el plan. El registro y cambio de contraseña conservan la validación de 12–128 caracteres y la verificación de email existente. Activar la protección del proveedor queda pendiente de una decisión sobre el plan.

## Base de datos

Se compararon las definiciones SQL aplicadas con las locales: las 16 migraciones originales coincidían tras normalizar comentarios y espacios. Se renombraron siete archivos a las versiones reales del registro remoto. No se resetearon tablas ni se ejecutaron nuevamente esas migraciones.

La nueva migración aplicada es `20261002184628_review_security_performance.sql`: índice `profile_activity_game_id_idx`, contadores privados y RPC de agregación comunitaria. El índice faltante ya no aparece en Performance Advisor. Los avisos sobre políticas SELECT múltiples e índices sin uso se conservan para evaluar con más volumen; no se eliminan protecciones ni índices por ese indicador aislado.

Las RPC comunitarias son SECURITY INVOKER, respetan RLS y filtran publicación/discovery dentro de la consulta. Los scores requieren cinco perfiles distintos gracias a la PK profile/game. Trending cuenta perfiles distintos con cambio de score en 30 días. El inicio pide solo cinco juegos controversiales y seis reviews; las fichas y exports piden scores para IDs concretos en lotes de 100. Las recomendaciones todavía necesitan puntuaciones individuales, pero se cargan únicamente para usuarios autenticados.

## Steam y organización

La biblioteca se reutiliza como contexto de servidor por un máximo de 30 segundos, limitada a 50 entradas por instancia. La clave incluye Auth user y Steam identity verificados. Cada acción vuelve a verificar ownership; el navegador no puede enviar horas ni un ID de catálogo confiable. Abrir la página y Refresh fuerzan otra lectura; sync siempre lee Steam de nuevo. Vercel puede usar varias instancias: una instancia fría hace una nueva lectura, así que la optimización no garantiza una única descarga global por lote. El matching continúa por app ID exacto; no se guarda una asociación por parecido del nombre.

El popup conserva progreso real y título actual. El resumen distingue importados, omitidos por entrada existente y fallidos; Reintentar fallidos usa los IDs que fallaron. Los juegos sin match tienen un enlace de búsqueda manual, que no importa ni vincula automáticamente.

En Ranking, Organizá tus juegos permite buscar, filtrar plataforma y horas, seleccionar hasta 100 entradas y cambiar estado/plataforma. Es un UPDATE de entradas existentes con predicado de owner; no crea ratings para juegos sin log ni altera otros campos. Horas desconocidas no se interpretan como cero. La actualización no pisa otros campos modificados simultáneamente.

## Verificación

- Las 17 migraciones se aplicaron desde cero en PostgreSQL aislado mediante PGlite, con stubs de Auth/Storage. No es una réplica completa del stack de Supabase.
- Pruebas SQL aisladas: excluir perfiles privados y link-only, retirar consentimiento, umbral de cinco ratings y trending de perfiles distintos.
- `supabase/verify-review-security-performance.sql` ejecutado en Supabase con ROLLBACK: grants, índice, dos requests permitidos y tercero rechazado. Sin cambios persistidos en datos personales.
- Tipos TypeScript regenerados desde el proyecto real.
- 83 pruebas unitarias pasaron; TypeScript y lint pasaron.
- Se ejecutaron 120 escenarios de navegador y se repitieron los afectados tras las correcciones, incluyendo dos nuevos casos de cuotas. La última tanda de 28 pasó completa. Las comprobaciones incluyen UI móvil/escritorio, ambos idiomas/temas, owner isolation, rutas retiradas, Steam, cuotas y bulk edits.
- `pnpm build` pasó con typegen, TypeScript, lint y 83 unit tests antes de compilar.
- Los resultados del commit publicado y el smoke de producción quedan registrados en GitHub Actions y en el cierre de esta tarea.

## Configuración pendiente

El build de producción ya ejecuta verificaciones de tipos, lint y unit tests antes de compilar/publicar. Esto reduce el riesgo de publicar una regresión, pero no constituye un bloqueo basado en todos los jobs de GitHub, especialmente los tests de navegador.

Condicionar el alias de producción a Application checks sigue pendiente: el conector de detalle de proyecto Vercel falla en validación y no hay una credencial de administración local. El repo es privado, por lo que una consulta anónima desde el build no puede comprobar sus runs. No se copió la credencial Git del usuario a Vercel ni se desactivó el despliegue existente. Se necesita configurar una [deployment check](https://vercel.com/docs/cli/project) o un flujo de publicación desde GitHub con acceso Vercel acotado. Este punto no se marca como completado.

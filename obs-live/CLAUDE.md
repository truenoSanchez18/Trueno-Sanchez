# CLAUDE.md — obs-live

Reglas para trabajar en este proyecto.

## Qué es
Administrador del live en OBS. Una sola fuente de verdad (`src/state.js`); el panel
escribe, el overlay y OBS leen. El usuario opera desde el celular durante el live.

## Reglas
- Todo lo visible para el usuario va en español (UI, errores de la API, logs, README).
- Por etapas: terminar una, enseñar capturas (`docs/capturas/etapaN-*.png`, panel a
  390px de ancho y overlay a 1920x1080) y esperar el OK antes de seguir.
- Si algo es ambiguo, una sola pregunta con opciones.
- Sin dependencias nuevas salvo que no haya alternativa razonable (hoy: `yaml`).
- Toda entrada se valida en el servidor contra `teams.yaml`; error 400 con mensaje claro.
- El overlay nunca enseña errores al aire (solo en `?preview`).
- El panel debe usarse con el pulgar: botones de 44px mínimo, sin scroll horizontal.
- `npm test` debe pasar antes de cada commit.

## Etapas
1. Marcador en vivo: `teams.yaml`, `/api/broadcast`, `/scoreboard`, panel "Marcador". ✅
2. Guion por día `shows/AAAA-MM-DD.yaml`, `--show`, selector en panel, validación contra OBS.
3. El tema activo sigue al segmento activo del guion.
4. Preparar el live del día desde la plantilla del usuario (generar, validar, resumen, captura, esperar OK).

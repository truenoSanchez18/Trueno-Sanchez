# obs-live — administrador del live

Bot que administra el live en OBS Studio: marcador, tema activo, cinta de resultados
y (próximas etapas) guion por día validado contra OBS.

## Arrancar

Requisito: Node.js 20 o superior, en la misma compu donde corre OBS.

```bash
cd obs-live
npm install
PANEL_TOKEN=elige-una-clave npm start      # Windows PowerShell: $env:PANEL_TOKEN="..."; npm start
```

La consola imprime las ligas:

| Liga | Para qué |
|---|---|
| `http://localhost:3000/scoreboard` | Overlay que va dentro de OBS |
| `http://localhost:3000/panel` | Panel de control en la compu |
| `http://IP-DE-TU-COMPU:3000/panel?token=...` | Panel en el celular (misma wifi) |

En el celular abre la liga con `?token=` una vez; después se recuerda.

## Conectarlo a OBS (etapa 1)

1. En OBS, en la escena del partido: **Fuentes → + → Navegador**.
2. URL: `http://localhost:3000/scoreboard`, ancho `1920`, alto `1080`.
3. Deja **sin marcar** "Apagar la fuente cuando no sea visible" para que no se reinicie.
4. Ponla hasta arriba de la lista de fuentes para que quede encima del video.

El fondo es transparente. Para ver el overlay en el navegador con fondo de prueba:
`http://localhost:3000/scoreboard?preview`.

Desde la etapa 2 el bot también hablará directo con OBS (escenas y fuentes) por
**obs-websocket**, que ya viene en OBS 28+: *Herramientas → Configuración del servidor
WebSocket → Habilitar*, y copia la contraseña.

## API

| Método | Ruta | Cuerpo |
|---|---|---|
| GET | `/api/teams` | — los 32 equipos de `teams.yaml` y los periodos válidos |
| GET | `/api/broadcast` | — estado actual con los equipos ya resueltos |
| GET | `/api/broadcast/events` | — mismo estado por Server-Sent Events, en cada cambio |
| POST | `/api/broadcast` | parche parcial: `{ home: {team, score}, away: {...}, period, clock, topic, ticker: [...] }` |
| POST | `/api/broadcast/points` | `{ side: "home" \| "away", delta: 3 }` |

Los POST piden el header `x-panel-token` si arrancaste con `PANEL_TOKEN`.
Datos inválidos (equipo que no existe, reloj mal escrito, etc.) regresan 400 con el motivo.

El estado se guarda en `data/state.json`, así que sobrevive a reinicios.

## Pruebas

```bash
npm test
```

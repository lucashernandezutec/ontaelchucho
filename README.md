# Ontaelchucho – Collar inteligente con GPS

Prototipo web (HTML + CSS + JavaScript, sin dependencias) de la app que se vincula a los collares GPS para perros y gatos.

## Funciones
- Mapa con la ubicación de cada mascota (color según su collar)
- Zona segura con radio ajustable y alertas de salida/regreso
- Modo perdido y recorrido reciente
- Reporte vecinal de perros sueltos
- Vincular collares con código de chip
- Historial de alertas

> Las posiciones son **simuladas** en `js/app.js` (función `tick`). Para usar collares reales hay que conectar un backend.

## Cómo ejecutarlo
1. Abrí la carpeta en Visual Studio Code.
2. Instalá la extensión **Live Server** y hacé clic en *Go Live*
   (o simplemente abrí `index.html` en el navegador).

## Estructura
```
index.html      Estructura de la página
css/style.css   Estilos (colores en variables :root)
js/app.js       Lógica: datos, mapa, alertas, vinculación
```

## Subirlo a GitHub
```bash
git init
git add .
git commit -m "Primer prototipo de la app Ontaelchucho"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/ontaelchucho.git
git push -u origin main
```
Para publicarlo gratis: en GitHub, **Settings → Pages → Deploy from a branch → main / (root)**.

## Próximos pasos
- Mapa real (Leaflet + OpenStreetMap)
- Backend que reciba posiciones del chip (MQTT / API REST)
- Cuentas de usuario y notificaciones push
- Base de datos para los reportes vecinales

## Equipo
Lucas Hernández, Zaida Yanibelli, Franco Agostini, Franco Medina, Jhon Medero, Celeste Esnal.

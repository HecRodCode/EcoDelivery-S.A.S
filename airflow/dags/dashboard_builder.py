"""
Construye dashboard_ecodelivery.html: un panel ejecutivo autocontenido
(HTML + SVG + un poco de JS, sin dependencias externas) a partir del
dataframe crudo de pedidos.

Se mantiene separado de etl_pedidos_diario.py para que el DAG solo orqueste
tareas y este módulo concentre el "cómo se ve" del reporte.
"""

from __future__ import annotations

import json
from datetime import date
from typing import Sequence

import pandas as pd

ZONAS_ORDEN = ["norte", "sur", "centro", "occidente", "chapinero"]
ZONA_LABELS = {z: z.capitalize() for z in ZONAS_ORDEN}

ESTADO_ORDEN = ["pendiente", "en_camino", "entregado", "cancelado"]
ESTADO_LABELS = {
    "pendiente": "Pendiente",
    "en_camino": "En camino",
    "entregado": "Entregado",
    "cancelado": "Cancelado",
}
ESTADO_ICONS = {
    "pendiente": "⏳",
    "en_camino": "🚚",
    "entregado": "✓",
    "cancelado": "✕",
}
# El campo `estado` es literalmente un estado del pedido, no una categoría
# arbitraria: por eso usa la paleta de status (fija) en vez de la categórica.
ESTADO_COLOR_VAR = {
    "pendiente": "--warning",
    "en_camino": "--info",
    "entregado": "--good",
    "cancelado": "--critical",
}

CSS = """
:root {
  color-scheme: light;
  --page: #f9f9f7;
  --surface-1: #fcfcfb;
  --text-primary: #0b0b0b;
  --text-secondary: #52514e;
  --muted: #898781;
  --grid: #e1e0d9;
  --baseline: #c3c2b7;
  --border: rgba(11,11,11,0.10);
  --series-blue: #2a78d6;
  --info: #2a78d6;
  --good: #0ca30c;
  --warning: #fab219;
  --serious: #ec835a;
  --critical: #d03b3b;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    color-scheme: dark;
    --page: #0d0d0d;
    --surface-1: #1a1a19;
    --text-primary: #ffffff;
    --text-secondary: #c3c2b7;
    --muted: #898781;
    --grid: #2c2c2a;
    --baseline: #383835;
    --border: rgba(255,255,255,0.10);
    --series-blue: #3987e5;
    --info: #3987e5;
  }
}
* { box-sizing: border-box; }
body {
  margin: 0;
  background: var(--page);
  color: var(--text-primary);
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
}
.wrap { max-width: 1040px; margin: 0 auto; padding: 28px 20px 48px; }
header { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
h1 { font-size: 20px; margin: 0 0 4px; }
.subtitle { color: var(--text-secondary); font-size: 13px; margin: 0; }
.filter { display: flex; align-items: center; gap: 8px; }
.filter label { font-size: 12px; color: var(--text-secondary); }
select {
  font: inherit; font-size: 13px; padding: 6px 10px; border-radius: 6px;
  border: 1px solid var(--border); background: var(--surface-1); color: var(--text-primary);
}
.kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
.tile {
  background: var(--surface-1); border: 1px solid var(--border); border-radius: 10px;
  padding: 14px 16px;
}
.tile .label { font-size: 12px; color: var(--text-secondary); margin: 0 0 6px; }
.tile .value { font-size: 26px; font-weight: 600; margin: 0; }
.card {
  background: var(--surface-1); border: 1px solid var(--border); border-radius: 10px;
  padding: 16px 18px; margin-bottom: 16px;
}
.card h2 { font-size: 14px; margin: 0 0 12px; font-weight: 600; }
.card .caption { font-size: 12px; color: var(--muted); margin: 8px 0 0; }
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
@media (max-width: 720px) {
  .kpi-row { grid-template-columns: repeat(2, 1fr); }
  .two-col { grid-template-columns: 1fr; }
}
svg text { fill: var(--text-secondary); font-size: 11px; font-family: inherit; }
svg .value-label { fill: var(--text-primary); font-size: 11px; font-weight: 600; }
.legend { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 10px; }
.legend .item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-secondary); }
.legend .swatch { width: 10px; height: 10px; border-radius: 2px; display: inline-block; }
footer { color: var(--muted); font-size: 11px; margin-top: 24px; }
"""


def _fmt_money(value: float) -> str:
    if value >= 1_000_000:
        return f"${value / 1_000_000:.1f}M"
    if value >= 1_000:
        return f"${value / 1_000:.1f}K"
    return f"${value:,.0f}"


def _fmt_int(value: float) -> str:
    return f"{value:,.0f}"


def _bar_chart_svg(valores: dict[str, float], y_max: float, unidad_fmt) -> str:
    """Barras verticales (comparar magnitud entre 5 zonas) - un solo hue."""
    width, height = 640, 220
    plot_top, plot_bottom = 10, 170
    plot_h = plot_bottom - plot_top
    n = len(ZONAS_ORDEN)
    slot_w = width / n
    bar_w = 24

    y_max = y_max or 1
    ticks = [0, y_max / 2, y_max]

    parts = [f'<svg viewBox="0 0 {width} {height + 24}" width="100%" role="img">']

    for t in ticks:
        y = plot_bottom - (t / y_max) * plot_h
        parts.append(
            f'<line x1="0" y1="{y:.1f}" x2="{width}" y2="{y:.1f}" stroke="var(--grid)" stroke-width="1"/>'
        )

    parts.append(
        f'<line x1="0" y1="{plot_bottom}" x2="{width}" y2="{plot_bottom}" stroke="var(--baseline)" stroke-width="1"/>'
    )

    for i, zona in enumerate(ZONAS_ORDEN):
        valor = valores.get(zona, 0)
        bar_h = (valor / y_max) * plot_h if y_max else 0
        x = i * slot_w + slot_w / 2 - bar_w / 2
        y = plot_bottom - bar_h
        label_y = max(y - 8, plot_top + 10)
        parts.append(
            f'<rect x="{x:.1f}" y="{y:.1f}" width="{bar_w}" height="{bar_h:.1f}" rx="4" ry="4" fill="var(--series-blue)">'
            f'<title>{ZONA_LABELS[zona]}: {unidad_fmt(valor)}</title></rect>'
        )
        if bar_h > 16:
            parts.append(
                f'<text class="value-label" x="{x + bar_w / 2:.1f}" y="{label_y:.1f}" text-anchor="middle">{unidad_fmt(valor)}</text>'
            )
        parts.append(
            f'<text x="{x + bar_w / 2:.1f}" y="{plot_bottom + 18}" text-anchor="middle">{ZONA_LABELS[zona]}</text>'
        )

    parts.append("</svg>")
    return "".join(parts)


def _line_chart_svg(serie: dict[str, float], fechas: Sequence[str], y_max: float) -> str:
    """Tendencia diaria - una sola serie, area wash + linea + etiqueta en el ultimo punto."""
    width, height = 640, 220
    plot_top, plot_bottom = 10, 170
    plot_h = plot_bottom - plot_top
    n = len(fechas)

    y_max = y_max or 1
    if n <= 1:
        return '<svg viewBox="0 0 640 220" width="100%"><text x="10" y="100">Sin datos suficientes</text></svg>'

    x_step = width / (n - 1)

    def xy(i: int, valor: float) -> tuple[float, float]:
        x = i * x_step
        y = plot_bottom - (valor / y_max) * plot_h
        return x, y

    ticks = [0, y_max / 2, y_max]
    parts = [f'<svg viewBox="0 0 {width} {height + 24}" width="100%" role="img">']
    for t in ticks:
        y = plot_bottom - (t / y_max) * plot_h
        parts.append(
            f'<line x1="0" y1="{y:.1f}" x2="{width}" y2="{y:.1f}" stroke="var(--grid)" stroke-width="1"/>'
        )
    parts.append(
        f'<line x1="0" y1="{plot_bottom}" x2="{width}" y2="{plot_bottom}" stroke="var(--baseline)" stroke-width="1"/>'
    )

    puntos = [xy(i, serie.get(f, 0)) for i, f in enumerate(fechas)]
    linea_d = "M " + " L ".join(f"{x:.1f} {y:.1f}" for x, y in puntos)
    area_d = linea_d + f" L {puntos[-1][0]:.1f} {plot_bottom} L {puntos[0][0]:.1f} {plot_bottom} Z"

    parts.append(f'<path d="{area_d}" fill="var(--series-blue)" opacity="0.1"/>')
    parts.append(f'<path d="{linea_d}" fill="none" stroke="var(--series-blue)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>')

    for i, f in enumerate(fechas):
        x, y = puntos[i]
        valor = serie.get(f, 0)
        parts.append(
            f'<circle cx="{x:.1f}" cy="{y:.1f}" r="3" fill="var(--series-blue)" stroke="var(--surface-1)" stroke-width="2">'
            f'<title>{f}: {_fmt_int(valor)} pedidos</title></circle>'
        )
        if i % max(1, n // 6) == 0 or i == n - 1:
            parts.append(f'<text x="{x:.1f}" y="{plot_bottom + 18}" text-anchor="middle">{f[5:]}</text>')

    ult_x, ult_y = puntos[-1]
    parts.append(
        f'<text class="value-label" x="{ult_x:.1f}" y="{ult_y - 10:.1f}" text-anchor="end">{_fmt_int(serie.get(fechas[-1], 0))}</text>'
    )

    parts.append("</svg>")
    return "".join(parts)


def _status_stacked_bar_svg(conteo: dict[str, int], total: int) -> tuple[str, str]:
    """Parte-del-todo: una sola barra apilada horizontal + leyenda (identidad nunca solo por color)."""
    width, height = 640, 56
    gap = 2
    x = 0
    parts = [f'<svg viewBox="0 0 {width} {height}" width="100%" role="img">']
    legend_items = []

    for idx, estado in enumerate(ESTADO_ORDEN):
        cantidad = conteo.get(estado, 0)
        pct = (cantidad / total) if total else 0
        seg_w = pct * width
        color_var = f"var({ESTADO_COLOR_VAR[estado]})"
        is_first = idx == 0
        is_last = idx == len(ESTADO_ORDEN) - 1
        rx = 4

        seg_w_gapped = max(seg_w - (gap if not is_last else 0), 0)

        clip_id = f"seg{idx}"
        parts.append(
            f'<clipPath id="{clip_id}"><rect x="{x:.1f}" y="0" width="{seg_w_gapped:.1f}" height="{height - 20}" '
            f'rx="{rx if (is_first or is_last) else 0}"/></clipPath>'
        )
        parts.append(
            f'<rect x="{x:.1f}" y="0" width="{seg_w_gapped:.1f}" height="{height - 20}" fill="{color_var}" clip-path="url(#{clip_id})">'
            f'<title>{ESTADO_LABELS[estado]}: {cantidad} ({pct * 100:.0f}%)</title></rect>'
        )

        if seg_w_gapped > 70:
            parts.append(
                f'<text class="value-label" x="{x + seg_w_gapped / 2:.1f}" y="{(height - 20) / 2 + 4:.1f}" '
                f'text-anchor="middle" style="fill:#fff">{ESTADO_ICONS[estado]} {cantidad} ({pct * 100:.0f}%)</text>'
            )

        legend_items.append(
            f'<span class="item"><span class="swatch" style="background:{color_var}"></span>'
            f"{ESTADO_ICONS[estado]} {ESTADO_LABELS[estado]} · {cantidad} ({pct * 100:.0f}%)</span>"
        )
        x += seg_w

    parts.append("</svg>")
    legend_html = f'<div class="legend">{"".join(legend_items)}</div>'
    return "".join(parts), legend_html


def build_dashboard_html(df: pd.DataFrame, generated_at: str) -> str:
    df = df.copy()
    df["fecha_creacion"] = pd.to_datetime(df["fecha_creacion"])
    df["fecha_entrega"] = pd.to_datetime(df["fecha_entrega"])
    df["fecha"] = df["fecha_creacion"].dt.date.astype(str)
    df["monto"] = df["monto"].astype(float)

    todas_las_fechas = sorted(df["fecha"].unique())
    opciones_estado = ["Todos"] + [e for e in ESTADO_ORDEN if e in df["estado"].unique()]

    y_max_zona = df.groupby("zona")["monto"].sum().max() or 1
    y_max_dia = df.groupby("fecha")["id_pedido"].count().max() or 1

    conteo_estado_global = df["estado"].value_counts().to_dict()
    status_svg, status_legend = _status_stacked_bar_svg(conteo_estado_global, len(df))

    escenas = {}
    for filtro in opciones_estado:
        subset = df if filtro == "Todos" else df[df["estado"] == filtro]
        entregados = subset[subset["estado"] == "entregado"].copy()
        entregados["tiempo_min"] = (
            entregados["fecha_entrega"] - entregados["fecha_creacion"]
        ).dt.total_seconds() / 60

        ingreso_total = float(subset["monto"].sum())
        ticket_promedio = float(subset["monto"].mean()) if len(subset) else 0.0
        total_pedidos = int(len(subset))
        tiempo_promedio = float(entregados["tiempo_min"].mean()) if len(entregados) else None

        por_zona = subset.groupby("zona")["monto"].sum().to_dict()
        por_dia = subset.groupby("fecha")["id_pedido"].count().to_dict()

        escenas[filtro] = {
            "kpis": {
                "ingresos": _fmt_money(ingreso_total),
                "ticket": _fmt_money(ticket_promedio),
                "pedidos": _fmt_int(total_pedidos),
                "tiempo": f"{tiempo_promedio:.0f} min" if tiempo_promedio is not None else "—",
            },
            "bar_svg": _bar_chart_svg(por_zona, y_max_zona, _fmt_money),
            "line_svg": _line_chart_svg(por_dia, todas_las_fechas, y_max_dia),
        }

    opciones_html = "".join(
        f'<option value="{f}">{"Todos los estados" if f == "Todos" else ESTADO_LABELS[f]}</option>'
        for f in opciones_estado
    )

    escenas_json = json.dumps(escenas, ensure_ascii=False)

    return f"""<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>EcoDelivery — Panel de operación</title>
<style>{CSS}</style>
</head>
<body>
<div class="wrap">
  <header>
    <div>
      <h1>EcoDelivery — Panel de operación de pedidos</h1>
      <p class="subtitle">Generado automáticamente el {generated_at} · datos en vivo desde la API</p>
    </div>
    <div class="filter">
      <label for="estadoFiltro">Filtrar por estado</label>
      <select id="estadoFiltro">{opciones_html}</select>
    </div>
  </header>

  <div class="kpi-row">
    <div class="tile"><p class="label">Ingresos totales</p><p class="value" id="kpiIngresos">—</p></div>
    <div class="tile"><p class="label">Ticket promedio</p><p class="value" id="kpiTicket">—</p></div>
    <div class="tile"><p class="label">Pedidos</p><p class="value" id="kpiPedidos">—</p></div>
    <div class="tile"><p class="label">Tiempo prom. de entrega</p><p class="value" id="kpiTiempo">—</p></div>
  </div>

  <div class="two-col">
    <div class="card">
      <h2>Ingresos por zona</h2>
      <div id="barChart"></div>
    </div>
    <div class="card">
      <h2>Pedidos por día</h2>
      <div id="lineChart"></div>
    </div>
  </div>

  <div class="card">
    <h2>Distribución de pedidos por estado <span class="caption" style="font-weight:400">(todos los estados, no afectado por el filtro de arriba)</span></h2>
    {status_svg}
    {status_legend}
  </div>

  <footer>EcoDelivery S.A.S. · reporte generado por el DAG etl_pedidos_diario</footer>
</div>

<script>
const ESCENAS = {escenas_json};
const select = document.getElementById("estadoFiltro");

function render(filtro) {{
  const escena = ESCENAS[filtro];
  document.getElementById("kpiIngresos").textContent = escena.kpis.ingresos;
  document.getElementById("kpiTicket").textContent = escena.kpis.ticket;
  document.getElementById("kpiPedidos").textContent = escena.kpis.pedidos;
  document.getElementById("kpiTiempo").textContent = escena.kpis.tiempo;
  document.getElementById("barChart").innerHTML = escena.bar_svg;
  document.getElementById("lineChart").innerHTML = escena.line_svg;
}}

select.addEventListener("change", (e) => render(e.target.value));
render(select.value);
</script>
</body>
</html>
"""

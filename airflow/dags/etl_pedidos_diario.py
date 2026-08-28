"""
DAG: etl_pedidos_diario
EcoDelivery S.A.S. — Pipeline diario de pedidos.

Extrae los pedidos directo de la API REST del backend (no de Postgres:
así el pipeline valida el mismo contrato que consume la app Flutter), calcula:
  1) tiempo promedio de entrega (min) por zona (solo estado='entregado')
  2) cantidad de pedidos por estado
  3) ingresos totales (monto) por zona
  4) serie diaria de pedidos/ingresos (para el gráfico de líneas del dashboard)

y genera un dashboard HTML autocontenido e interactivo con esas métricas.

Salidas (todas en ECODELIVERY_OUTPUT_DIR):
  - pedidos_raw.parquet (dato crudo, insumo intermedio)
  - reporte_pedidos.csv, reporte_pedidos_por_estado.csv, reporte_pedidos_por_dia.csv
  - dashboard_ecodelivery.html (se regenera en cada corrida con los datos más recientes)

Variables de entorno requeridas (ver airflow/.env):
  ECODELIVERY_API_BASE_URL, ECODELIVERY_API_EMAIL, ECODELIVERY_API_PASSWORD
"""

from __future__ import annotations

import logging
import os
from datetime import datetime, timedelta

import pandas as pd
import requests
from airflow import DAG
from airflow.exceptions import AirflowException
from airflow.operators.python import PythonOperator

logger = logging.getLogger(__name__)

API_BASE_URL = os.environ.get("ECODELIVERY_API_BASE_URL", "http://host.docker.internal:3000")
API_EMAIL = os.environ.get("ECODELIVERY_API_EMAIL")
API_PASSWORD = os.environ.get("ECODELIVERY_API_PASSWORD")

OUTPUT_DIR = os.environ.get("ECODELIVERY_OUTPUT_DIR", "/opt/airflow/output")
RAW_TMP_PATH = f"{OUTPUT_DIR}/pedidos_raw.parquet"

ZONAS_ORDEN = ["norte", "sur", "centro", "occidente", "chapinero"]

default_args = {
    "owner": "ecodelivery-data",
    "retries": 2,
    "retry_delay": timedelta(minutes=5),
}


def _obtener_token() -> str:
    if not API_EMAIL or not API_PASSWORD:
        raise AirflowException(
            "Faltan ECODELIVERY_API_EMAIL / ECODELIVERY_API_PASSWORD en el entorno del contenedor."
        )

    response = requests.post(
        f"{API_BASE_URL}/auth/login",
        json={"email": API_EMAIL, "password": API_PASSWORD},
        timeout=10,
    )
    response.raise_for_status()
    return response.json()["accessToken"]


def extraer_pedidos(**context) -> None:
    """Hace login contra la API y trae todos los pedidos vía GET /pedidos."""
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    token = _obtener_token()
    response = requests.get(
        f"{API_BASE_URL}/pedidos",
        headers={"Authorization": f"Bearer {token}"},
        timeout=30,
    )
    response.raise_for_status()
    pedidos = response.json()

    if not pedidos:
        # Cortamos el DAG explícitamente: sin datos no tiene sentido seguir
        # a transformar/cargar, y así el fallo queda visible en el scheduler.
        raise AirflowException("La API no devolvió pedidos. Revisa que el backend tenga datos.")

    df = pd.DataFrame(pedidos)
    df["monto"] = df["monto"].astype(float)

    df.to_parquet(RAW_TMP_PATH, index=False)
    logger.info("Extraídos %s pedidos desde %s/pedidos -> %s", len(df), API_BASE_URL, RAW_TMP_PATH)

    ti = context["ti"]
    ti.xcom_push(key="raw_path", value=RAW_TMP_PATH)
    ti.xcom_push(key="row_count", value=len(df))


def transformar_metricas(**context) -> None:
    """Calcula las 3 métricas pedidas + la serie diaria, y las deja en XCom como JSON."""
    ti = context["ti"]
    raw_path = ti.xcom_pull(task_ids="extraer_pedidos", key="raw_path")
    if not raw_path or not os.path.exists(raw_path):
        raise AirflowException("No se encontró el archivo crudo generado por extraer_pedidos.")

    df = pd.read_parquet(raw_path)
    df["fecha_creacion"] = pd.to_datetime(df["fecha_creacion"])
    df["fecha_entrega"] = pd.to_datetime(df["fecha_entrega"])

    entregados = df[df["estado"] == "entregado"].copy()
    entregados["tiempo_entrega_min"] = (
        entregados["fecha_entrega"] - entregados["fecha_creacion"]
    ).dt.total_seconds() / 60

    # --- 1 y 3: pedidos/ingresos por zona + tiempo promedio de entrega por zona ---
    por_zona = (
        df.groupby("zona")
        .agg(pedidos_totales=("id_pedido", "count"), ingresos_totales=("monto", "sum"))
        .reset_index()
    )
    tiempo_por_zona = (
        entregados.groupby("zona")["tiempo_entrega_min"]
        .mean()
        .reset_index()
        .rename(columns={"tiempo_entrega_min": "tiempo_promedio_entrega_min"})
    )
    reporte_zonas = por_zona.merge(tiempo_por_zona, on="zona", how="left")
    reporte_zonas["tiempo_promedio_entrega_min"] = reporte_zonas["tiempo_promedio_entrega_min"].round(2)
    reporte_zonas["ingresos_totales"] = reporte_zonas["ingresos_totales"].round(2)

    # --- 2: cantidad de pedidos por estado ---
    reporte_estados = df.groupby("estado").size().reset_index(name="cantidad_pedidos")

    # --- 4 (extra, necesaria para el gráfico de líneas/área "pedidos por día") ---
    df["fecha"] = df["fecha_creacion"].dt.date.astype(str)
    reporte_diario = (
        df.groupby("fecha")
        .agg(pedidos_totales=("id_pedido", "count"), ingresos_totales=("monto", "sum"))
        .reset_index()
        .sort_values("fecha")
    )

    if reporte_zonas.empty:
        raise AirflowException("El agregado por zona salió vacío después de transformar.")

    ti.xcom_push(key="reporte_zonas", value=reporte_zonas.to_json(orient="records"))
    ti.xcom_push(key="reporte_estados", value=reporte_estados.to_json(orient="records"))
    ti.xcom_push(key="reporte_diario", value=reporte_diario.to_json(orient="records"))
    logger.info(
        "Métricas calculadas: %s zonas, %s estados, %s días",
        len(reporte_zonas), len(reporte_estados), len(reporte_diario),
    )


def cargar_reporte(**context) -> None:
    """Escribe los CSV finales que alimentan el dashboard."""
    import io

    ti = context["ti"]
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    reporte_zonas = pd.read_json(io.StringIO(ti.xcom_pull(task_ids="transformar_metricas", key="reporte_zonas")))
    reporte_estados = pd.read_json(io.StringIO(ti.xcom_pull(task_ids="transformar_metricas", key="reporte_estados")))
    reporte_diario = pd.read_json(io.StringIO(ti.xcom_pull(task_ids="transformar_metricas", key="reporte_diario")))

    if reporte_zonas.empty:
        raise AirflowException("reporte_zonas llegó vacío a la carga; no se escribe nada para evitar sobreescribir con vacío.")

    ruta_zonas = f"{OUTPUT_DIR}/reporte_pedidos.csv"
    ruta_estados = f"{OUTPUT_DIR}/reporte_pedidos_por_estado.csv"
    ruta_diario = f"{OUTPUT_DIR}/reporte_pedidos_por_dia.csv"

    reporte_zonas.to_csv(ruta_zonas, index=False)
    reporte_estados.to_csv(ruta_estados, index=False)
    reporte_diario.to_csv(ruta_diario, index=False)

    logger.info(
        "Carga completa -> %s (%s filas), %s (%s filas), %s (%s filas)",
        ruta_zonas, len(reporte_zonas),
        ruta_estados, len(reporte_estados),
        ruta_diario, len(reporte_diario),
    )


def generar_dashboard(**context) -> None:
    """Construye el dashboard HTML ejecutivo (ver dashboard_builder.py) a partir del dato crudo.

    Se regenera en cada corrida del DAG, así que siempre refleja el último
    estado de la API. El dropdown de estado funciona como el "segmentador"
    pedido en el enunciado: recalcula KPIs y gráficos sin recargar la página.
    """
    from dashboard_builder import build_dashboard_html

    ti = context["ti"]
    raw_path = ti.xcom_pull(task_ids="extraer_pedidos", key="raw_path")
    df = pd.read_parquet(raw_path)

    generated_at = datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")
    html = build_dashboard_html(df, generated_at)

    output_path = f"{OUTPUT_DIR}/dashboard_ecodelivery.html"
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(html)

    logger.info("Dashboard generado -> %s", output_path)


with DAG(
    dag_id="etl_pedidos_diario",
    description="ETL diario de pedidos EcoDelivery: extrae de la API, calcula métricas y regenera el dashboard.",
    default_args=default_args,
    schedule="@daily",
    start_date=datetime(2026, 1, 1),
    catchup=False,
    tags=["ecodelivery", "etl"],
) as dag:

    t_extraer = PythonOperator(
        task_id="extraer_pedidos",
        python_callable=extraer_pedidos,
    )

    t_transformar = PythonOperator(
        task_id="transformar_metricas",
        python_callable=transformar_metricas,
    )

    t_cargar = PythonOperator(
        task_id="cargar_reporte",
        python_callable=cargar_reporte,
    )

    t_dashboard = PythonOperator(
        task_id="generar_dashboard",
        python_callable=generar_dashboard,
    )

    t_extraer >> t_transformar >> t_cargar >> t_dashboard

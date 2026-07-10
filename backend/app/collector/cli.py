import click
import logging
from ..db.session import SessionLocal
from .openalex import OpenAlexCollector
from .ror import RORCollector
from .orcid import ORCIDCollector
from .grants import GrantsGovCollector
from .patentsview import PatentsViewCollector
from .storage import StorageCoordinator

# Set up logging for the CLI execution
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("collector.cli")


@click.group()
def main():
    """Research Funding & Innovation Intelligence Platform - Collection CLI."""
    pass


@main.command()
@click.option("--query", default="artificial intelligence", help="Search keyword / query.")
@click.option("--limit", default=5, help="Number of records to fetch per collector endpoint.")
@click.option("--export/--no-export", default=True, help="Automatically run CSV/Parquet export after fetch.")
@click.option(
    "--collector",
    type=click.Choice(["openalex", "ror", "orcid", "grants", "patentsview", "all"]),
    default="all",
    help="Specific collector to execute (default: all)."
)
def collect(query, limit, export, collector):
    """
    Triggers API ingestion pipeline and stores details in normalized database.
    """
    db = SessionLocal()
    storage = StorageCoordinator()

    click.echo(f"===========================================================")
    click.echo(f"Starting Ingestion Layer: collector={collector}, query='{query}', limit={limit}")
    click.echo(f"===========================================================")

    try:
        # 1. OpenAlex Ingestion
        if collector in ["openalex", "all"]:
            click.echo("\n--- Running OpenAlex Collector ---")
            col = OpenAlexCollector()
            col.fetch_concepts(db, limit=limit)
            col.fetch_institutions(db, search=query, limit=limit)
            col.fetch_publications(db, search_query=query, limit=limit)
            col.close()

        # 2. ROR Ingestion
        if collector in ["ror", "all"]:
            click.echo("\n--- Running ROR Institution Collector ---")
            col = RORCollector()
            col.fetch_organizations(db, query=query, limit=limit)
            col.close()

        # 3. ORCID Ingestion
        if collector in ["orcid", "all"]:
            click.echo("\n--- Running ORCID Profile Collector ---")
            col = ORCIDCollector()
            col.search_researchers(db, query=query, limit=limit)
            col.close()

        # 4. Grants Ingestion
        if collector in ["grants", "all"]:
            click.echo("\n--- Running Grants.gov Funding Collector ---")
            col = GrantsGovCollector()
            col.fetch_opportunities(db, keyword=query, limit=limit)
            col.close()

        # 5. PatentsView Ingestion
        if collector in ["patentsview", "all"]:
            click.echo("\n--- Running PatentsView Landscaping Collector ---")
            col = PatentsViewCollector()
            col.fetch_patents(db, keyword=query, limit=limit)
            col.close()

        # 6. Optional Table Export
        if export:
            click.echo("\n--- Exporting DB tables to CSV and Parquet files ---")
            summary = storage.export_to_parquet_and_csv(db)
            for tbl, desc in summary.items():
                click.echo(f" - {tbl}: {desc}")

        click.echo("\n===========================================================")
        click.echo("Collection and export processes completed successfully!")
        click.echo("===========================================================")

    except Exception as e:
        click.echo(f"\n[ERROR] Pipeline execution failed: {e}", err=True)
        logger.exception(e)
    finally:
        db.close()


@main.command()
@click.option("--target-dir", default=None, help="Custom export directory override.")
def export(target_dir):
    """
    Utility command to export existing database content to Parquet/CSV.
    """
    db = SessionLocal()
    storage = StorageCoordinator()
    try:
        click.echo("Exporting database tables...")
        summary = storage.export_to_parquet_and_csv(db, target_dir=target_dir)
        for tbl, desc in summary.items():
            click.echo(f" - {tbl}: {desc}")
        click.echo("Export completed successfully.")
    except Exception as e:
        click.echo(f"Export failed: {e}", err=True)
    finally:
        db.close()


if __name__ == "__main__":
    main()

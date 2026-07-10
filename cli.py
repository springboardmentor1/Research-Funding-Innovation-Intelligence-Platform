import click
import logging
from config.settings import settings
from storage.database import SessionLocal, init_db, Institution, Concept, Author, Publication, GrantOpportunity, Patent
from storage.writer import export_to_files
from collectors.openalex import OpenAlexCollector
from collectors.ror import RORCollector
from collectors.orcid import ORCIDCollector
from collectors.grants_gov import GrantsGovCollector
from collectors.patentsview import PatentsViewCollector

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("pipeline.cli")


@click.group()
def main():
    """Research Funding and Innovation Intelligence Platform CLI."""
    pass


@main.command()
@click.option("--query", default="artificial intelligence", help="Query keyword for data fetching.")
@click.option("--limit", default=3, help="Max records to pull per collector endpoint.")
@click.option("--export/--no-export", default=True, help="Trigger Parquet/CSV export after ingestion.")
@click.option(
    "--collector",
    type=click.Choice(["openalex", "ror", "orcid", "grants", "patentsview", "all"]),
    default="all",
    help="Target specific API collector (default: all)."
)
def collect(query, limit, export, collector):
    """Run ingestion pipeline end-to-end to fetch, parse, and save records."""
    # Ensure database tables exist
    click.echo("Initializing SQLite storage tables...")
    init_db()
    
    db = SessionLocal()
    click.echo(f"Ingestion started. Collector: {collector}, Query: '{query}', Limit: {limit}")
    
    try:
        # 1. ROR
        if collector in ["ror", "all"]:
            click.echo("\n--- [ROR Ingestion] ---")
            c = RORCollector()
            raw = c.fetch_organizations(query=query)
            parsed = c.parse(raw)[:limit]
            c.save(db, parsed)
            c.close()
            click.echo(f"Stored {len(parsed)} ROR organizations.")

        # 2. OpenAlex
        if collector in ["openalex", "all"]:
            click.echo("\n--- [OpenAlex Ingestion] ---")
            c = OpenAlexCollector()
            raw = c.fetch_works(query=query, limit=limit)
            parsed = c.parse(raw)
            c.save(db, parsed)
            c.close()
            click.echo(f"Stored {len(parsed)} publications.")

        # 3. ORCID
        if collector in ["orcid", "all"]:
            click.echo("\n--- [ORCID Ingestion] ---")
            c = ORCIDCollector()
            raw = c.search_researchers(query=query, limit=limit)
            parsed = c.parse(raw)
            c.save(db, parsed)
            c.close()
            click.echo(f"Stored {len(parsed)} researcher profiles.")

        # 4. Grants.gov
        if collector in ["grants", "all"]:
            click.echo("\n--- [Grants.gov Ingestion] ---")
            c = GrantsGovCollector()
            raw = c.fetch_opportunities(keyword=query, limit=limit)
            parsed = c.parse(raw)
            c.save(db, parsed)
            c.close()
            click.echo(f"Stored {len(parsed)} funding opportunities.")

        # 5. PatentsView
        if collector in ["patentsview", "all"]:
            click.echo("\n--- [USPTO PatentsView Ingestion] ---")
            c = PatentsViewCollector()
            raw = c.fetch_patents(keyword=query, limit=limit)
            parsed = c.parse(raw)
            c.save(db, parsed)
            c.close()
            click.echo(f"Stored {len(parsed)} patent records.")

        click.echo("\nIngestion layer run completed successfully.")

        # Export if requested
        if export:
            click.echo("\n--- [CSV & Parquet Exporting] ---")
            exports = export_to_files(db)
            for tbl, desc in exports.items():
                click.echo(f" - {tbl}: {desc}")

    except Exception as e:
        click.echo(f"Error during ingestion run: {e}", err=True)
        logger.exception(e)
    finally:
        db.close()


@main.command()
@click.option("--json-format", "-j", is_flag=True, help="Output statistics in JSON format.")
def stats(json_format):
    """Print count metrics of database tables."""
    db = SessionLocal()
    try:
        metrics = {
            "institutions": db.query(Institution).count(),
            "concepts": db.query(Concept).count(),
            "authors": db.query(Author).count(),
            "publications": db.query(Publication).count(),
            "grants": db.query(GrantOpportunity).count(),
            "patents": db.query(Patent).count(),
        }
        if json_format:
            import json
            click.echo(json.dumps(metrics, indent=4))
        else:
            click.echo("Current database record statistics:")
            for key, val in metrics.items():
                click.echo(f" - {key.capitalize()}: {val}")
    except Exception as e:
        click.echo(f"Error reading statistics: {e}", err=True)
    finally:
        db.close()


@main.command()
@click.option("--dir", "target_dir", default=None, help="Target export path override.")
def export(target_dir):
    """Trigger manual export of database tables to Parquet/CSV files."""
    db = SessionLocal()
    try:
        click.echo("Exporting database tables...")
        exports = export_to_files(db, export_dir=target_dir)
        for tbl, desc in exports.items():
            click.echo(f" - {tbl}: {desc}")
        click.echo("Export completed.")
    except Exception as e:
        click.echo(f"Export failed: {e}", err=True)
    finally:
        db.close()


if __name__ == "__main__":
    main()

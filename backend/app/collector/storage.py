import os
import logging
import pandas as pd
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import select, and_, or_
from ..db.session import engine, Base
from ..models import (
    Institution,
    Concept,
    Author,
    Publication,
    GrantOpportunity,
    Patent
)
from ..core.config import settings

logger = logging.getLogger("collector.storage")


class StorageCoordinator:
    """
    Coordinates storage of collected data into the database
    and exports them to CSV and Parquet formats.
    """

    def __init__(self):
        # Auto-create all registered tables if they do not exist
        try:
            logger.info("Initializing database tables if not exists...")
            Base.metadata.create_all(bind=engine)
            logger.info("Database tables initialized successfully.")
        except Exception as e:
            logger.error(f"Error initializing database tables: {e}")

    def upsert_institution(
        self,
        db: Session,
        name: str,
        ror_id: Optional[str] = None,
        openalex_id: Optional[str] = None,
        country_code: Optional[str] = None,
        type_: Optional[str] = None,
        homepage_url: Optional[str] = None,
    ) -> Institution:
        """Upsert research institution details."""
        inst = None
        # Try finding by ROR ID
        if ror_id:
            inst = db.query(Institution).filter(Institution.ror_id == ror_id).first()
        # Fallback to OpenAlex ID
        if not inst and openalex_id:
            inst = db.query(Institution).filter(Institution.openalex_id == openalex_id).first()

        if inst:
            # Update fields
            if ror_id:
                inst.ror_id = ror_id
            if openalex_id:
                inst.openalex_id = openalex_id
            inst.name = name
            if country_code:
                inst.country_code = country_code
            if type_:
                inst.type = type_
            if homepage_url:
                inst.homepage_url = homepage_url
        else:
            # Create new
            inst = Institution(
                ror_id=ror_id,
                openalex_id=openalex_id,
                name=name,
                country_code=country_code,
                type=type_,
                homepage_url=homepage_url,
            )
            db.add(inst)

        db.commit()
        db.refresh(inst)
        return inst

    def upsert_concept(
        self,
        db: Session,
        openalex_id: str,
        display_name: str,
        level: Optional[int] = None,
        description: Optional[str] = None,
    ) -> Concept:
        """Upsert scientific concept/topic."""
        concept = db.query(Concept).filter(Concept.openalex_id == openalex_id).first()
        if concept:
            concept.display_name = display_name
            if level is not None:
                concept.level = level
            if description:
                concept.description = description
        else:
            concept = Concept(
                openalex_id=openalex_id,
                display_name=display_name,
                level=level,
                description=description,
            )
            db.add(concept)

        db.commit()
        db.refresh(concept)
        return concept

    def upsert_author(
        self,
        db: Session,
        name: str,
        orcid_id: Optional[str] = None,
        openalex_id: Optional[str] = None,
        primary_institution_id: Optional[int] = None,
    ) -> Author:
        """Upsert researcher/author profile."""
        author = None
        if orcid_id:
            author = db.query(Author).filter(Author.orcid_id == orcid_id).first()
        if not author and openalex_id:
            author = db.query(Author).filter(Author.openalex_id == openalex_id).first()

        if author:
            author.name = name
            if orcid_id:
                author.orcid_id = orcid_id
            if openalex_id:
                author.openalex_id = openalex_id
            if primary_institution_id:
                author.primary_institution_id = primary_institution_id
        else:
            author = Author(
                name=name,
                orcid_id=orcid_id,
                openalex_id=openalex_id,
                primary_institution_id=primary_institution_id,
            )
            db.add(author)

        db.commit()
        db.refresh(author)
        return author

    def upsert_publication(
        self,
        db: Session,
        openalex_id: str,
        title: str,
        doi: Optional[str] = None,
        publication_year: Optional[int] = None,
        journal: Optional[str] = None,
        citation_count: int = 0,
        concept_id: Optional[int] = None,
        authors: Optional[List[Author]] = None,
        abstract: Optional[str] = None,
    ) -> Publication:
        """Upsert publication/work record and manage author associations."""
        pub = db.query(Publication).filter(Publication.openalex_id == openalex_id).first()
        
        # Generate authors_str from authors list
        authors_str = None
        if authors:
            author_names = [a.name for a in authors]
            authors_str = ", ".join(author_names)
        
        if pub:
            pub.title = title
            pub.doi = doi
            pub.publication_year = publication_year
            pub.year = publication_year  # Compatibility
            pub.journal = journal
            pub.citation_count = citation_count
            pub.citations = citation_count  # Compatibility
            pub.authors_str = authors_str
            pub.abstract = abstract
            if concept_id:
                pub.concept_id = concept_id
        else:
            pub = Publication(
                openalex_id=openalex_id,
                title=title,
                doi=doi,
                publication_year=publication_year,
                year=publication_year,  # Compatibility
                journal=journal,
                citation_count=citation_count,
                citations=citation_count,  # Compatibility
                concept_id=concept_id,
                authors_str=authors_str,
                abstract=abstract,
            )
            db.add(pub)

        # Synchronize many-to-many author list
        if authors is not None:
            # We assign unique authors
            unique_authors = {a.id: a for a in authors}.values()
            pub.authors = list(unique_authors)

        db.commit()
        db.refresh(pub)
        return pub

    def upsert_grant(
        self,
        db: Session,
        opportunity_id: str,
        title: str,
        funding_agency: Optional[str] = None,
        category: Optional[str] = None,
        close_date: Optional[str] = None,
        description: Optional[str] = None,
        max_amount: Optional[float] = None,
        min_amount: Optional[float] = None,
    ) -> GrantOpportunity:
        """Upsert funding opportunities details."""
        grant = db.query(GrantOpportunity).filter(GrantOpportunity.opportunity_id == opportunity_id).first()
        if grant:
            grant.title = title
            grant.funding_agency = funding_agency
            grant.category = category
            grant.close_date = close_date
            grant.description = description
            grant.max_amount = max_amount
            grant.min_amount = min_amount
        else:
            grant = GrantOpportunity(
                opportunity_id=opportunity_id,
                title=title,
                funding_agency=funding_agency,
                category=category,
                close_date=close_date,
                description=description,
                max_amount=max_amount,
                min_amount=min_amount,
            )
            db.add(grant)

        db.commit()
        db.refresh(grant)
        return grant

    def upsert_patent(
        self,
        db: Session,
        patent_number: str,
        title: str,
        filing_date: Optional[str] = None,
        abstract: Optional[str] = None,
        assignee: Optional[str] = None,
        status: Optional[str] = None,
        citations: Optional[int] = 0,
    ) -> Patent:
        """Upsert patent record details."""
        patent = db.query(Patent).filter(Patent.publication_number == patent_number).first()
        if not patent:
            patent = db.query(Patent).filter(Patent.application_number == patent_number).first()
        
        if patent:
            patent.title = title
            if assignee is not None:
                patent.assignee = assignee
            if status is not None:
                patent.status = status
            if abstract is not None:
                patent.abstract = abstract
            if citations is not None:
                patent.citations = citations
            if filing_date is not None:
                from datetime import datetime
                patent.filing_date = datetime.strptime(filing_date, "%Y-%m-%d") if filing_date else None
        else:
            from datetime import datetime
            patent = Patent(
                publication_number=patent_number,
                title=title,
                assignee=assignee,
                status=status,
                abstract=abstract,
                citations=citations,
                filing_date=datetime.strptime(filing_date, "%Y-%m-%d") if filing_date else None,
            )
            db.add(patent)

        db.commit()
        db.refresh(patent)
        return patent

    def export_to_parquet_and_csv(self, db: Session, target_dir: Optional[str] = None) -> Dict[str, str]:
        """
        Loads all collector database tables into pandas dataframes and
        exports them as Parquet and CSV files for portability.
        """
        if not target_dir:
            # Use settings.EXPORT_DIR from the base workspace root
            # Make sure it works relative to workspace root
            target_dir = settings.EXPORT_DIR

        # Ensure directory path is absolute
        if not os.path.isabs(target_dir):
            base_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            target_dir = os.path.join(base_path, target_dir)

        os.makedirs(target_dir, exist_ok=True)
        logger.info(f"Exporting tables to: {target_dir}")

        tables = {
            "institutions": Institution,
            "concepts": Concept,
            "authors": Author,
            "publications": Publication,
            "grants": GrantOpportunity,
            "patents": Patent,
        }

        exports_summary = {}

        for table_name, model_class in tables.items():
            query = db.query(model_class).all()
            data = []
            
            # Extract basic dictionaries representing row contents
            for row in query:
                row_dict = {}
                for column in row.__table__.columns:
                    val = getattr(row, column.name)
                    # Convert date formats if needed
                    row_dict[column.name] = val
                data.append(row_dict)

            df = pd.DataFrame(data)

            # Export to Parquet and CSV
            csv_path = os.path.join(target_dir, f"{table_name}.csv")
            parquet_path = os.path.join(target_dir, f"{table_name}.parquet")

            if df.empty:
                # Write empty files with structure or handle empty gracefully
                df = pd.DataFrame(columns=[c.name for c in model_class.__table__.columns])

            df.to_csv(csv_path, index=False)
            df.to_parquet(parquet_path, index=False)
            exports_summary[table_name] = f"Exported {len(df)} rows"

        logger.info(f"Export completed: {exports_summary}")
        return exports_summary

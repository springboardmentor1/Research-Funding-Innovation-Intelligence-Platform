import json
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database.db import Base


class ProfileHistory(Base):
    """Stores a snapshot of the research profile each time it is saved."""
    __tablename__ = "profile_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    # Snapshot of profile fields at save time
    bio = Column(Text, default="", nullable=True)
    organization = Column(String(255), default="", nullable=True)
    department = Column(String(255), default="", nullable=True)
    career_stage = Column(String(100), nullable=True)
    institution_type = Column(String(100), nullable=True)
    region = Column(String(100), nullable=True)

    research_domains_json = Column("research_domains", Text, default="[]", nullable=False)
    keywords_json = Column("keywords", Text, default="[]", nullable=False)
    linked_publications_json = Column("linked_publications", Text, default="[]", nullable=False)
    linked_patents_json = Column("linked_patents", Text, default="[]", nullable=False)

    h_index = Column(Integer, default=0, nullable=False)
    total_citations = Column(Integer, default=0, nullable=False)

    # What changed in this save (auto-generated summary)
    change_summary = Column(Text, default="", nullable=True)

    saved_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )

    user = relationship("User", backref="profile_history")

    # ── JSON property accessors ─────────────────────────
    @property
    def research_domains(self):
        try:
            return json.loads(self.research_domains_json or "[]")
        except Exception:
            return []

    @research_domains.setter
    def research_domains(self, value):
        self.research_domains_json = json.dumps(value if isinstance(value, list) else [])

    @property
    def keywords(self):
        try:
            return json.loads(self.keywords_json or "[]")
        except Exception:
            return []

    @keywords.setter
    def keywords(self, value):
        self.keywords_json = json.dumps(value if isinstance(value, list) else [])

    @property
    def linked_publications(self):
        try:
            return json.loads(self.linked_publications_json or "[]")
        except Exception:
            return []

    @linked_publications.setter
    def linked_publications(self, value):
        self.linked_publications_json = json.dumps(value if isinstance(value, list) else [])

    @property
    def linked_patents(self):
        try:
            return json.loads(self.linked_patents_json or "[]")
        except Exception:
            return []

    @linked_patents.setter
    def linked_patents(self, value):
        self.linked_patents_json = json.dumps(value if isinstance(value, list) else [])

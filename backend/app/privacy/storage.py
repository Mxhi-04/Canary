import sqlite3
from contextlib import contextmanager
from datetime import UTC, date, datetime, timedelta
from pathlib import Path

from backend.app.privacy.access import Actor


class Store:
    def __init__(self, path: Path):
        self.path = path
        path.parent.mkdir(parents=True, exist_ok=True)
        with self.connect() as db:
            db.execute("PRAGMA journal_mode=WAL")
            db.executescript("""
                CREATE TABLE IF NOT EXISTS reports (
                    unit TEXT NOT NULL,
                    day TEXT NOT NULL,
                    category TEXT NOT NULL,
                    count INTEGER NOT NULL CHECK (count BETWEEN 0 AND 100000),
                    received_day TEXT,
                    PRIMARY KEY (unit, day, category)
                );
                CREATE TABLE IF NOT EXISTS audit (
                    occurred_at TEXT NOT NULL,
                    subject TEXT NOT NULL,
                    role TEXT NOT NULL,
                    route TEXT NOT NULL,
                    outcome TEXT NOT NULL
                );
                CREATE INDEX IF NOT EXISTS audit_age ON audit(occurred_at);
            """)
            columns = {column[1] for column in db.execute("PRAGMA table_info(reports)")}
            if "received_day" not in columns:
                db.execute("ALTER TABLE reports ADD COLUMN received_day TEXT")

    @contextmanager
    def connect(self):
        db = sqlite3.connect(self.path, timeout=10)
        try:
            with db:
                yield db
        finally:
            db.close()

    def load(self, cutoff: date):
        with self.connect() as db:
            rows = db.execute(
                "SELECT unit, day, category, count, received_day FROM reports WHERE day >= ?",
                (cutoff.isoformat(),),
            )
            counts, late = {}, set()
            for unit, day, category, count, received in rows:
                when = date.fromisoformat(day)
                key = (unit, when, category)
                counts[key] = count
                if received and date.fromisoformat(received) > when + timedelta(days=1):
                    late.add(key)
            return counts, late

    def save(self, updates: dict, actor: Actor, cutoff: date, received: date):
        with self.connect() as db:
            db.executemany(
                """
                INSERT INTO reports (unit, day, category, count, received_day) VALUES (?, ?, ?, ?, ?)
                ON CONFLICT (unit, day, category) DO UPDATE SET count = excluded.count
            """,
                [
                    (u, d.isoformat(), c, n, received.isoformat())
                    for (u, d, c), n in updates.items()
                ],
            )
            db.execute("DELETE FROM reports WHERE day < ?", (cutoff.isoformat(),))
            self._audit(db, actor, "ingest", "accepted")

    def audit(self, actor: Actor, route: str, outcome: str = "read"):
        with self.connect() as db:
            self._audit(db, actor, route, outcome)

    @staticmethod
    def _audit(db, actor, route, outcome):
        now = datetime.now(UTC)
        db.execute(
            "INSERT INTO audit VALUES (?, ?, ?, ?, ?)",
            (now.isoformat(), actor.subject, actor.role, route, outcome),
        )
        db.execute(
            "DELETE FROM audit WHERE occurred_at < ?", ((now - timedelta(days=30)).isoformat(),)
        )

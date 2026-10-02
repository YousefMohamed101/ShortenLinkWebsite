CREATE TABLE IF NOT EXISTS Users (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  username  TEXT NOT NULL UNIQUE,
  email     TEXT NOT NULL UNIQUE,
  password  TEXT,
  joined_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS Links (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  link_name    TEXT NOT NULL,
  shorten_code TEXT UNIQUE,
  Url          TEXT NOT NULL,
  created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  user_id      INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_links_user_id ON Links(user_id);

CREATE TABLE IF NOT EXISTS ClickAnalytics (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  link_id      INTEGER NOT NULL,
  ip_address   TEXT,
  country_code TEXT,
  user_agent   TEXT,
  origin       TEXT,
  clicked_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (link_id) REFERENCES Links(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_clicks_link_id ON ClickAnalytics(link_id);
CREATE INDEX IF NOT EXISTS idx_clicks_link_time ON ClickAnalytics(link_id, clicked_at);

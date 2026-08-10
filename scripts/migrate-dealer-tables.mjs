import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0,i).trim(), l.slice(i+1).trim()]; })
);

const db = createClient({ url: env.DATABASE_URL, authToken: env.TURSO_AUTH_TOKEN });

const statements = [
  `CREATE TABLE IF NOT EXISTS Dealer (
    id              TEXT PRIMARY KEY,
    email           TEXT NOT NULL UNIQUE,
    passwordHash    TEXT NOT NULL,
    companyName     TEXT NOT NULL,
    contactName     TEXT NOT NULL,
    phone           TEXT NOT NULL,
    address         TEXT NOT NULL,
    city            TEXT NOT NULL,
    eik             TEXT NOT NULL,
    vatRegistered   INTEGER NOT NULL DEFAULT 0,
    vatNumber       TEXT,
    status          TEXT NOT NULL DEFAULT 'PENDING',
    discountPercent INTEGER NOT NULL DEFAULT 0,
    notes           TEXT,
    createdAt       DATETIME NOT NULL DEFAULT (datetime('now')),
    updatedAt       DATETIME NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE INDEX IF NOT EXISTS Dealer_status_idx ON Dealer(status)`,

  `CREATE TABLE IF NOT EXISTS DealerOrder (
    id        TEXT PRIMARY KEY,
    dealerId  TEXT NOT NULL,
    status    TEXT NOT NULL DEFAULT 'new',
    total     REAL NOT NULL,
    notes     TEXT,
    createdAt DATETIME NOT NULL DEFAULT (datetime('now')),
    updatedAt DATETIME NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (dealerId) REFERENCES Dealer(id)
  )`,
  `CREATE INDEX IF NOT EXISTS DealerOrder_dealerId_idx ON DealerOrder(dealerId)`,
  `CREATE INDEX IF NOT EXISTS DealerOrder_status_idx  ON DealerOrder(status)`,

  `CREATE TABLE IF NOT EXISTS DealerOrderItem (
    id          TEXT PRIMARY KEY,
    orderId     TEXT NOT NULL,
    productId   INTEGER,
    productName TEXT NOT NULL,
    productSlug TEXT NOT NULL,
    quantity    INTEGER NOT NULL,
    unitPrice   REAL NOT NULL,
    retailPrice REAL NOT NULL,
    color       TEXT,
    image       TEXT,
    FOREIGN KEY (orderId) REFERENCES DealerOrder(id) ON DELETE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS DealerOrderItem_orderId_idx ON DealerOrderItem(orderId)`,
];

for (const sql of statements) {
  await db.execute(sql);
  console.log('✓', sql.slice(0, 60).replace(/\s+/g, ' ').trim() + '…');
}

await db.close();
console.log('\nDealer tables created successfully.');

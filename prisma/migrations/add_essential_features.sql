-- Add essential e-commerce features
-- Run this migration: npx prisma migrate dev --name add_essential_features

-- Guest Sessions for guest checkout
CREATE TABLE IF NOT EXISTS guest_sessions (
    id TEXT PRIMARY KEY,
    session_id TEXT UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    cart_data JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_guest_sessions_session_id ON guest_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_guest_sessions_email ON guest_sessions(email);
CREATE INDEX IF NOT EXISTS idx_guest_sessions_expires_at ON guest_sessions(expires_at);

-- Stock Alerts
CREATE TABLE IF NOT EXISTS stock_alerts (
    id TEXT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    product_id TEXT NOT NULL,
    variant_id TEXT,
    notified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    notified_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_stock_alerts_product_id ON stock_alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_email ON stock_alerts(email);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_notified ON stock_alerts(notified);

-- Abandoned Carts
CREATE TABLE IF NOT EXISTS abandoned_carts (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    email VARCHAR(255) NOT NULL,
    cart_data JSONB NOT NULL,
    cart_value DECIMAL(12, 2) NOT NULL,
    reminders_sent INTEGER NOT NULL DEFAULT 0,
    recovered BOOLEAN NOT NULL DEFAULT FALSE,
    recovered_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    last_reminder TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_abandoned_carts_email ON abandoned_carts(email);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_recovered ON abandoned_carts(recovered);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_created_at ON abandoned_carts(created_at);

-- Returns
CREATE TYPE return_status AS ENUM ('pending', 'approved', 'rejected', 'received', 'refunded', 'completed');

CREATE TABLE IF NOT EXISTS returns (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    order_item_ids TEXT[] NOT NULL,
    reason TEXT NOT NULL,
    reason_details TEXT,
    status return_status NOT NULL DEFAULT 'pending',
    refund_amount DECIMAL(12, 2) NOT NULL,
    restock_fee DECIMAL(12, 2),
    shipping_cost DECIMAL(12, 2),
    return_label VARCHAR(500),
    received_date TIMESTAMP,
    refunded_date TIMESTAMP,
    images TEXT[],
    admin_notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_returns_order_id ON returns(order_id);
CREATE INDEX IF NOT EXISTS idx_returns_status ON returns(status);

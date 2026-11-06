
-- +goose Up
ALTER TABLE products
ADD COLUMN low_stock_threshold NUMERIC NOT NULL DEFAULT 5
CHECK (low_stock_threshold >= 0);

-- +goose Down
ALTER TABLE products
DROP COLUMN low_stock_threshold;

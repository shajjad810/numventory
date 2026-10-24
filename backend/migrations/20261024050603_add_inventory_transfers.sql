-- +goose Up

-- Allow TRANSFER as an inventory transaction type.
ALTER TABLE inventory_transactions
DROP CONSTRAINT inventory_transactions_transaction_type_check;

ALTER TABLE inventory_transactions
ADD CONSTRAINT inventory_transactions_transaction_type_check
CHECK (
    transaction_type IN (
        'RECEIVING',
        'PRODUCTION',
        'SHIPPING',
        'WASTE',
        'TRANSFER'
    )
);

-- Track where transferred inventory comes from and goes to.
ALTER TABLE inventory_transactions
ADD COLUMN from_location_id BIGINT REFERENCES locations(id),
ADD COLUMN to_location_id BIGINT REFERENCES locations(id);

-- +goose Down

ALTER TABLE inventory_transactions
DROP COLUMN from_location_id,
DROP COLUMN to_location_id;

ALTER TABLE inventory_transactions
DROP CONSTRAINT inventory_transactions_transaction_type_check;

ALTER TABLE inventory_transactions
ADD CONSTRAINT inventory_transactions_transaction_type_check
CHECK (
    transaction_type IN (
        'RECEIVING',
        'PRODUCTION',
        'SHIPPING',
        'WASTE'
    )
);
package graph

import "github.com/jackc/pgx/v5/pgxpool"

// Resolver holds dependencies used by GraphQL resolvers.
type Resolver struct {
	DB *pgxpool.Pool
}

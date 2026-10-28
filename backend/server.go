package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"

	"github.com/shajjadhossen/numventory/backend/graph"
	"github.com/shajjadhossen/numventory/backend/internal/auth"
	"github.com/shajjadhossen/numventory/backend/internal/database"
)

func main() {
	ctx := context.Background()

	db, err := database.Connect(ctx)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	log.Println("Database connection successful!")

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	srv := handler.NewDefaultServer(
		graph.NewExecutableSchema(
			graph.Config{
				Resolvers: &graph.Resolver{
					DB: db,
				},
			},
		),
	)

	http.Handle("/", playground.Handler("Numventory GraphQL", "/query"))
	http.Handle("/query", auth.Middleware(srv))

	log.Printf("Numventory API running at http://localhost:%s/", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

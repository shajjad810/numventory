package main

import (
	"context"
	"fmt"
	"log"

	"github.com/shajjadhossen/numventory/backend/internal/database"
)

func main() {
	ctx := context.Background()

	db, err := database.Connect(ctx)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	fmt.Println("Numventory API starting...")
	fmt.Println("Database connection successful!")
}

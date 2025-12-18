export async function up(knex) {
  await knex.schema.createTable("room_strokes", (table) => {
    table.increments("id").primary();
    table.text("room_id").notNullable();
    table.text("stroke_data").notNullable(); // Storing stringified JSON
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    table
      .foreign("room_id")
      .references("id")
      .inTable("rooms")
      .onDelete("CASCADE");
    
    // Ensure one row per room to prevent infinite growth if we are just backing up full state
    // Or we could have multiple rows. For whiteboards, usually it's one large state object.
    // Let's add a unique constraint so we can use ON CONFLICT UPDATE
    table.unique("room_id");
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("room_strokes");
}

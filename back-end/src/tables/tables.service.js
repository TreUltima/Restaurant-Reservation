const knex = require("../db/connection");

const create = (table) => 
  knex("tables")
  .insert(table)
  .returning("*");

const read = (table_id) => 
  knex("tables")
  .first("*")
  .where({ table_id });

const updateReservation = (reservation_id, status) => 
  knex("reservations")
  .where({ reservation_id })
  .update({ status });

const list = () => 
  knex("tables")
  .select("*")
  .orderBy("table_name");

const readReservation = (reservation_id) => 
  knex("reservations")
  .first("*")
  .where({ reservation_id });

const occupied = (table_id, reservation_id) => 
  knex("tables")
  .where({ table_id })
  .update({ reservation_id, status: "occupied" });

const free = (table_id) => 
  knex("tables")
  .where({ table_id })
  .update({ reservation_id: null, status: "free" });

module.exports = { 
  list, 
  create, 
  read, 
  occupied, 
  free, 
  readReservation, 
  updateReservation 
};
const knex = require("../db/connection.js");

function list(reservation_date) {
  return knex("reservations")
    .select("*")
    .where({ reservation_date })
    .whereNot({ status: "finished" })
    .orderBy("reservation_time");
}

function search(mobile_number) {
  return knex("reservations")
      .select("*")
      .where("mobile_number", "like", `${mobile_number}%`)
      .orderBy("reservation_date");
}

function read(reservation_id) {
  return knex("reservations").select("*").where({ reservation_id }).first();
}

async function create(reservation) {
  const createdRecords = await knex("reservations")
    .insert(reservation)
    .returning("*");
  return createdRecords[0];
}

async function update(updatedRes) {
  console.log("updatedRes", updatedRes);
  const createdRecords = await knex("reservations")
    .select("*")
    .where({ reservation_id: updatedRes.reservation_id })
    .update(updatedRes, "*");
  return createdRecords[0];
}

async function updateStatus(reservation_id, status) {
  const createdRecords = await knex("reservations")
    .select("*")
    .where({ reservation_id })
    .update({ status: status }, "*");
  return createdRecords[0];
}

module.exports = {
  list,
  search,
  read,
  create,
  update,
  updateStatus,
};

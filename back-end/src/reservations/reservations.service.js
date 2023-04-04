const knex = require("../db/connection");

const create = (reservation) => {
  return knex("reservations")
  .insert(reservation)
  .returning("*");
};

const read = (reservation_id) => {
  return knex("reservations")
    .select("*")
    .where({ reservation_id })
    .first();
};

const update = (reservation_id, status) => {
  return knex("reservations")
    .where({ reservation_id })
    .update({ status });
};

const edit = (reservation_id, reservation) => {
  return knex("reservations")
    .where({ reservation_id })
    .update({ ...reservation })
    .returning("*");
};

const list = (date, mobile_number) => {
  if (date) {
    return knex("reservations")
      .select("*")
      .where({ reservation_date: date })
      .orderBy("reservation_time", "asc");
  }

  if (mobile_number) {
    return knex("reservations")
      .select("*")
      .where("mobile_number", "like", `${mobile_number}%`);
  }

  return knex("reservations").select("*");
};

module.exports = {
  create,
  read,
  update,
  edit,
  list,
};

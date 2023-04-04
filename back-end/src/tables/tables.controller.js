const service = require("./tables.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");


async function validateData(request, response, next) {
  if (!request.body.data) {
    return next({ status: 400, message: "Body must include a data object" });
  }

  next();
}

async function validateBody(request, response, next) {
  const { table_name, capacity } = request.body.data;

  if (!table_name || table_name === "") {
    return next({ status: 400, message: "'table_name' field cannot be empty" });
  }

  if (table_name.length < 2) {
    return next({
      status: 400,
      message: "'table_name' field must be at least 2 characters",
    });
  }

  if (!capacity || capacity === "") {
    return next({ status: 400, message: "'capacity' field cannot be empty" });
  }

  if (typeof capacity !== "number") {
    return next({ status: 400, message: "'capacity' field must be a number" });
  }

  if (capacity < 1) {
    return next({
      status: 400,
      message: "'capacity' field must be at least 1",
    });
  }

  next();
}

async function validateReservation(request, response, next) {
  const { reservation_id } = request.body.data;

  if (!reservation_id) {
    return next({
      status: 400,
      message: `reservation_id field must be included in the body`,
    });
  }

  const reservation = await service.readReservation(Number(reservation_id));

  if (!reservation) {
    return next({
      status: 404,
      message: `reservation_id ${reservation_id} does not exist`,
    });
  }

  response.locals.reservation = reservation;

  next();
}

async function validateTable(request, response, next) {
  const { table_id } = request.params;
  const table = await service.read(table_id);

  if (!table) {
    return next({
      status: 404,
      message: `table id ${table_id} does not exist`,
    });
  }

  response.locals.table = table;

  next();
}

async function validateSeatedTable(request, response, next) {
  if (response.locals.table.status !== "occupied") {
    return next({ status: 400, message: "this table is not occupied" });
  }

  next();
}

async function validateSeat(request, response, next) {
  const { table, reservation } = response.locals;

  if (table.status === "occupied") {
    return next({
      status: 400,
      message: "the table you selected is currently occupied",
    });
  }

  if (reservation.status === "seated") {
    return next({
      status: 400,
      message: "the reservation you selected is already seated",
    });
  }

  if (table.capacity < reservation.people) {
    return next({
      status: 400,
      message: `the table you selected does not have enough capacity to seat ${reservation.people} people`,
    });
  }

  next();
}

async function create(request, response) {
  const { reservation_id, status, ...data } = request.body.data;

  if (reservation_id) {
    await service.updateReservation(reservation_id, "seated");
    data.status = "occupied";
  } else {
    data.status = "free";
  }

  const [res] = await service.create(data);
  response.status(201).json({ data: res });
}

async function list(request, response) {
  const res = await service.list();
  response.json({ data: res });
}

async function update(request, response) {
  await service.occupied(
    response.locals.table.table_id,
    response.locals.reservation.reservation_id
  );
  await service.updateReservation(
    response.locals.reservation.reservation_id,
    "seated"
  );

  response.status(200).json({ data: { status: "seated" } });
}

async function destroy(request, response) {
  const data = await service.updateReservation(
    response.locals.table.reservation_id,
    "finished"
  );
  await service.free(response.locals.table.table_id);
  response.status(200).json({ data });
}


module.exports = {
  list: asyncErrorBoundary(list),
  create: [
    asyncErrorBoundary(validateData),
    asyncErrorBoundary(validateBody),
    asyncErrorBoundary(create),
  ],
  update: [
    asyncErrorBoundary(validateData),
    asyncErrorBoundary(validateTable),
    asyncErrorBoundary(validateReservation),
    asyncErrorBoundary(validateSeat),
    asyncErrorBoundary(update),
  ],
  destroy: [
    asyncErrorBoundary(validateTable),
    asyncErrorBoundary(validateSeatedTable),
    asyncErrorBoundary(destroy),
  ],
};
const errorHandler = (err, req, res, next) => {
	let message = err.message || "Internal Server Error";
	let statusCode = err.statusCode || 500;

	if (err.name === "SequelizeValidationError") {
		const fields = err.errors.map(field => field.path);
		message = `These fields should not be empty: ${fields.join(", ")}`;
		statusCode = 400;
	}

	if (err.name === "SequelizeUniqueConstraintError") {
		const field = err.errors.map(error => error.path)[0];
		message = `The ${field} is already taken`;
		statusCode = 400;
	}

	res.status(statusCode).json({ success: "false", message });
};

module.exports = errorHandler;

/*eslint-env node, es6 */
"use strict";

module.exports = (app, server, sock) => {
	app.use("/node", require("./routes/myNode")(sock));
};
/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, newcap:0*/
/*eslint-env node, es6 */
"use strict";
var express = require("express");
var async = require("async");

module.exports = function (sock) {
	var app = express.Router();
	var userScope = null;

	//recieve client data
	sock.on('client_data', function (data) {
		//console.log(data.letter);
		var params = data.letter.split(",");
		var MATERIAL_NUMBER = params[0].toString();
		var BATCH_DATE = params[1];
		var MATERIAL_DESCRIPTION = params[2].toString();
		var COUNTRY = params[3].toString();
		var PROCESS_FLAG = params[4].toString();
		var RUNID = Number(params[5]);

		var inputParams = {
			MATERIAL_NUMBER: MATERIAL_NUMBER,
			BATCH_DATE: BATCH_DATE,
			MATERIAL_DESCRIPTION: MATERIAL_DESCRIPTION,
			COUNTRY: COUNTRY,
			PROCESS_FLAG: PROCESS_FLAG,
			RUNID: RUNID
		};

		let client = require("@sap/hana-client");
		//Lookup HANA DB Connection from Bound HDB Container Service
		const xsenv = require("@sap/xsenv");
		let hanaOptions = xsenv.getServices({
			hana: {
				tag: "hana"
			}
		});

		/*
		//Create DB connection with options from the bound service
		let conn = client.createConnection();
		var connParams = {
			serverNode: hanaOptions.hana.host + ":" + hanaOptions.hana.port,
			uid: hanaOptions.hana.user,
			pwd: hanaOptions.hana.password,
			CURRENTSCHEMA: hanaOptions.hana.schema
		};
		
		//connect
		conn.connect(connParams, (err) => {
			if (err) {
				console.log(`ERROR: ${JSON.stringify(err)}`);
			} else {
				conn.exec(`SELECT * 
				             FROM "ZFILEUPLOAD_DUMMY"`, (err, result) => {
					if (err) {
						console.log(`ERROR: ${JSON.stringify(err)}`);
					} else {
						conn.disconnect();
						console.log(result);
					}
				});
			}
			return null;
		});
		*/

		var hanaConfig = {
			host: hanaOptions.hana.host,
			port: hanaOptions.hana.port,
			user: hanaOptions.hana.user,
			password: hanaOptions.hana.password,
			CURRENTSCHEMA: hanaOptions.hana.schema
		};

		var hdbext = require('@sap/hdbext');
		hdbext.createConnection(hanaConfig, function (error, client) {
			if (error) {
				console.error(error);
			}

			hdbext.loadProcedure(client, null, "insertData", function (err, sp) {
				sp(inputParams, (err, parameters, results) => {
					if (err) {
						console.log("errB: " + err);
					}
				});
			});
		});
	});

	app.get("/getSessionInfo", (req, res) => {
		sock.emit('date', {
			'date': 'FFFFFF'
		});

		var userContext = req.authInfo;
		var result = JSON.stringify({
			userContext: userContext
		});
		res.type("application/json").status(200).send(result);
	});

	return app;
};
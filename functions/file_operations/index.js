'use strict';
const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const catalyst = require('zcatalyst-sdk-node');
const FOLDER_ID = 3296000000680817;
const app = express();
app.use(express.json());
app.use(fileUpload());

app.get('/getFileDetails', async (req, res) => {
	try {
		const app = catalyst.initialize(req);
		const folderData = await app.filestore().getFolderDetails(FOLDER_ID);
		const fileDetails = folderData.toJSON().file_details;
		const fileData = [];
		for (const data of fileDetails) {
			fileData.push({
				"File Name": data.file_name,
				"File ID": data.id,
				"File Size": data.file_size,
				"Uploaded By": data.created_by.email_id,
				"Uploaded Time": data.created_time,
				"Folder ID": data.folder_details
			});
		}
		res.status(200).send(fileData);
	} catch (error) {
		res.status(500).send({
			"status": "Internal Server Error",
			"message": error
		})
	}
});

app.post('/uploadFile', async (req, res) => {
	try {
		const app = catalyst.initialize(req);
		await req.files.data.mv(`${__dirname}/uploads/${req.files.data.name}`);
		await app.filestore().folder(FOLDER_ID).uploadFile({
			code: fs.createReadStream(`${__dirname}/uploads/${req.files.data.name}`),
			name: req.files.data.name
		});
		res.status(200).send({
			"status": "success",
			"message": "File Uploaded Successfully"
		})
	} catch (error) {
		res.status(500).send({
			"status": "Internal Server Error",
			"message": error
		})
	}
});

app.delete('/deleteFile/:id', async (req, res) => {
	try {
		const app = catalyst.initialize(req);
		await app.filestore().folder(FOLDER_ID).deleteFile(req.params.id);
		res.status(200).send({
			"status": "success",
			"message": "File Deleted Successfully"
		})
	} catch (error) {
		res.status(500).send({
			"status": "Internal Server Error",
			"message": error
		})
	}
});

app.put('/updateFile/:id', async (req, res) => {

	try {
		const app = catalyst.initialize(req);
		await app.filestore().folder(FOLDER_ID).deleteFile(req.params.id);
		await req.files.data.mv(`${__dirname}/uploads/${req.files.data.name}`);
		await app.filestore().folder(FOLDER_ID).uploadFile({
			code: fs.createReadStream(`${__dirname}/uploads/${req.files.data.name}`),
			name: req.files.data.name
		});
		res.status(200).send({
			"status": "success",
			"message": "File Updated Successfully"
		})
	} catch (error) {
		res.status(500).send({
			"status": "Internal Server Error",
			"message": error
		})
	}
});

app.get('/downloadFile/:id', async (req, res) => {
	try {
		const app = catalyst.initialize(req);
		const fileObject = await app.filestore().folder(FOLDER_ID).downloadFile(req.params.id);
		res.writeHead(200, {
			'Content-Length': fileObject.length,
			'Content-Disposition': `attachment; filename="${req.query.fileName}"`,
		});
		res.end(fileObject);
	} catch (error) {
		res.status(500).send({
			"status": "Internal Server Error",
			"message": error
		})
	}
});
module.exports = app;
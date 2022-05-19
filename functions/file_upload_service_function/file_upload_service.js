const express = require("express");
const catalyst = require("zcatalyst-sdk-node");
const formidable = require('formidable');
const fs = require('fs');

const app = express();

async function moveFile(fromFile, toFile) {
    return new Promise((resolve, reject) => {
        console.log('about to writeFile ');
        // const tempFile = fs.readFileSync(fromFile);
        const tempFile = await fs.promises.readFile(fromFile);

        //   await fs.writeFileSync(toFile, tempFile);

        await fs.promises.writeFile(toFile, tempFile);
        resolve();
    });
}

app.post('/upload', (req, res) => {
    console.log(' in upload ');

    const catalystApp = catalyst.initialize(req);
    const filestore = catalystApp.filestore();

    let form = new formidable.IncomingForm();

    form.parse(req, function(err, fields, files) {
        if (err) next(err);

        filePath = files.file.path;
        fileDir = __dirname + '/' + files.file.name;
        incomingFileName = files.file.name;

        console.log(' filename  ' + incomingFileName + '   fileDir is   ' + fileDir + '    path ' + filePath);

        return moveFile(filePath, fileDir)
            .then(() => {
                return filestore
                    .folder('3296000000603097')
                    .uploadFile({
                        code: fs.createReadStream(fileDir),
                        name: incomingFileName
                    });
            })
            .then((uploadedFile) => {
                console.log('File Uploaded');
                console.log(uploadedFile);
                //This is the text file which was uploaded
                res.send('File Uploaded ' + uploadedFile.id + ' name  ' + uploadedFile.file_name);
                // res.send("/baas/v1/project/3296000000601526/folder/3296000000603097/file/" + uploadedFile.id + "/download");
            })
            .catch((err) => {
                console.log("Error here " + err);
                res.send("Failure in File Upload  " + JSON.stringify(err));
            });


    });
})

app.get('/download', (req, res) => {

    console.log('in download');
    console.log(req.query);

    let fileId = req.query.fileId;
    const filename = req.query.filename;
    const catalystApp = catalyst.initialize(req);

    const filestore = catalystApp.filestore();

    //To make the browser download the file instead of displaying it, you need to set a "Content-Disposition: attachment" header.

    filestore.folder('3296000000603097').downloadFile(fileId).then((audioFileObject) => {
        res.setHeader('Content-Disposition', 'attachment; filename=' + filename);
        res.setHeader('Content-Type', 'audio/mpeg');
        //	res.attatchment();
        res.send(audioFileObject);
    }).catch(err => {
        res.send("Error occurred during download of audio file ......" + err);
    })
});

module.exports = app;
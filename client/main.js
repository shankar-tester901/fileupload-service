async function displayFileDetails() {
    const response = await fetch("/server/file_operations/getFileDetails", { method: "GET" })
    const fileData = await response.json();
    if (fileData.length > 0) {
        for (const data of fileData) {
            data.Download = `<a href="/server/file_operations/downloadFile/${data['File ID']}?fileName=${data['File Name']}">&#x21e9;</a>`;
            data.Update = `<label for=${data['File ID']} style="cursor: pointer;"> <span class="glyphicon glyphicon-folder-open" aria-hidden="true">&#x270E;</span>
                        <input type="file" id=${data['File ID']} onchange="updateFile(${data['File ID']})" style="display:none"> </label>`
            data.Delete = `<button onclick="deleteFile(${data['File ID']},'${data['File Name']}')">&#128465;</button>`
        }
        renderTable(fileData);
    } else {
        var divContainer = document.getElementById("tableData");
        divContainer.innerHTML = "No Files have been Uploaded Yet";
    }
}

async function uploadfile() {

    try {
        document.getElementById("status").innerHTML = "Uploading ... &#10227;"
        var file = document.getElementById("customFile").files[0];
        let fileObj = new FormData();
        fileObj.append("data", file);
        const response = await fetch("/server/file_operations/uploadFile", { method: "POST", body: fileObj })
        const data = await response.json();
        if (response.status === 200) {
            document.getElementById("status").innerHTML = data.message;
            alert(data.message)
            setTimeout(function () {
                window.location.reload();
            }, 2000);
        }
    } catch (e) {
        console.log(e);
        alert("Error. Please try again after sometime.");
    }
}

async function updateFile(fileId) {

    try {
        var file = document.getElementById(fileId).files[0];
        let fileObj = new FormData();
        fileObj.append("data", file);
        const response = await fetch("/server/file_operations/updateFile/" + fileId, { method: "PUT", body: fileObj })
        const data = await response.json();
        if (response.status === 200) {
            alert(data.message)
            setTimeout(function () {
                window.location.reload();
            }, 2000);
        }
    } catch (e) {
        console.log(e);
        alert("Error. Please try again after sometime.");
    }
}

async function deleteFile(fileId, fileName) {

    try {
        if (confirm('Are you sure you want to delete ' + fileName + '?')) {
            const response = await fetch("/server/file_operations/deleteFile/" + fileId, { method: "DELETE" })
            const data = await response.json();
            if (response.status === 200) {
                alert(data.message);
                setTimeout(function () {
                    window.location.reload();
                }, 2000);
            }
        }
    } catch (e) {
        console.log(e);
        alert("Error. Please try again after sometime.");
    }
}

function renderTable(respData) {
    var col = [];
    for (var i = 0; i < respData.length; i++) {
        for (var key in respData[i]) {
            if (col.indexOf(key) === -1) {
                col.push(key);
            }
        }
    }
    var table = document.createElement("table");
    table.classList.add("ca-table-view");
    table.setAttribute('id', 'dataTable');
    var tr = table.insertRow(-1);
    for (var i = 0; i < col.length; i++) {
        var th = document.createElement("th");
        th.innerHTML = col[i];
        tr.appendChild(th);
    }
    for (var i = 0; i < respData.length; i++) {

        tr = table.insertRow(-1);

        for (var j = 0; j < col.length; j++) {
            var tabCell = tr.insertCell(-1);
            tabCell.innerHTML = respData[i][col[j]];
        }
    }
    var divContainer = document.getElementById("tableData");
    divContainer.innerHTML = "";
    divContainer.appendChild(table);
}
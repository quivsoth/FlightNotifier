var socket = io();
socket.on('onDerpUpdated', UpdateDerp);
socket.on('onDerpInserted', InsertDerp);
getDerps();


function InsertDerp(data) {
  console.log("insert");
}

function UpdateDerp(data) {
    console.log("update");
    var id = $('#' + data._id);
    id.empty();
    id.append("<td>" + data.derpId +
        "</td><td>" + data.appName +
        "</td><td>" + data.startTime +
        "</td><td>" + data.endTime +
        "</td><td>" + data.severity +
        "</td><td>" + data.slackChannel + "</td>");
}

function BuildDerps(data) {
    $.each(data, function (index, item) {
        $("#tblFlights").append("<tr id=" + item._id + "><td>" +
                                            item.derpId + "</td><td>" +
                                            item.appName + "</td><td>" +
                                            item.startTime + "</td><td>" +
                                            item.endTime +  "</td><td>" +
                                            item.severity +  "</td><td>" +
                                            item.slackChannel + "</td><td>" +
                                "</td></tr>");
    });
}

function getDerps() {
    $.get('http://localhost:3000/api/derp', (data) => {
        BuildDerps(data);
    })
}

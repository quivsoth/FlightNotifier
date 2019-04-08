const cache = new apolloboost.InMemoryCache();
const link = new apolloboost.HttpLink({ uri: 'https://gql-flighthub.azurewebsites.net/api/http-entry' });
const client = new apolloboost.ApolloClient({ cache, link });
const gql = apolloboost.gql;
const mom = moment;
const apiBaseUrl = 'http://gql-flighthub.azurewebsites.net';
const axiosConfig = {}

function startConnection(connection) {
    console.log('Starting connection to SignalR...')
    connection.start()
        .then(function () { console.log('SignalR Connected!') })
        .catch(function (err) {
            console.error(err)
            setTimeout(function () { startConnection(connection) }, 2000)
        })
}

function getConnectionInfo() {
    console.log('Get SignalR connection info');                                             
    return axios.post(`${apiBaseUrl}/api/SignalRInfo/flights`, null, axiosConfig)          
        .then(function (resp) { return resp.data })
        .catch(function () { return {} })
}

console.log('QUERY http-entry for flight stats data');

client.query({
    query: gql
        `{
        getFlightsArrivingToday{
            flightId
            flightNumber
            departureAirport{iata}
            departureDate{dateLocal}
            arrivalDate{dateLocal}
            airportResources{
                arrivalTerminal
                arrivalGate
            }
            status
       } 
    }`
}).then(result => {
    BuildFlights(result);
    getConnectionInfo().then(function (info) {
        let accessToken = info.accessToken
        const options = {
            accessTokenFactory: function () {
                if (accessToken) {
                    const _accessToken = accessToken
                    accessToken = null
                    return _accessToken
                } else {
                    return getConnectionInfo().then(function (info) {
                        return info.accessToken
                    })
                }
            }
        }

        const connection = new signalR.HubConnectionBuilder()
            .withUrl(info.url, options)
            .build()


        connection.on('flightUpdated', flightUpdated)

        connection.onclose(function () {
            console.log('SignalR disconnected')
            setTimeout(function () { startConnection(connection) }, 2000)
        })

        startConnection(connection);

    });
}).catch(error => console.error(error));


var hashtable = {};
hashtable['A'] = 'Active';
hashtable['C'] = 'Cancelled';
hashtable['D'] = 'Diverted';
hashtable['DN'] = 'Data Source Needed';
hashtable['L'] = 'Not Operational';
hashtable['R'] = 'Redirected';
hashtable['S'] = 'Scheduled';
hashtable['U'] = 'Unknown';

function BuildFlights(data) {
    console.log('Building flights');

    var dataArray = data.data.getFlightsArrivingToday;

    for (var i = 0; i < dataArray.length; i++) {
        const flight = dataArray[i];
        const arrivalTerminal = flight.airportResources && flight.airportResources.arrivalTerminal || " ";
        const arrivalGate = flight.airportResources && flight.airportResources.arrivalGate || " ";

        $("#tblFlights").append(
            "<tr id=" + flight.flightId + 
            "><td>" + flight.flightNumber + 
            "</td><td>" + flight.departureAirport.iata + 
            "</td><td>" + mom(flight.departureDate.dateLocal).format("hh:mm a") + 
            "</td><td>" + mom(flight.arrivalDate.dateLocal).format("hh:mm a") + 
            "</td><td>" + arrivalTerminal + 
            " " + arrivalGate + 
            "</td><td>" + hashtable[flight.status] + 
            "</td></tr>");

    }

    console.log('Flight table built!');
}

function flightUpdated(updatedFlight) {
   console.log("SignalR - flight change found");
   const flightRow = document.getElementById(updatedFlight.$v.flightId.$v);

    if(flightRow) {
        console.log("change - updating flight...");
        var id = $('#' + updatedFlight.$v.flightId.$v);
        id.empty();
        buildUpdatedRow(id, updatedFlight, false);
    }
    else {
        console.log("change - adding flight...");
        buildUpdatedRow($("#tblFlights"), updatedFlight, true);
    }
    console.log("Update complete");
  }

  function buildUpdatedRow(tableOrRow, updatedFlight, newFlight)
  {
      const arrivalTerminal = updatedFlight.$v.airportResources && updatedFlight.$v.airportResources.$v.arrivalTerminal.$v || " ";
      const arrivalGate = updatedFlight.$v.airportResources && updatedFlight.$v.airportResources.$v.arrivalGate.$v|| " ";
      var start = "";
      var end = "";
      
      if (newFlight) {
        start = "<tr id=" + updatedFlight.$v.flightId.$v + ">";
        end = "</tr>";
      }

      tableOrRow.append( start + 
        "<td>" + updatedFlight.$v.flightNumber.$v +
        "</td><td>" + updatedFlight.$v.departureAirport.$v.iata.$v +
        "</td><td>" + mom(updatedFlight.$v.departureDate.$v.dateLocal.$v).format("hh:mm a") +
        "</td><td>" + mom(updatedFlight.$v.arrivalDate.$v.dateLocal.$v).format("hh:mm a") +
        "</td><td>" + arrivalTerminal + 
        " " + arrivalGate +
        "</td><td>" + hashtable[updatedFlight.$v.status.$v] + 
        "</td>" + end);
  }
document.getElementById('myForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    // Capture form data
    const formData = {
        generalCategory: document.getElementById('generalCategory').value,
        associatedPersons: document.getElementById('associatedPersons').value,
        places: document.getElementById('places').value,
        institutions: document.getElementById('institutions').value,
        events: document.getElementById('events').value,
        typeOfEvent: document.getElementById('typeOfEvent').value,
        languages: document.getElementById('languages').value,
        objects: document.getElementById('objects').value,
        dates: document.getElementById('dates').value,
        publisher: document.getElementById('publisher').value,
        associatedPersons: document.getElementById('associatedPersons').value,
        associatedPersonsUrl: document.getElementById('associatedPersonsUrl').value,
    };

    // Display data in the table
    const tableBody = document.getElementById('dataTable').getElementsByTagName('tbody')[0];
    const newRow = tableBody.insertRow();
    Object.values(formData).forEach(value => {
        const newCell = newRow.insertCell();
        const newText = document.createTextNode(value);
        newCell.appendChild(newText);
    });

    // Update CSV download link
    updateCSVLink(formData);

    // Clear form fields after submission
    event.target.reset();
    document.getElementById('searchResults').innerHTML = ''; // Clear search results
});

function updateCSVLink(data) {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += Object.keys(data).join(",") + "\r\n"; // Add header
    csvContent += Object.values(data).join(",") + "\r\n"; // Add data

    const encodedUri = encodeURI(csvContent);
    const link = document.getElementById('downloadLink');
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "submitted_data.csv");
    link.style.display = "block"; // Make the download link visible
}

// Add the event listener for the Wikidata search as previously described


document.getElementById('associatedPersons').addEventListener('input', function(event) {
    const searchTerm = event.target.value;
    if (searchTerm.length < 3) {
        document.getElementById('searchResults').innerHTML = '';
        return;
    }

    const url = "https://www.wikidata.org/w/api.php";
    const params = {
        action: "wbsearchentities",
        language: "en",
        format: "json",
        search: searchTerm,
        limit: 5,
        origin: "*",
    };

    let query = url + "?origin=*";
    Object.keys(params).forEach(function(key) {
        query += `&${key}=${encodeURIComponent(params[key])}`;
    });

    fetch(query)
        .then(response => response.json())
        .then(data => {
            const resultsContainer = document.getElementById('searchResults');
            resultsContainer.innerHTML = '';
            data.search.forEach(function(item) {
                const li = document.createElement('li');
                li.textContent = item.label;
                resultsContainer.appendChild(li);
        
                // Update click event listener to also save the URL
                li.addEventListener('click', function() {
                    document.getElementById('associatedPersons').value = item.label; // Save the name
                    document.getElementById('associatedPersonsUrl').value = item.concepturi; // Save the URL
                    resultsContainer.innerHTML = ''; // Clear results
                });
            });
        })
        .catch(error => console.error(error));


});
document.getElementById('exportJsonButton').addEventListener('click', function() {
    var formData = {
        // Assume you have fields for associated persons like this
        associatedPersons: []
    };
    document.querySelectorAll('.associatedPerson').forEach(function(personDiv) {
        var personName = personDiv.querySelector('[name="associatedPersonName[]"]').value;
        var personUrl = personDiv.querySelector('[name="associatedPersonUrl[]"]').value;
        if (personName && personUrl) { // Ensure non-empty values are added
            formData.associatedPersons.push({ name: personName, url: personUrl });
        }
    });

    // Convert formData to JSON string
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(formData));
    // Create a temporary link to initiate the download
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "formData.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
});


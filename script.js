document.getElementById('myForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    // Capture form data
    /**
     * Represents the form data object.
     * @typedef {Object} FormData
     * @property {string} generalCategory - The general category value.
     * @property {string} associatedPersons - The associated persons value.
     * @property {string} places - The places value.
     * @property {string} institutions - The institutions value.
     * @property {string} events - The events value.
     * @property {string} typeOfEvent - The type of event value.
     * @property {string} languages - The languages value.
     * @property {string} objects - The objects value.
     * @property {string} dates - The dates value.
     * @property {string} publisher - The publisher value.
     * @property {string} associatedPersonsUrl - The associated persons URL value.
     */

    /**
     * Represents the form data.
     * @type {FormData}
     */
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

    // Create a new page for each submission
    const newPageContent = Object.entries(data).map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>`).join("");
    const newPage = window.open("", "_blank");
    newPage.document.write(`<html><head><title>New Page</title></head><body>${newPageContent}</body></html>`);
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
// Listen for the form submission event
document.getElementById('personForm').addEventListener('submit', function(event) {
    // Prevent the form from being submitted normally
    event.preventDefault();

    // Get the person's name and Wikidata URL from the form
    var personName = document.getElementById('personName').value;
    var personUrl = document.getElementById('personUrl').value;

    // Create a new div to hold the person's information
    var personDiv = document.createElement('div');

    // Create an h1 element for the person's name
    var nameElement = document.createElement('h1');
    nameElement.textContent = personName;

    // Create an anchor element for the person's Wikidata URL
    var urlElement = document.createElement('a');
    urlElement.href = personUrl;
    urlElement.textContent = 'View on Wikidata';

    // Append the name and URL elements to the person div
    personDiv.appendChild(nameElement);
    personDiv.appendChild(urlElement);

    // Append the person div to the body of the document
    document.body.appendChild(personDiv);
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


document.addEventListener('DOMContentLoaded', function() {
    let associatedPersons = [];

    document.getElementById('myForm').addEventListener('submit', function(event) {
        event.preventDefault();

        // Construct form data object
        const formData = {
            generalCategory: document.getElementById('generalCategory').value,
            associatedPersons: associatedPersons, // Preserve the array structure
            places: document.getElementById('places').value,
            institutions: document.getElementById('institutions').value,
            events: document.getElementById('events').value,
            typeOfEvent: document.getElementById('typeOfEvent').value,
            languages: document.getElementById('languages').value,
            objects: document.getElementById('objects').value,
            dates: document.getElementById('dates').value,
            publisher: document.getElementById('publisher').value,
        };

        // Save formData to localStorage
        saveFormData(formData);

        // Reset the form and the associated persons array for the next entry
        resetFormAndAssociatedPersons();
    });

    // The rest of your existing JavaScript code...

    function resetFormAndAssociatedPersons() {
        // Clear form fields
        document.getElementById('myForm').reset();

        // Clear the associated persons array and update the UI
        associatedPersons = [];
        updatePersonListUI();

        // Optionally, clear other dynamically generated content as needed
    }

    function saveFormData(formData) {
        const submissions = JSON.parse(localStorage.getItem('submissions')) || [];
        
        // Properly serialize associatedPersons
        const serializedAssociatedPersons = formData.associatedPersons.map(person => JSON.stringify(person));
        formData.associatedPersons = serializedAssociatedPersons;
        
        submissions.push(formData);
        localStorage.setItem('submissions', JSON.stringify(submissions));
    
        // Assuming entities need similar treatment
        const entities = JSON.parse(localStorage.getItem('entities')) || {};
        formData.associatedPersons.forEach(personStr => {
            const person = JSON.parse(personStr); // Deserialize
            if(person.name && person.url) {
                entities[person.name] = person.url;
            }
        });
        localStorage.setItem('entities', JSON.stringify(entities));
    }
    
    

    document.getElementById('associatedPersons').addEventListener('input', function(event) {
        const searchTerm = event.target.value;
        if (searchTerm.length < 3) { // Minimum search term length, to avoid too broad searches
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
            origin: "*", // CORS bypass for demonstration purposes; be aware of security implications
        };

        let query = `${url}?origin=*`;
        Object.keys(params).forEach(key => query += `&${key}=${encodeURIComponent(params[key])}`);

        fetch(query)
            .then(response => response.json())
            .then(data => {
                const resultsContainer = document.getElementById('searchResults');
                resultsContainer.innerHTML = ''; // Clear previous results
                data.search.forEach(item => {
                    const li = document.createElement('li');
                    li.textContent = item.label;
                    li.setAttribute('data-url', item.concepturi); // Store URL in data attribute for later use
                    resultsContainer.appendChild(li);

                    // Click event to select a person and clear search results
                    li.addEventListener('click', function() {
                        // Assume entity ID is stored in data-entity-id attribute (you might need to adjust this)
                        const entityId = this.getAttribute('data-url').match(/Q\d+$/)[0]; // Extract Q number from URL
                        
                        fetchEntityDetailsAndVerify(entityId, isHuman => {
                            if (isHuman) {
                                // If the entity is a human, proceed to add
                                addSelectedPerson(this.textContent, this.getAttribute('data-url'));
                            } else {
                                // Handle the case where the entity is not a human
                                alert("Selected entity is not a human.");
                            }
                        });
                    
                        document.getElementById('associatedPersons').value = ''; // Clear the input field
                        document.getElementById('searchResults').innerHTML = ''; // Clear search results
                    });
                });
            })
            .catch(error => console.error('Error fetching Wikidata:', error));
    });

    function fetchEntityDetailsAndVerify(entityId, callback) {
        const wikidataApiBaseUrl = 'https://www.wikidata.org/w/api.php';
        const entityDetailsUrl = `${wikidataApiBaseUrl}?action=wbgetentities&ids=${entityId}&format=json&origin=*`;
    
        fetch(entityDetailsUrl)
            .then(response => response.json())
            .then(data => {
                if (data.entities && data.entities[entityId]) {
                    const entityClaims = data.entities[entityId].claims;
                    if (entityClaims.P31 && entityClaims.P31.some(claim => claim.mainsnak.datavalue.value.id === 'Q5')) {
                        callback(true); // It's a human
                    } else {
                        callback(false); // Not a human
                    }
                }
            })
            .catch(error => console.error('Error fetching entity details:', error));
    }
    
    function addSelectedPerson(name, url) {
        associatedPersons.push({ name, url });
        updatePersonListUI();
    }

    function updatePersonListUI() {
        const listContainer = document.getElementById('addedPersonsList');
        listContainer.innerHTML = ''; // Clear current list
        associatedPersons.forEach((person, index) => {
            const li = document.createElement('li');
            li.textContent = `${person.name} (URL: ${person.url})`; // Display name and URL
            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove';
            removeButton.onclick = function() {
                associatedPersons.splice(index, 1); // Remove the person from array
                updatePersonListUI(); // Update the UI
            };
            li.appendChild(removeButton);
            listContainer.appendChild(li);
        });
    }
});

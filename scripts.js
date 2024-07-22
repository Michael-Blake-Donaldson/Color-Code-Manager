function isValidColorCode(colorCode) {
    const hexColorRegex = /^#([0-9A-F]{3}){1,2}$/i;
    return hexColorRegex.test(colorCode);
}

document.getElementById('addColorCodeButton').addEventListener('click', () => {
    const colorCode = prompt('Enter Color Code (e.g., #FFFFFF):');
    if (colorCode) {
        if (isValidColorCode(colorCode)) {
            alert(`Color Code ${colorCode} added.`);
        } else {
            alert('Invalid color code. Please enter a valid hex color code (e.g., #FFFFFF).');
        }
    } else {
        alert('Color code cannot be empty.');
    }
});

document.getElementById('createTemplateButton').addEventListener('click', () => {
    const templateName = prompt('Enter Template Name:');
    if (templateName) {
        if (templates.some(t => t.name === templateName)) {
            alert('Template name already exists. Please choose a different name.');
            return;
        }
        const template = { name: templateName, colorCodes: [] };
        const count = parseInt(prompt('Enter number of color codes:'), 10);
        if (isNaN(count) || count <= 0) {
            alert('Please enter a valid number of color codes.');
            return;
        }
        for (let i = 0; i < count; i++) {
            const colorCode = prompt(`Enter Color Code ${i + 1} (e.g., #FFFFFF):`);
            if (colorCode) {
                if (isValidColorCode(colorCode)) {
                    template.colorCodes.push(colorCode);
                } else {
                    alert(`Invalid color code. Please enter a valid hex color code (e.g., #FFFFFF).`);
                    i--; // Decrement the counter to re-enter the invalid color code
                }
            } else {
                alert('Color code cannot be empty.');
                i--; // Decrement the counter to re-enter the empty color code
            }
        }
        alert(`Template ${templateName} created.`);
        templates.push(template);
        saveTemplates();
        updateTemplateList();
    } else {
        alert('Template name cannot be empty.');
    }
});

document.getElementById('listTemplatesButton').addEventListener('click', updateTemplateList);

document.getElementById('saveTemplatesButton').addEventListener('click', () => {
    saveTemplates();
    alert('Templates saved successfully.');
});

document.getElementById('loadTemplatesButton').addEventListener('click', () => {
    loadTemplates();
    alert('Templates loaded successfully.');
});

document.getElementById('exportTemplatesButton').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(templates, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'templates.json';
    a.click();
    URL.revokeObjectURL(url);
});

document.getElementById('importTemplatesButton').addEventListener('click', () => {
    document.getElementById('importTemplatesInput').click();
});

document.getElementById('importTemplatesInput').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedTemplates = JSON.parse(e.target.result);
                templates = importedTemplates;
                saveTemplates();
                updateTemplateList();
                alert('Templates imported successfully.');
            } catch (error) {
                alert('Error importing templates. Please ensure the file is in the correct format.');
            }
        }
        reader.readAsText(file);
    }
});

document.getElementById('sortTemplatesSelect').addEventListener('change', () => {
    const sortBy = document.getElementById('sortTemplatesSelect').value;
    if (sortBy === 'name') {
        templates.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'colorCount') {
        templates.sort((a, b) => a.colorCodes.length - b.colorCodes.length);
    }
    updateTemplateList();
});

document.getElementById('filterTemplatesButton').addEventListener('click', () => {
    const filterValue = document.getElementById('filterTemplatesInput').value.toLowerCase();
    const filteredTemplates = templates.filter(template => template.name.toLowerCase().includes(filterValue));
    updateTemplateList(filteredTemplates);
});

document.getElementById('viewAllColorCodesButton').addEventListener('click', () => {
    const allColorsList = document.getElementById('allColorsList');
    allColorsList.innerHTML = '';

    templates.forEach(template => {
        template.colorCodes.forEach(colorCode => {
            const li = document.createElement('li');
            li.innerHTML = `<div class="color-box" style="background-color: ${colorCode};"></div> ${colorCode}`;
            allColorsList.appendChild(li);
        });
    });

    const modal = document.getElementById('allColorsModal');
    const span = modal.getElementsByClassName('close')[0];

    modal.style.display = 'block';

    span.onclick = function() {
        modal.style.display = 'none';
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
});

let templates = [];

window.onload = () => {
    loadTemplates();
    updateTemplateList();
};

window.chrome.webview.addEventListener('message', event => {
    const message = event.data;
    if (message.command === 'loadTemplates') {
        templates = message.templates;
        updateTemplateList();
    }
});

function saveTemplates() {
    localStorage.setItem('templates', JSON.stringify(templates));
}

function loadTemplates() {
    const storedTemplates = localStorage.getItem('templates');
    if (storedTemplates) {
        templates = JSON.parse(storedTemplates);
    }
}

function updateTemplateList(filteredTemplates = templates) {
    const list = document.getElementById('templatesList');
    list.innerHTML = '';
    filteredTemplates.forEach((template, index) => {
        const li = document.createElement('li');
        li.innerHTML = `Template Name: ${template.name}, Color Codes: ${template.colorCodes.map(code => `<div class="color-box" style="background-color: ${code};"></div> ${code}`).join(', ')} 
            <button onclick="viewTemplateDetails(${index})">View</button>
            <button onclick="editTemplate(${index})">Edit</button>
            <button onclick="deleteTemplate(${index})">Delete</button>`;
        list.appendChild(li);
    });
}

function viewTemplateDetails(index) {
    const template = templates[index];
    const modal = document.getElementById('detailsModal');
    const span = document.getElementsByClassName('close')[0];
    const details = document.getElementById('templateDetails');

    details.innerHTML = `<strong>Name:</strong> ${template.name}<br>
                         <strong>Color Codes:</strong> <ul>${template.colorCodes.map((code, i) => `<li><div class="color-box" style="background-color: ${code};"></div> ${code} <button onclick="editColorCode(${index}, ${i})">Edit</button> <button onclick="deleteColorCode(${index}, ${i})">Delete</button></li>`).join('')}</ul>`;
    modal.style.display = 'block';

    span.onclick = function() {
        modal.style.display = 'none';
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
}

function editTemplate(index) {
    const template = templates[index];
    const newTemplateName = prompt('Enter new template name:', template.name);
    if (newTemplateName) {
        if (templates.some(t => t.name === newTemplateName && t !== template)) {
            alert('Template name already exists. Please choose a different name.');
            return;
        }
        template.name = newTemplateName;
        for (let i = 0; i < template.colorCodes.length; i++) {
            const newColorCode = prompt(`Enter new Color Code ${i + 1} (current: ${template.colorCodes[i]}):`, template.colorCodes[i]);
            if (newColorCode) {
                if (isValidColorCode(newColorCode)) {
                    template.colorCodes[i] = newColorCode;
                } else {
                    alert(`Invalid color code. Please enter a valid hex color code (e.g., #FFFFFF).`);
                    i--; // Re-enter the invalid color code
                }
            } else {
                alert('Color code cannot be empty.');
                i--; // Re-enter the empty color code
            }
        }
        saveTemplates();
        updateTemplateList();
    } else {
        alert('Template name cannot be empty.');
    }
}

function deleteTemplate(index) {
    if (confirm('Are you sure you want to delete this template?')) {
        templates.splice(index, 1);
        saveTemplates();
        updateTemplateList();
    }
}

function editColorCode(templateIndex, colorIndex) {
    const newColorCode = prompt('Enter new color code:', templates[templateIndex].colorCodes[colorIndex]);
    if (newColorCode) {
        if (isValidColorCode(newColorCode)) {
            templates[templateIndex].colorCodes[colorIndex] = newColorCode;
            saveTemplates();
            viewTemplateDetails(templateIndex);
        } else {
            alert('Invalid color code. Please enter a valid hex color code (e.g., #FFFFFF).');
        }
    }
}

function deleteColorCode(templateIndex, colorIndex) {
    if (confirm('Are you sure you want to delete this color code?')) {
        templates[templateIndex].colorCodes.splice(colorIndex, 1);
        saveTemplates();
        viewTemplateDetails(templateIndex);
    }
}
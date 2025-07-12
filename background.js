// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'checkStatus') {
        checkProxyStatus(sendResponse);
        return true; // Required for asynchronous responses
    }
    if (request.action === 'mainClean') {
        cleanProxyAndDns();
        sendResponse({ success: true });
    }
    if (request.action === 'advancedClean') {
        cleanBrowseData(request.data);
        sendResponse({ success: true });
    }
});

// Function to check the proxy status
function checkProxyStatus(callback) {
    chrome.proxy.settings.get({}, (details) => {
        if (details.levelOfControl === 'controlled_by_other_extensions' || details.levelOfControl === 'controlled_by_this_extension') {
            callback({
                status: 'bad',
                recommendation: '❗️ Active VPN or Proxy detected. A Main Clean is recommended.'
            });
        } else {
            callback({
                status: 'good'
            });
        }
    });
}

// **REWRITTEN AND FINAL FUNCTION**
// Decouples proxy clearing from Browse data removal to fix the context error.
async function cleanProxyAndDns() {
    try {
        // Step 1: Wrap proxy clearing in a promise to ensure it completes first.
        await new Promise((resolve) => {
            chrome.proxy.settings.clear({}, () => {
                console.log("Proxy settings cleared successfully.");
                resolve(); // Signal that this step is done.
            });
        });

        // Step 2: Now, in a separate step, clear the host cache.
        const options = { since: 0 };
        const dataToRemove = { "hostCache": true };
        
        await chrome.BrowseData.remove(options, dataToRemove);
        console.log("Host cache cleared successfully.");

        // Step 3: Show success notification only after all steps are complete.
        showNotification('Main Clean Complete', 'VPN/Proxy traces and the DNS cache have been successfully cleared.');

    } catch (error) {
        console.error("An error occurred during the main clean process:", error);
        showNotification('Error', 'Could not complete the main clean. See the console for details.');
    }
}


// Function for the advanced clean
function cleanBrowseData(dataTypes) {
    const dataToRemove = {};
    Object.keys(dataTypes).forEach(key => {
        if (dataTypes[key]) {
            dataToRemove[key] = true;
        }
    });

    if (Object.keys(dataToRemove).length > 0) {
        // "since: 0" removes data from all time
        chrome.BrowseData.remove({ since: 0 }, dataToRemove, () => {
            showNotification('Cleaning Complete', 'The selected items have been successfully cleared.');
        });
    }
}

// Function to show a desktop notification
function showNotification(title, message) {
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon128.png',
        title: title,
        message: message,
        priority: 2
    });
}

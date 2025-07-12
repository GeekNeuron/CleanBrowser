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

// Function for the main clean (Proxy and DNS cache)
function cleanProxyAndDns() {
    // Reset proxy settings
    chrome.proxy.settings.clear({}, () => {
        console.log("Proxy settings cleared.");
        
        // Clear the browser's host cache (DNS cache)
        const dataToRemove = {
            "hostCache": true
        };
        chrome.BrowseData.remove({}, dataToRemove, () => {
            showNotification('Main Clean Complete', 'VPN/Proxy traces and the DNS cache have been successfully cleared.');
        });
    });
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

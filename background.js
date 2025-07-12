// **FINAL, ROBUST VERSION USING ALARMS API**

// Listen for messages from the popup UI
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'checkStatus') {
        checkProxyStatus(sendResponse);
        return true; 
    }
    if (request.action === 'mainClean') {
        initiateMainClean();
        sendResponse({ success: true });
    }
    if (request.action === 'advancedClean') {
        cleanBrowseData(request.data);
        sendResponse({ success: true });
    }
});

// The new main clean process
function initiateMainClean() {
    chrome.proxy.settings.clear({}, () => {
        console.log("Step 1 Complete: Proxy settings cleared.");
        chrome.alarms.create('dnsCleanAlarm', { delayInMinutes: 0.016 }); // Approx 1 second
        console.log("Step 2 Scheduled: Alarm set for DNS cache cleaning.");
    });
}

// Listen for the alarm to run the second, independent step
chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === 'dnsCleanAlarm') {
        console.log("Step 3 Initiated: Alarm received. Clearing DNS cache.");
        try {
            const options = { since: 0 };
            const dataToRemove = { "hostCache": true };
            await chrome.BrowseData.remove(options, dataToRemove);
            console.log("Step 3 Complete: Host cache cleared successfully.");
            showNotification('Main Clean Complete', 'VPN/Proxy traces and the DNS cache have been successfully cleared.');
        } catch (error) {
            console.error("A critical error occurred during DNS cache cleaning:", error);
            showNotification('Error', 'Could not clear the host cache. See the console for details.');
        }
    }
});

// Function to check the proxy status
function checkProxyStatus(callback) {
    chrome.proxy.settings.get({}, (details) => {
        if (details.levelOfControl === 'controlled_by_other_extensions' || details.levelOfControl === 'controlled_by_this_extension') {
            callback({ status: 'bad', recommendation: '❗️ Active VPN or Proxy detected. A Main Clean is recommended.' });
        } else {
            callback({ status: 'good' });
        }
    });
}

// Function for the advanced clean
function cleanBrowseData(dataTypes) {
    const dataToRemove = {};
    Object.keys(dataTypes).forEach(key => {
        if (dataTypes[key]) { dataToRemove[key] = true; }
    });
    if (Object.keys(dataToRemove).length > 0) {
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

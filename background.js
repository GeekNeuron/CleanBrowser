chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case 'checkStatus':
            checkProxyStatus(sendResponse);
            return true; // Keep message channel open for async response

        case 'cleanProxyOnly':
            chrome.proxy.settings.clear({}, () => {
                console.log("Proxy settings cleared by background.");
                sendResponse({ success: true });
            });
            return true;

        case 'advancedClean':
            cleanBrowseData(request.data, sendResponse);
            return true;

        case 'showSuccessNotification':
            showNotification('Main Clean Complete', 'VPN/Proxy traces and the DNS cache have been successfully cleared.');
            break;
    }
});

function checkProxyStatus(callback) {
    chrome.proxy.settings.get({}, (details) => {
        if (details.levelOfControl === 'controlled_by_other_extensions' || details.levelOfControl === 'controlled_by_this_extension') {
            callback({ status: 'bad', recommendation: '❗️ Active VPN or Proxy detected. A Main Clean is recommended.' });
        } else {
            callback({ status: 'good' });
        }
    });
}

function cleanBrowseData(dataTypes, callback) {
    const dataToRemove = {};
    Object.keys(dataTypes).forEach(key => {
        if (dataTypes[key]) { dataToRemove[key] = true; }
    });
    if (Object.keys(dataToRemove).length > 0) {
        // این خط به شکل کاملا صحیح نوشته شده است
        chrome.BrowseData.remove({ since: 0 }, dataToRemove, () => {
            showNotification('Cleaning Complete', 'The selected items have been successfully cleared.');
            if (callback) callback({ success: true });
        });
    }
}

function showNotification(title, message) {
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon128.png',
        title: title,
        message: message,
        priority: 2
    });
}

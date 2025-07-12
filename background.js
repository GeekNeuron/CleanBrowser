chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case 'checkStatus':
            checkProxyStatus(sendResponse);
            return true;

        case 'cleanProxyOnly':
            chrome.proxy.settings.clear({}, () => {
                showNotification('Proxy Reset', 'The browser proxy settings have been cleared.');
                sendResponse({ success: true });
            });
            return true;

        case 'advancedClean':
            // استفاده از نام صحیح تابع
            cleanbrowseData(request.data, sendResponse);
            return true;
    }
});

function checkProxyStatus(callback) {
    chrome.proxy.settings.get({}, (details) => {
        if (details.levelOfControl === 'controlled_by_other_extensions' || details.levelOfControl === 'controlled_by_this_extension') {
            callback({ status: 'bad', recommendation: '❗️ Active VPN or Proxy detected. Main reset is recommended.' });
        } else {
            callback({ status: 'good' });
        }
    });
}

// نام تابع به شکل صحیح اصلاح شده است
function cleanBrowseData(dataTypes, callback) {
    const dataToRemove = {};
    Object.keys(dataTypes).forEach(key => {
        if (dataTypes[key]) { dataToRemove[key] = true; }
    });
    if (Object.keys(dataToRemove).length > 0) {
        chrome.browseData.remove({ since: 0 }, dataToRemove, () => {
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

document.addEventListener('DOMContentLoaded', () => {
    const mainCleanBtn = document.getElementById('main-clean-btn');
    const toggleAdvancedBtn = document.getElementById('toggle-advanced-btn');
    const advancedOptionsDiv = document.getElementById('advanced-options');
    const cleanSelectedBtn = document.getElementById('clean-selected-btn');

    const statusText = document.getElementById('status-text');
    const statusSection = document.getElementById('status-section');
    const statusRecommendation = document.getElementById('status-recommendation');

    // 1. Check browser status when the popup opens
    chrome.runtime.sendMessage({ action: 'checkStatus' }, (response) => {
        if (!chrome.runtime.lastError && response) {
            if (response.status === 'good') {
                statusText.textContent = 'Excellent 👍';
                statusSection.className = 'status-good';
                statusRecommendation.classList.add('hidden');
            } else {
                statusText.textContent = 'Needs Attention ⚠️';
                statusSection.className = 'status-bad';
                statusRecommendation.textContent = response.recommendation;
                statusRecommendation.classList.remove('hidden');
            }
        }
    });

    // 2. Main clean button - NEW LOGIC
    mainCleanBtn.addEventListener('click', () => {
        mainCleanBtn.textContent = 'Step 1: Cleaning Proxy...';
        mainCleanBtn.disabled = true;

        // Step 1: Tell the background script to ONLY clear the proxy
        chrome.runtime.sendMessage({ action: 'cleanProxyOnly' }, (response) => {
            if (chrome.runtime.lastError || !response || !response.success) {
                mainCleanBtn.textContent = 'Error! Check Console.';
                return;
            }

            console.log("Proxy cleared. Now clearing host cache from popup.");
            mainCleanBtn.textContent = 'Step 2: Cleaning DNS Cache...';

            // Step 2: Now, the POPUP script itself clears the Browse data
            const options = { since: 0 };
            const dataToRemove = { "hostCache": true };

            chrome.BrowseData.remove(options, dataToRemove, () => {
                console.log("Host cache cleared successfully from popup.");
                mainCleanBtn.textContent = '🚀 Main Clean (VPN / Proxy / DNS)';
                mainCleanBtn.disabled = false;
                // Send a message to the background just to show the final notification
                chrome.runtime.sendMessage({ action: 'showSuccessNotification' });
            });
        });
    });

    // 3. Button to toggle advanced options
    toggleAdvancedBtn.addEventListener('click', () => {
        const isVisible = advancedOptionsDiv.classList.toggle('visible');
        toggleAdvancedBtn.textContent = isVisible ? 'Close More Options' : 'More Cleaning Options...';
    });

    // 4. Button to clean selected items
    cleanSelectedBtn.addEventListener('click', () => {
        const dataTypes = {
            cache: document.getElementById('clean-cache').checked,
            history: document.getElementById('clean-history').checked,
            cookies: document.getElementById('clean-cookies').checked,
            downloads: document.getElementById('clean-downloads').checked,
            passwords: document.getElementById('clean-passwords').checked,
        };
        
        cleanSelectedBtn.textContent = 'Cleaning...';
        cleanSelectedBtn.disabled = true;
        chrome.runtime.sendMessage({ action: 'advancedClean', data: dataTypes }, () => {
            cleanSelectedBtn.textContent = 'Clean Selected Items';
            cleanSelectedBtn.disabled = false;
        });
    });
});

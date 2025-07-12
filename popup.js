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
    });

    // 2. Main clean button
    mainCleanBtn.addEventListener('click', () => {
        mainCleanBtn.textContent = 'Cleaning...';
        mainCleanBtn.disabled = true;
        chrome.runtime.sendMessage({ action: 'mainClean' }, (response) => {
            mainCleanBtn.textContent = '🚀 Main Clean (VPN / Proxy / DNS)';
            mainCleanBtn.disabled = false;
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
        chrome.runtime.sendMessage({ action: 'advancedClean', data: dataTypes }, (response) => {
            cleanSelectedBtn.textContent = 'Clean Selected Items';
            cleanSelectedBtn.disabled = false;
        });
    });
});

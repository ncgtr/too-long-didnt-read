document.addEventListener('DOMContentLoaded', async () => {
    const summary = document.getElementById('summary');
    document.body.style.height = summary.offsetHeight + 20 + "px";
    if (summary.classList.contains('summary-animation-end')) {
        summary.classList.remove('summary-animation-end');
        summary.classList.add('summary-animation-state');
    }

    updateSummary("TL;DR...");
    await sleep(2000);

    try {
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!activeTab) {
            finalizeSummary("Run TL;DR in an active tab to see summaries!");
            return;
        }

        if (activeTab.url.startsWith('chrome://') || activeTab.url.startsWith('edge://')) {
            finalizeSummary("Cannot summarize internal browser pages. Try navigating to a normal website!");
            return;
        }

        await sleep(500);
        const injectionResults = await chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            func: () => ({
                text: window.getSelection().toString() || document.body.innerText,
                hasSelection: window.getSelection().toString().length > 0
            })
        });

        const { text, hasSelection } = injectionResults[0].result;
        updateSummary(hasSelection ? "Retrieving selection..." : "Retrieving page content...");
        await sleep(500);

        const content = text
            .replace(/\s+/g, ' ')
            .trim()
            .split(' ')
            .slice(0, 750)
            .join(' ');
        
        console.log("Word count:", content.split(' ').length);
        console.log("Sending:", content);

        updateSummary("Connecting to Groq API...");
        await sleep(500);
        const response = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${CONFIG.GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        {
                            role: "system",
                            content: "You are a webpage summarizer. Summarize the main content of the page. Ignore navigation menus, cookie banners, ads, and UI elements. Be concise and factual."
                        },
                        {
                            role: "user",
                            content: content
                        }
                    ],
                    max_tokens: 400
                })
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Groq API error:", response.status, errorText);
            finalizeSummary("Groq API error: " + response.status);
            return;
        }

        const data = await response.json();
        finalizeSummary(data.choices[0].message.content);
    }
    catch(exception) {
        finalizeSummary("Error while summarizing this page! Error logged to console.");
        console.error("TLDR Error:", exception);
    }
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function updateSummary(text) {
    summary.textContent = text;
    document.body.style.height = summary.offsetHeight + 20 + "px";
}

async function finalizeSummary(text) {
    const gem = document.getElementById('gem-icon')
    gem.classList.remove('gem-animate');
    gem.classList.add('gem-animate-finished');
    document.getElementById('gem-icon').classList.remove('gem-animate');
    summary.classList.remove('summary-animation-state');
    summary.classList.add('summary-animation-finished');
    summary.textContent = text;
    await sleep(500);
    summary.classList.remove('summary-animation-finished');
    summary.classList.add('summary-animation-end');
    document.body.style.height = summary.offsetHeight + 20 + "px";
}
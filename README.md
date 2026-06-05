# Too Long; Didn't Read
### A Chrome browser extension that summarizes webpages using AI (Llama 3.3)

**TL;DR** is a Chrome extension that summarizes any webpage using `Llama 3.3 70B` via the **Groq API**. Open the extension on any page for a quick summary, or highlight text first to summarize a specific section. Summarizations in multiple languages are supported through a simple system instruction.

<table>
  <tr>
    <td><img width="1075" height="814" src="https://github.com/user-attachments/assets/b346ea1b-b724-492b-a868-b55b32dbe3a0"</td>
    <td><img width="1375" height="814" alt="full page" src="https://github.com/user-attachments/assets/01830a00-8283-448e-b147-1e5635333256"</td>
  </tr>
</table>

The prompt for the AI is built following this road:
1. The content is retrieved from the user's selection or all text in the web page
2. All bloat such as `< >` or `/ \` characters are removed
3. A system instruction is set: `"You are a professional summarizer..."`
4. And finally, the user instruction is set as the text wanted to be summarized.

Although I implemented available safeguards in the system instructions, the app may still remain susceptible to advanced prompt injection, as no validation is entirely foolproof.
The inference is also possible with the local **Gemini Nano** model built into Chrome v138+, however I could not implement it as it's region-locked. I suggest you check it out.

## Setup
1. Clone/download
2. Add your **Groq API key** in `config.js`
3. Go to `chrome://extensions` and enable **Developer Mode**
4. Click `Load unpacked` and select the root folder

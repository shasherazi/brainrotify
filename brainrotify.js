const genZReplacements = {
  nouns: [
    "bestie", "stan", "slay", "vibe", "main character", "moment", "tea", "L", "W",
    "baddie", "drip", "sitch", "rizz", "era", "no cap", "ratio", "mood", "goat",
    "simp", "delulu", "side eye", "fan behavior", "op", "core memory", "ick",
    "bet", "lowkey flex", "clout", "gas", "gyat", "bozo", "npc"
  ],
  verbs: [
    "vibe", "slay", "simp", "yeet", "understood the assignment", "ate", "serving",
    "ghosting", "gatekeeping", "gaslight", "flex", "cancel", "spill", "pull up",
    "touch grass", "hard launch", "soft launch", "ratio’d", "giving", "gatekeeping",
    "cheuging", "tweakin", "spitting", "sending", "feral", "glazing", "cooking",
    "standing on business"
  ],
  adjectives: [
    "bussin", "fire", "based", "sus", "mid", "unhinged", "lowkey", "highkey",
    "extra", "valid", "rent-free", "goofy", "pressed", "giving", "cheugy", "feral",
    "down bad", "certified", "delulu", "camp", "cringe", "purr", "devious",
    "wholesome", "grippy sock", "skibidi", "zesty", "wildin", "bricked up"
  ],
};

function brainrotify(element, percentage = 10) {
  const text = element.textContent;
  const doc = nlp(text);
  const wordMap = {};

  doc.match('#Noun').terms().forEach(term => {
    wordMap[term.text().toLowerCase()] = 'nouns';
  });

  doc.match('#Verb').terms().forEach(term => {
    wordMap[term.text().toLowerCase()] = 'verbs';
  });

  doc.match('#Adjective').terms().forEach(term => {
    wordMap[term.text().toLowerCase()] = 'adjectives';
  });

  const tokens = text.split(/(\W+)/);

  element.textContent = '';

  tokens.forEach(token => {
    if (!/^[a-zA-Z]+$/.test(token)) {
      // For non-word tokens (spaces, punctuation), just add as text
      element.appendChild(document.createTextNode(token));
      return;
    }

    const lowerToken = token.toLowerCase();
    const category = wordMap[lowerToken];

    if (category && genZReplacements[category] && Math.random() * 100 < percentage) {
      const replacements = genZReplacements[category];
      const replacement = replacements[Math.floor(Math.random() * replacements.length)];

      // Apply capitalization if needed
      let finalReplacement = replacement;
      if (/^[A-Z]/.test(token)) {
        finalReplacement = replacement.charAt(0).toUpperCase() + replacement.slice(1);
      }

      // Create a span with tooltip
      const span = document.createElement('span');
      span.textContent = finalReplacement;
      span.title = `Original: ${token}`; // This creates the tooltip
      span.style.textDecoration = 'underline dotted'; // Optional: visual indicator
      span.style.cursor = 'help'; // Changes cursor on hover

      element.appendChild(span);
    } else {
      element.appendChild(document.createTextNode(token));
    }
  });
}

const paras = document.querySelectorAll('p');
document.addEventListener('DOMContentLoaded', function() {
  const slider = document.getElementById('percentage-slider');
  const percentageValue = document.getElementById('percentage-value');
  const applyButton = document.getElementById('apply-button');

  // Load saved percentage (if any)
  browser.storage.local.get('replacementPercentage', function(data) {
    if (data.replacementPercentage) {
      slider.value = data.replacementPercentage;
      percentageValue.textContent = data.replacementPercentage;
    }
  });

  // Update display when slider moves
  slider.addEventListener('input', function() {
    percentageValue.textContent = slider.value;
  });

  // Save percentage when slider changes
  slider.addEventListener('change', function() {
    browser.storage.local.set({
      replacementPercentage: slider.value
    });
  });

  // Apply to current page
  applyButton.addEventListener('click', function() {
    browser.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      browser.tabs.sendMessage(tabs[0].id, {
        action: "applyReplacement",
        percentage: slider.value
      });
    });
  });
});

browser.runtime.onMessage.addListener(function(message) {
  if (message.action === "applyReplacement") {
    const percentage = parseInt(message.percentage);
    const paras = document.querySelectorAll('p');
    paras.forEach(para => {
      brainrotify(para, percentage);
    });
  }
});

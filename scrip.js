const langs = {
  "en": "English", "hi": "Hindi", "es": "Spanish", "fr": "French", "de": "German",
  "zh": "Chinese", "ja": "Japanese", "ko": "Korean", "ru": "Russian", "ar": "Arabic",
  "pt": "Portuguese", "bn": "Bengali", "pa": "Punjabi", "mr": "Marathi", "te": "Telugu",
  "ta": "Tamil", "ur": "Urdu", "gu": "Gujarati", "kn": "Kannada", "ml": "Malayalam",
  "or": "Odia", "as": "Assamese", "ne": "Nepali", "si": "Sinhala", "my": "Burmese",
  "th": "Thai", "vi": "Vietnamese", "id": "Indonesian", "fa": "Persian", "tr": "Turkish",
  "it": "Italian", "pl": "Polish", "nl": "Dutch", "sv": "Swedish", "no": "Norwegian",
  "da": "Danish", "fi": "Finnish", "cs": "Czech", "sk": "Slovak", "hu": "Hungarian",
  "ro": "Romanian", "bg": "Bulgarian", "hr": "Croatian", "sr": "Serbian", "uk": "Ukrainian",
  "el": "Greek", "he": "Hebrew", "af": "Afrikaans", "sq": "Albanian",
  "et": "Estonian", "lt": "Lithuanian", "lv": "Latvian", "mt": "Maltese", "ga": "Irish",
  "cy": "Welsh", "gd": "Scottish Gaelic", "eu": "Basque", "ca": "Catalan", "gl": "Galician"
};

let selectedLangs = ['hi', 'es', 'fr'];
let history = JSON.parse(localStorage.getItem('hist')) || [];

window.onload = function() {
  const from = document.getElementById('fromLang');
  const to = document.getElementById('toLang');
  
  for (let code in langs) {
    from.innerHTML += `<option value="${code}">${langs[code]}</option>`;
    to.innerHTML += `<option value="${code}">${langs[code]}</option>`;
  }
  
  from.value = 'en';
  to.value = 'hi';
  
  renderLangs();
};

function renderLangs() {
  const container = document.getElementById('langChips');
  container.innerHTML = '';
  
  for (let code in langs) {
    const btn = document.createElement('button');
    btn.className = 'lang-opt' + (selectedLangs.includes(code) ? ' active' : '');
    btn.textContent = langs[code];
    btn.type = 'button';
    btn.onclick = () => {
      if (selectedLangs.includes(code)) {
        selectedLangs = selectedLangs.filter(c => c !== code);
      } else {
        selectedLangs.push(code);
      }
      renderLangs();
    };
    container.appendChild(btn);
  }
}

document.getElementById('themeBtn').onclick = () => {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
};

document.getElementById('swapBtn').onclick = () => {
  const tmp = document.getElementById('fromLang').value;
  document.getElementById('fromLang').value = document.getElementById('toLang').value;
  document.getElementById('toLang').value = tmp;
};

document.getElementById('clearBtn').onclick = () => {
  document.getElementById('input').value = '';
  document.getElementById('output').value = '';
};

document.getElementById('copyInBtn').onclick = () => {
  navigator.clipboard.writeText(document.getElementById('input').value);
  alert('✅ Copied!');
};

document.getElementById('copyOutBtn').onclick = () => {
  navigator.clipboard.writeText(document.getElementById('output').value);
  alert('✅ Copied!');
};

document.getElementById('speakInBtn').onclick = () => {
  const rec = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  rec.onstart = () => {
    document.getElementById('speakInBtn').innerHTML = '<i class="fas fa-microphone"></i> Listening...';
  };
  rec.onresult = (e) => {
    let txt = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      txt += e.results[i][0].transcript;
    }
    document.getElementById('input').value = txt;
    document.getElementById('speakInBtn').innerHTML = '<i class="fas fa-microphone"></i> Speak';
  };
  rec.start();
};

document.getElementById('translateBtn').onclick = async () => {
  const txt = document.getElementById('input').value.trim();
  const from = document.getElementById('fromLang').value;
  const to = document.getElementById('toLang').value;

  if (!txt || !from || !to) {
    alert('⚠️ Fill all fields');
    return;
  }

  document.getElementById('output').value = '⏳ Translating...';

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(txt)}`;
    const res = await fetch(url);
    const data = await res.json();
    
    if (data && data[0]) {
      let translated = '';
      data[0].forEach(item => {
        if (item[0]) translated += item[0];
      });
      
      document.getElementById('output').value = translated;
      history.unshift({ orig: txt.substring(0, 50), trans: translated.substring(0, 50), date: new Date().toLocaleString() });
      if (history.length > 50) history.pop();
      localStorage.setItem('hist', JSON.stringify(history));
    } else {
      document.getElementById('output').value = 'Translation failed. Please try again.';
    }
  } catch (e) {
    console.error('Translation Error:', e);
    document.getElementById('output').value = 'Connection error. Please check your internet.';
  }
};

document.getElementById('multiBtn').onclick = () => {
  document.getElementById('multiModal').classList.add('open');
};

document.getElementById('multiTranslateBtn').onclick = async () => {
  const txt = document.getElementById('input').value.trim();
  if (!txt) {
    alert('⚠️ Enter text first');
    return;
  }
  if (selectedLangs.length === 0) {
    alert('⚠️ Select at least one language');
    return;
  }

  const res = document.getElementById('multiResults');
  res.innerHTML = '<p style="text-align: center; color: #667eea; font-weight: 600;">⏳ Translating to ' + selectedLangs.length + ' languages...</p>';

  let html = '';
  const fromLang = document.getElementById('fromLang').value || 'en';
  
  for (let lang of selectedLangs) {
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${fromLang}&tl=${lang}&dt=t&q=${encodeURIComponent(txt)}`;
      const r = await fetch(url);
      const d = await r.json();
      
      let translated = '';
      if (d && d[0]) {
        d[0].forEach(item => {
          if (item[0]) translated += item[0];
        });
      }
      
      html += `<div class="result-item"><strong>🌐 ${langs[lang]}</strong><br>${translated || 'Translation failed'}</div>`;
    } catch (e) {
      html += `<div class="result-item"><strong>🌐 ${langs[lang]}</strong><br>❌ Error</div>`;
    }
    await new Promise(r => setTimeout(r, 300));
  }
  res.innerHTML = html || '<p>No results</p>';
};

document.getElementById('historyBtn').onclick = () => {
  const list = document.getElementById('historyList');
  list.innerHTML = history.length === 0 ? '<p>No history</p>' : history.map(h => `<div class="result-item"><strong>${h.orig}</strong><br>${h.trans}<br><small>${h.date}</small></div>`).join('');
  document.getElementById('historyModal').classList.add('open');
};

document.getElementById('shareBtn').onclick = () => {
  const txt = document.getElementById('output').value;
  if (!txt) {
    alert('⚠️ Nothing to share');
    return;
  }
  document.getElementById('shareText').textContent = txt;
  document.getElementById('shareModal').classList.add('open');
};

window.shareVia = function(p) {
  const txt = document.getElementById('output').value;
  const enc = encodeURIComponent(txt);
  
  if (p === 'copy') {
    navigator.clipboard.writeText(txt);
    alert('✅ Copied!');
    return;
  }
  
  let url = '';
  if (p === 'whatsapp') url = `https://wa.me/?text=${enc}`;
  else if (p === 'email') url = `mailto:?body=${enc}`;
  else if (p === 'twitter') url = `https://twitter.com/intent/tweet?text=${enc}`;
  
  if (url) window.open(url, '_blank');
};

document.getElementById('pdfBtn').onclick = () => {
  document.getElementById('pdfModal').classList.add('open');
};

document.getElementById('uploadPdfBtn').onclick = async () => {
  const file = document.getElementById('pdfFile').files[0];
  if (!file) {
    alert('⚠️ Select a PDF file');
    return;
  }
  
  document.getElementById('input').value = '📄 Reading PDF...';
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    
    let text = '';
    for (let i = 0; i < bytes.length; i++) {
      const byte = bytes[i];
      if ((byte >= 32 && byte <= 126) || byte === 10 || byte === 13) {
        text += String.fromCharCode(byte);
      }
    }
    
    text = text.replace(/\x00/g, '').trim();
    
    if (text.length < 20) {
      document.getElementById('input').value = `File: ${file.name}\n\nNote: PDF is image-based or encrypted. Please copy text from PDF and paste here manually.`;
    } else {
      document.getElementById('input').value = text.substring(0, 2000);
    }
    
    alert('✅ PDF loaded successfully!');
    closeModal('pdfModal');
    document.getElementById('pdfFile').value = '';
  } catch (e) {
    console.error('PDF Error:', e);
    document.getElementById('input').value = `File: ${file.name}\n\nNote: Please extract text from PDF manually and paste here to translate.`;
  }
};

document.getElementById('downloadBtn').onclick = () => {
  const txt = document.getElementById('output').value;
  if (!txt) {
    alert('⚠️ Nothing to download');
    return;
  }
  const a = document.createElement('a');
  a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(txt);
  a.download = 'translation_' + new Date().getTime() + '.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

if (localStorage.getItem('darkMode')) {
  document.body.classList.add('dark-mode');
}

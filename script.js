const defaultHTML = `<!DOCTYPE html>
<html lang="ar">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: system-ui, sans-serif; text-align: center; padding-top: 80px; background: #0f172a; color: #fff; margin: 0; }
    h1 { color: #60a5fa; font-size: 2rem; margin-bottom: 10px; }
    p { color: #94a3b8; font-size: 1.1rem; margin-bottom: 25px; }
    button { padding: 12px 28px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 1rem; transition: 0.2s; }
    button:hover { background: #2563eb; }
  </style>
</head>
<body>
  <h1>Jawad Builder 🚀</h1>
  <p>التطبيق جاهز وسلس جداً! ضع كلمة السر واطلب أي موقع تريد إنشاءه.</p>
  <button onclick="alert('كل شيء يعمل بسرعة وسلاسة!')">تجربة الموقع</button>
</body>
</html>`;

document.getElementById('codeArea').value = defaultHTML;

// 1. التبديل بين الوضع الصباحي والليلي لمنصة Builder
function toggleAppTheme() {
  document.body.classList.toggle('light-mode');
  const isLight = document.body.classList.contains('light-mode');
  const themeBtn = document.getElementById('themeToggleBtn');
  const isEn = document.body.classList.contains('en-mode');

  if (isLight) {
    themeBtn.innerHTML = `☀️ ${isEn ? 'Light' : 'صباحي'}`;
  } else {
    themeBtn.innerHTML = `🌙 ${isEn ? 'Dark' : 'مسائي'}`;
  }
}

// 2. التبديل بين اللغة العربية والإنجليزي لمنصة Builder
let appLang = 'ar';
function toggleAppLang() {
  appLang = appLang === 'ar' ? 'en' : 'ar';
  const isEn = appLang === 'en';
  const html = document.documentElement;

  if (isEn) {
    html.lang = 'en';
    html.dir = 'ltr';
    document.body.classList.add('en-mode');
    
    document.getElementById('langToggleBtn').innerText = '🌐 عربي';
    document.getElementById('dlTxt').innerText = 'Download ZIP';
    document.getElementById('secretKey').placeholder = 'Enter OpenRouter API Key...';
    document.getElementById('welcomeMsg').innerText = 'Hello Jawad! Type your request here to build your website.';
    document.getElementById('userInput').placeholder = 'Ask to build a website...';
    document.getElementById('sendBtn').innerText = 'Send';
    document.getElementById('prevTxt').innerText = 'Preview';
    document.getElementById('codeTxt').innerText = 'Code';
    document.getElementById('themeTxt').innerText = document.body.classList.contains('light-mode') ? 'Light' : 'Dark';
  } else {
    html.lang = 'ar';
    html.dir = 'rtl';
    document.body.classList.remove('en-mode');

    document.getElementById('langToggleBtn').innerText = '🌐 English';
    document.getElementById('dlTxt').innerText = 'تنزيل ZIP';
    document.getElementById('secretKey').placeholder = 'ضع كلمة السر (OpenRouter API) هنا...';
    document.getElementById('welcomeMsg').innerText = 'مرحباً جواد! اكتب فكرتك هنا وسأقوم ببناء موقعك فوراً.';
    document.getElementById('userInput').placeholder = 'اطلب تصميم موقع...';
    document.getElementById('sendBtn').innerText = 'إرسال';
    document.getElementById('prevTxt').innerText = 'المعاينة';
    document.getElementById('codeTxt').innerText = 'الكود';
    document.getElementById('themeTxt').innerText = document.body.classList.contains('light-mode') ? 'صباحي' : 'مسائي';
  }
}

// تحديث المعاينة عبر srcdoc
function updatePreview() {
  const code = document.getElementById('codeArea').value;
  const frame = document.getElementById('previewFrame');
  frame.srcdoc = code;
}

document.getElementById('codeArea').addEventListener('input', updatePreview);

// دالة التنقل بين التبويبات
function switchTab(tabName) {
  const previewTab = document.getElementById('previewTab');
  const codeTab = document.getElementById('codeTab');
  const btnPreview = document.getElementById('btnPreview');
  const btnCode = document.getElementById('btnCode');

  if (tabName === 'preview') {
    previewTab.classList.add('active');
    codeTab.classList.remove('active');
    btnPreview.classList.add('active');
    btnCode.classList.remove('active');
    updatePreview();
  } else {
    codeTab.classList.add('active');
    previewTab.classList.remove('active');
    btnCode.classList.add('active');
    btnPreview.classList.remove('active');
  }
}

// توليد الكود عبر الذكاء الاصطناعي
async function generateCode() {
  const secretKey = document.getElementById('secretKey').value.trim();
  const input = document.getElementById('userInput');
  const prompt = input.value.trim();
  
  if (!prompt) return;

  if (!secretKey) {
    alert(appLang === 'en' ? 'Please enter your API Key first!' : 'يرجى إدخال كلمة السر أولاً!');
    return;
  }

  addMessage(prompt, 'user-msg');
  input.value = '';
  addMessage(appLang === 'en' ? 'Generating website code...' : 'جاري بناء وتوليد كود الموقع...', 'ai-msg');

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + secretKey,
        'HTTP-Referer': window.location.href,
        'X-Title': 'Jawad Builder',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        max_tokens: 8000,
        messages: [
          {
            role: 'system',
            content: 'You are an expert web developer. Generate a COMPLETE, FULLY WORKING single-file HTML document (including inline CSS and JavaScript). NEVER truncate or cut off the code. Ensure all HTML tags are properly closed at the end (e.g. </html>). You may use Tailwind CSS via CDN if helpful. Return ONLY the raw HTML code starting with <!DOCTYPE html> without markdown syntax or explanations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    const data = await response.json();

    if (response.ok && data.choices && data.choices[0]) {
      let generatedCode = data.choices[0].message.content;
      
      generatedCode = generatedCode.replace(/^```html/gi, '')
                                   .replace(/^```/gi, '')
                                   .replace(/```$/gi, '')
                                   .trim();

      document.getElementById('codeArea').value = generatedCode;
      updatePreview();
      switchTab('preview');
      addMessage(appLang === 'en' ? 'Website built successfully!' : 'تم بناء الموقع بنجاح!', 'ai-msg');
    } else {
      const errDetail = data.error ? data.error.message : 'Check API Key.';
      addMessage((appLang === 'en' ? 'Error: ' : 'خطأ: ') + errDetail, 'ai-msg');
    }

  } catch (err) {
    addMessage(appLang === 'en' ? 'Network error.' : 'حدث خطأ أثناء الاتصال بالشبكة.', 'ai-msg');
  }
}

document.getElementById('sendBtn').addEventListener('click', generateCode);
document.getElementById('userInput').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') generateCode();
});

function addMessage(text, className) {
  const box = document.getElementById('chatBox');
  const msg = document.createElement('div');
  msg.className = 'msg ' + className;
  msg.innerText = text;
  box.appendChild(msg);
  box.scrollTop = box.scrollHeight;
}

document.getElementById('dlBtn').addEventListener('click', function() {
  const zip = new JSZip();
  const code = document.getElementById('codeArea').value;
  zip.file("index.html", code);
  zip.generateAsync({type:"blob"}).then(function(content) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(content);
    a.download = "jawad-project.zip";
    a.click();
  });
});

updatePreview();
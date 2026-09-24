// Generated from content/locales.json and templates/languages.js.
window.TFP_LOCALES = {
  "en": {
    "name": "English",
    "language": "Language",
    "consent": {
      "label": "Website analytics",
      "question": "Allow analytics cookies to help us understand visits and app download clicks?",
      "privacy": "Privacy details",
      "decline": "No thanks",
      "accept": "Allow analytics",
      "settings": "Analytics settings"
    }
  },
  "de": {
    "name": "Deutsch",
    "language": "Sprache",
    "consent": {
      "label": "Website-Analyse",
      "question": "Dürfen wir Analyse-Cookies verwenden, um Besuche und Klicks auf App-Downloads zu erfassen?",
      "privacy": "Datenschutz (Englisch)",
      "decline": "Nein, danke",
      "accept": "Zulassen",
      "settings": "Analyse-Einstellungen"
    }
  },
  "es": {
    "name": "Español",
    "language": "Idioma",
    "consent": {
      "label": "Analítica del sitio",
      "question": "¿Permites cookies de analítica para medir las visitas y los clics en los enlaces de descarga de la app?",
      "privacy": "Privacidad (en inglés)",
      "decline": "No, gracias",
      "accept": "Permitir",
      "settings": "Ajustes de analítica"
    }
  },
  "fr": {
    "name": "Français",
    "language": "Langue",
    "consent": {
      "label": "Statistiques du site",
      "question": "Autoriser les cookies de mesure d’audience pour compter les visites et les clics sur les liens de téléchargement de l’application ?",
      "privacy": "Confidentialité (en anglais)",
      "decline": "Non merci",
      "accept": "Autoriser",
      "settings": "Réglages des statistiques"
    }
  },
  "it": {
    "name": "Italiano",
    "language": "Lingua",
    "consent": {
      "label": "Analisi del sito",
      "question": "Consenti i cookie di analisi per misurare le visite e i clic sui link per scaricare l’app?",
      "privacy": "Privacy (in inglese)",
      "decline": "No, grazie",
      "accept": "Consenti",
      "settings": "Impostazioni di analisi"
    }
  },
  "ja": {
    "name": "日本語",
    "language": "言語",
    "consent": {
      "label": "サイトのアクセス解析",
      "question": "訪問数やアプリのダウンロードリンクのクリック数を把握するため、アクセス解析用Cookieを許可しますか？",
      "privacy": "プライバシー（英語）",
      "decline": "許可しない",
      "accept": "許可する",
      "settings": "アクセス解析の設定"
    }
  },
  "ko": {
    "name": "한국어",
    "language": "언어",
    "consent": {
      "label": "사이트 분석",
      "question": "방문 수와 앱 다운로드 링크 클릭 수를 파악할 수 있도록 분석 쿠키를 허용하시겠어요?",
      "privacy": "개인정보 처리방침 (영어)",
      "decline": "허용 안 함",
      "accept": "허용",
      "settings": "분석 설정"
    }
  },
  "pl": {
    "name": "Polski",
    "language": "Język",
    "consent": {
      "label": "Analityka strony",
      "question": "Czy zezwalasz na pliki cookie analityki, abyśmy mogli mierzyć wizyty i kliknięcia linków do pobrania aplikacji?",
      "privacy": "Prywatność (po angielsku)",
      "decline": "Nie, dziękuję",
      "accept": "Zezwól",
      "settings": "Ustawienia analityki"
    }
  },
  "pt-BR": {
    "name": "Português (Brasil)",
    "language": "Idioma",
    "consent": {
      "label": "Análise do site",
      "question": "Permitir cookies de análise para medir visitas e cliques nos links para baixar o app?",
      "privacy": "Privacidade (em inglês)",
      "decline": "Não, obrigado",
      "accept": "Permitir",
      "settings": "Configurações de análise"
    }
  },
  "ru": {
    "name": "Русский",
    "language": "Язык",
    "consent": {
      "label": "Аналитика сайта",
      "question": "Разрешить cookies аналитики, чтобы мы могли считать посещения и переходы к скачиванию приложения?",
      "privacy": "О конфиденциальности (на английском)",
      "decline": "Нет, спасибо",
      "accept": "Разрешить",
      "settings": "Настройки аналитики"
    }
  }
};
document.addEventListener('DOMContentLoaded', () => {
  const locale = window.TFP_LOCALES[document.documentElement.lang] || window.TFP_LOCALES.en;
  document.querySelectorAll('.language-picker').forEach(picker => {
    picker.querySelector('.language-current').textContent = locale.name;
    picker.querySelector('.language-nav').setAttribute('aria-label', locale.language);
    picker.querySelectorAll('[data-lang]').forEach(link => {
      if (link.dataset.lang === document.documentElement.lang) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    document.addEventListener('click', event => {
      if (!picker.contains(event.target)) picker.open = false;
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && picker.open) {
        picker.open = false;
        picker.querySelector('summary').focus();
      }
    });
  });
});

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    en: {
        translation: {
            "Saklain Cloth House": "Saklain Cloth House",
            "Dashboard": "Dashboard",
            "Buy Items": "Buy Items",
            "Sellers Ledger": "Sellers Ledger",
            "Sell Items": "Sell Items",
            "Buyers Ledger": "Buyers Ledger",
            "Reports": "Reports",
            "Search Records": "Search Records",
            "Settings": "Settings",
            "Login": "Login",
            "Email": "Email",
            "Password": "Password",
            "Total Pending Payable": "Total Pending Payable",
            "Total Pending Receivable": "Total Pending Receivable"
        }
    },
    ur: {
        translation: {
            "Saklain Cloth House": "ثقلین کلاتھ ہاؤس",
            "Dashboard": "ڈیش بورڈ",
            "Buy Items": "خریداری (بروکر سے)",
            "Sellers Ledger": "دکانداروں کا لیجر",
            "Sell Items": "فروخت (گاہک کو)",
            "Buyers Ledger": "گاہکوں کا کھاتہ",
            "Reports": "رپورٹس",
            "Search Records": "ریکارڈ تلاش کریں",
            "Settings": "ترتیبات",
            "Login": "لاگ ان کریں",
            "Email": "ای میل",
            "Password": "پاس ورڈ",
            "Total Pending Payable": "کل قابل ادا رقم",
            "Total Pending Receivable": "کل قابل وصول رقم"
        }
    }
};

const savedLang = localStorage.getItem('app_lang') || 'en';

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: savedLang,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;

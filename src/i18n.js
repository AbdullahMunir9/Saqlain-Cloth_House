import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    en: {
        translation: {
            "Saklain Cloth House": "Saklain Cloth House",
            "Dashboard": "Dashboard",
            "Buy from Dealer": "Buy from Dealer",
            "Dealer Hisaab": "Dealer Hisaab",
            "Sell Items": "Sell Items",
            "Kharidar ka hisaab": "Kharidar ka hisaab",
            "Settings": "Settings",
            "Login": "Login",
            "Email": "Email",
            "Password": "Password",
            "Total Pending Payable": "Total dene wale",
            "Total Pending Receivable": "Total lene wale",
            "Total Sellers": "Total Dealers",
            "Total Buyers": "Total Kharidars",
            "Select Dealer": "Select Dealer",
            "-- Choose Dealer --": "-- Choose Dealer --",
            "Dealer Name": "Dealer Name",
            "Select Kharidar": "Select Kharidar",
            "-- Choose Kharidar --": "-- Choose Kharidar --",
            "Kharidar Name": "Kharidar Name"
        }
    },
    ur: {
        translation: {
            "Saklain Cloth House": "ثقلین کلاتھ ہاؤس",
            "Dashboard": "ڈیش بورڈ",
            "Buy from Dealer": "ڈیلر سے خریداری",
            "Dealer Hisaab": "ڈیلر کا حساب",
            "Sell Items": "فروخت (گاہک کو)",
            "Kharidar ka hisaab": "خریدار کا حساب",
            "Settings": "ترتیبات",
            "Login": "لاگ ان کریں",
            "Email": "ای میل",
            "Password": "پاس ورڈ",
            "Total Pending Payable": "کل دینے والے",
            "Total Pending Receivable": "کل لینے والے",
            "Total Sellers": "کل ڈیلرز",
            "Total Buyers": "کل خریدار",
            "Select Dealer": "ڈیلر منتخب کریں",
            "-- Choose Dealer --": "-- ڈیلر کا انتخاب کریں --",
            "Dealer Name": "ڈیلر کا نام",
            "Select Kharidar": "خریدار منتخب کریں",
            "-- Choose Kharidar --": "-- خریدار کا انتخاب کریں --",
            "Kharidar Name": "خریدار کا نام"
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

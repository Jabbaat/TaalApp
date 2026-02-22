import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Translation resources
const resources = {
    en: {
        translation: {
            "welcome": "Welcome",
            "logout": "Logout",
            "your_profile": "Your Profile",
            "native_language": "Native Language",
            "target_language": "Target Language",
            "skill_level": "Skill Level",
            "action_center": "Action Center",
            "generate_lesson": "Generate New Lesson",
            "practice_vocab": "Practice Vocabulary",
            "pronunciation_check": "Pronunciation Check",
            "chat_tutor": "Chat with AI Tutor",
            "your_lessons": "Your Lessons",
            "no_lessons": "No lessons generated yet. Click \"Generate New Lesson\" to start!",
            "generating": "Generating..."
        }
    },
    nl: {
        translation: {
            "welcome": "Welkom",
            "logout": "Uitloggen",
            "your_profile": "Je Profiel",
            "native_language": "Moedertaal",
            "target_language": "Doeltaal",
            "skill_level": "Niveau",
            "action_center": "Actiecentrum",
            "generate_lesson": "Genereer Nieuwe Les",
            "practice_vocab": "Oefen Woordenschat",
            "pronunciation_check": "Uitspraak Check",
            "chat_tutor": "Chat met AI Tutor",
            "your_lessons": "Je Lessen",
            "no_lessons": "Nog geen lessen gegenereerd. Klik op \"Genereer Nieuwe Les\" om te beginnen!",
            "generating": "Bezig met genereren..."
        }
    },
    sv: {
        translation: {
            "welcome": "Välkommen",
            "logout": "Logga ut",
            "your_profile": "Din Profil",
            "native_language": "Modersmål",
            "target_language": "Målspråk",
            "skill_level": "Nivå",
            "action_center": "Åtgärdscenter",
            "generate_lesson": "Generera Ny Lektion",
            "practice_vocab": "Öva Ordförråd",
            "pronunciation_check": "Uttalskontroll",
            "chat_tutor": "Chatta med AI-handledare",
            "your_lessons": "Dina Lektioner",
            "no_lessons": "Inga lektioner genererade ännu. Klicka på \"Generera Ny Lektion\" för att börja!",
            "generating": "Genererar..."
        }
    },
    fr: {
        translation: {
            "welcome": "Bienvenue",
            "logout": "Déconnexion",
            "your_profile": "Votre Profil",
            "native_language": "Langue Maternelle",
            "target_language": "Langue Cible",
            "skill_level": "Niveau de Compétence",
            "action_center": "Centre d'Action",
            "generate_lesson": "Générer une Nouvelle Leçon",
            "practice_vocab": "Pratiquer le Vocabulaire",
            "pronunciation_check": "Vérification de la Prononciation",
            "chat_tutor": "Discuter avec le Tuteur IA",
            "your_lessons": "Vos Leçons",
            "no_lessons": "Aucune leçon générée pour le moment. Cliquez sur \"Générer une Nouvelle Leçon\" pour commencer !",
            "generating": "Génération..."
        }
    },
    it: {
        translation: {
            "welcome": "Benvenuto",
            "logout": "Disconnessione",
            "your_profile": "Il Tuo Profilo",
            "native_language": "Madrelingua",
            "target_language": "Lingua di Destinazione",
            "skill_level": "Livello di Competenza",
            "action_center": "Centro Azioni",
            "generate_lesson": "Genera Nuova Lezione",
            "practice_vocab": "Pratica Vocabolario",
            "pronunciation_check": "Controllo Pronuncia",
            "chat_tutor": "Chatta con il Tutor IA",
            "your_lessons": "Le Tue Lezioni",
            "no_lessons": "Nessuna lezione generata ancora. Clicca su \"Genera Nuova Lezione\" per iniziare!",
            "generating": "Generazione..."
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: "en",
        interpolation: {
            escapeValue: false // react already safes from xss
        }
    });

export default i18n;

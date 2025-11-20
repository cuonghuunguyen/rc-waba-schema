import type { BotConfig } from '../types';

export const LANGUAGES = ['en', 'ar', 'es', 'fr'];

export const SYSTEM_NODES = ['greeting', 'selectLanguage', 'wrongSelection', 'technicalError'];

export const INITIAL_SCHEMA: BotConfig = {
	greeting: [{
		text: { en: "Hello! How can I help you?", ar: "مرحبا! كيف يمكنني مساعدتك؟" },
		buttons: [{ payload: "menu", title: { en: "Menu", ar: "القائمة" } }]
	}],
	selectLanguage: [{
		selectLanguage: { language: "en" },
		text: "Please select your language / الرجاء اختيار اللغة",
		buttons: [
			{ payload: "greeting", title: "English" },
			{ payload: "greeting", title: "العربية" }
		]
	}],
	wrongSelection: [{ text: "I didn't understand that. Please try again." }],
	technicalError: [{ text: "System error. Please try later." }],
	// Custom node examples
	menu: [{
		text: "Here are our services:",
		buttons: [
			{ payload: "support", title: "Support" },
			{ payload: "sales", title: "Sales" }
		]
	}],
	support: [{ text: "Connecting you to support...", transfer: { department: "CustomerService" } }],
	sales: [{ text: "Our sales team is available 9-5.", close: { reason: "End of flow" } }],
	// Example of a Reference Node
	sales_redirect: { ref: "sales" }
};

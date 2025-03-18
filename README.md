# Rocket.Chat Easy Bot App - User Guide

This guide will help you configure and use the Rocket.Chat Easy Bot App to create a simple button-based bot. The bot can
greet users, send messages, images, or videos, and perform actions like closing or forwarding chats. The bot's behavior
is defined using a JSON configuration provided in the app settings.

---

## Features

1. **Text Responses**: Send text messages to users.
2. **Buttons**: Provide users with clickable buttons for interaction.
3. **Lists**: Display horizontal button lists.
4. **Images**: Send images with optional captions.
5. **Actions**:
    - **Transfer Chat**: Forward the chat to a specific department.
    - **Close Chat**: End the chat with a reason.
    - **Select Language**: Change the language of the conversation.

---

### Explanation of Properties in `IBotResponse`

| Property         | Type                   | Description                                                                                                                                                        |
|------------------|------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `text`           | `Localizable`          | An optional text response from the bot. Can be a string or an object with language-specific strings.                                                               |
| `buttons`        | `IWhatsAppButton[]`    | An optional array of buttons included in the bot response. Each button has a `payload`, `title`, and optional `description`.                                       |
| `list`           | `IWhatsAppButton[]`    | An optional list of buttons displayed horizontally. Similar to `buttons`, each item has a `payload`, `title`, and optional `description`.                          |
| `image`          | `string`               | An optional image URL included in the bot response. The URL must point to a valid image resource.                                                                  |
| `transfer`       | `ActionTransferRoom`   | An optional action to transfer the room to a specific department. Includes properties like `department`, `fallbackDepartment`, `conditions`, and `welcomeMessage`. |
| `close`          | `ActionCloseRoom`      | An optional action to close the room. Includes an optional `reason` for closing the room.                                                                          |
| `selectLanguage` | `ActionSelectLanguage` | An optional action to select a language. Includes the `language` property to specify the selected language.                                                        |

---

### Explanation of Related Types

#### `IWhatsAppButton`

| Property      | Type          | Description                                                                                         |
|---------------|---------------|-----------------------------------------------------------------------------------------------------|
| `payload`     | `string`      | The payload to be sent when the button is clicked.                                                  |
| `title`       | `Localizable` | The title of the button. Can be a string or an object with language-specific strings.               |
| `description` | `Localizable` | An optional description of the button. Can be a string or an object with language-specific strings. |

#### `ActionTransferRoom`

| Property             | Type                     | Description                                                                         |
|----------------------|--------------------------|-------------------------------------------------------------------------------------|
| `department`         | `string`                 | The department to transfer the room to.                                             |
| `fallbackDepartment` | `string` (optional)      | An optional fallback department if the primary department is unavailable.           |
| `conditions`         | `object` (optional)      | Optional conditions for transferring the room, such as business hours and workdays. |
| `welcomeMessage`     | `Localizable` (optional) | An optional welcome message to display after the transfer.                          |

#### `ActionCloseRoom`

| Property | Type          | Description                                                                                           |
|----------|---------------|-------------------------------------------------------------------------------------------------------|
| `reason` | `Localizable` | An optional reason for closing the room. Can be a string or an object with language-specific strings. |

#### `ActionSelectLanguage`

| Property   | Type     | Description             |
|------------|----------|-------------------------|
| `language` | `string` | The language to select. |

#### `Localizable`

| Type                         | Description                                                                                               |
|------------------------------|-----------------------------------------------------------------------------------------------------------|
| `string`                     | A single string for the default language.                                                                 |
| `{ [lang: string]: string }` | An object where keys are language codes (e.g., `en`, `es`) and values are the corresponding translations. |

### Key Properties for Bot Responses

1. **text**: Sends a text message to the user.
    - Can be a string or an object with additional properties.
    - Maximum length: 4096 characters.
    - Cannot be numeric-only.

2. **buttons**: Sends a list of buttons (1-3 buttons).
    - Each button requires:
        - `payload`: A string that determines the next bot response.
        - `title`: A string (1-20 characters) that appears on the button.

3. **list**: Sends a horizontal button list (1-10 items).
    - Each list item requires:
        - `payload`: A string that determines the next bot response.
        - `title`: A string (1-24 characters) that appears on the list item.
        - `description` (optional): A string (maximum 72 characters) for additional details.

4. **image**: Sends an image.
    - Must be a valid URI ending with `.jpg`, `.jpeg`, or `.png`.

5. **imageCaption**: Sends a caption for the image.
    - Maximum length: 1024 characters.

6. **transfer**: Transfers the chat to a specific department.
    - Requires:
        - `department`: The target department.
        - `fallbackDepartment` (optional): A backup department if the target is unavailable.
        - `conditions` (optional): Define business hours and workdays.
        - `welcomeMessage` (optional): A message displayed during the transfer.

7. **close**: Closes the chat.
    - Optional `reason`: A string (maximum 4096 characters) explaining why the chat was closed.

8. **selectLanguage**: Prompts the user to select a language.
    - Requires:
        - `language`: A string (`"ar"` or `"en"`) representing the language.

---

### Example Configuration

Below is an example JSON configuration for a bot:

```json
{
	"selectLanguage": [
		{
			"text": "Please select your language:",
			"buttons": [
				{
					"payload": "en",
					"title": "English"
				},
				{
					"payload": "ar",
					"title": "Arabic"
				}
			]
		}
	],
	"greeting": [
		{
			"text": "Welcome! How can I assist you today?",
			"buttons": [
				{
					"payload": "help",
					"title": "Help"
				},
				{
					"payload": "info",
					"title": "Info"
				}
			]
		}
	],
	"help": [
		{
			"text": "Here are some options to assist you:",
			"buttons": [
				{
					"payload": "transferEngineering",
					"title": "Talk to Engineering"
				},
				{
					"payload": "closeChat",
					"title": "Close Chat"
				}
			]
		}
	],
	"transferEngineering": [
		{
			"transfer": {
				"department": "Engineering",
				"fallbackDepartment": "Support",
				"conditions": {
					"startBusinessHour": "09:00",
					"stopBusinessHour": "17:00",
					"workDays": [
						"mo",
						"tu",
						"we",
						"th",
						"fr"
					]
				},
				"welcomeMessage": "You are being transferred to the Engineering department."
			}
		}
	],
	"closeChat": [
		{
			"close": {
				"reason": "The user has chosen to close the chat."
			}
		}
	]
}
```

```json
{
	"selectLanguage": [
		{
			"text": {
				"en": "Please select your language:",
				"es": "Por favor seleccione su idioma:"
			},
			"buttons": [
				{
					"payload": "en",
					"title": {
						"en": "English",
						"es": "Inglés"
					}
				},
				{
					"payload": "es",
					"title": {
						"en": "Spanish",
						"es": "Español"
					}
				}
			]
		}
	],
	"greeting": [
		{
			"text": {
				"en": "Welcome! How can I assist you today?",
				"es": "¡Bienvenido! ¿Cómo puedo ayudarte hoy?"
			},
			"buttons": [
				{
					"payload": "help",
					"title": {
						"en": "Help",
						"es": "Ayuda"
					}
				},
				{
					"payload": "info",
					"title": {
						"en": "Info",
						"es": "Información"
					}
				}
			]
		}
	],
	"help": [
		{
			"text": {
				"en": "Here are some options to assist you:",
				"es": "Aquí hay algunas opciones para ayudarte:"
			},
			"buttons": [
				{
					"payload": "transferEngineering",
					"title": {
						"en": "Talk to Engineering",
						"es": "Hablar con Ingeniería"
					}
				},
				{
					"payload": "closeChat",
					"title": {
						"en": "Close Chat",
						"es": "Cerrar Chat"
					}
				}
			]
		}
	],
	"transferEngineering": [
		{
			"transfer": {
				"department": "Engineering",
				"fallbackDepartment": "Support",
				"welcomeMessage": {
					"en": "You are being transferred to the Engineering department.",
					"es": "Está siendo transferido al departamento de Ingeniería."
				}
			}
		}
	],
	"closeChat": [
		{
			"close": {
				"reason": {
					"en": "The user has chosen to close the chat.",
					"es": "El usuario ha elegido cerrar el chat."
				}
			}
		}
	]
}
```


### Real-Life Scenarios for Bot Configuration

Here are some practical examples of how you can configure the Rocket.Chat Easy Bot App for real-life scenarios:

---

#### 1. **Customer Support Bot**

**Scenario**: A bot that helps users with common support tasks, such as FAQs, transferring to a support agent, or
closing the chat.

**Configuration**:

```json
{
    "greeting": [
        {
            "text": "Welcome to Customer Support! How can I assist you today?",
            "buttons": [
                { "payload": "faq", "title": "FAQs" },
                { "payload": "transferSupport", "title": "Talk to Support" },
                { "payload": "closeChat", "title": "Close Chat" }
            ]
        }
    ],
    "faq": [
        {
            "text": "Here are some frequently asked questions:",
            "list": [
                { "payload": "faq1", "title": "What are your business hours?" },
                { "payload": "faq2", "title": "How can I reset my password?" }
            ]
        }
    ],
    "faq1": [
        {
            "text": "Our business hours are Monday to Friday, 9 AM to 5 PM."
        }
    ],
    "faq2": [
        {
            "text": "To reset your password, click on 'Forgot Password' on the login page."
        }
    ],
    "transferSupport": [
        {
            "transfer": {
                "department": "Support",
                "welcomeMessage": "You are being transferred to a support agent."
            }
        }
    ],
    "closeChat": [
        {
            "close": {
                "reason": "The user has chosen to close the chat."
            }
        }
    ]
}
```

---

#### 2. **E-Commerce Bot**

**Scenario**: A bot that helps users browse products, track orders, or contact sales.

**Configuration**:

```json
{
	"greeting": [
		{
			"text": "Welcome to our store! How can I assist you today?",
			"buttons": [
				{
					"payload": "browseProducts",
					"title": "Browse Products"
				},
				{
					"payload": "trackOrder",
					"title": "Track My Order"
				},
				{
					"payload": "contactSales",
					"title": "Contact Sales"
				}
			]
		}
	],
	"browseProducts": [
		{
			"text": "Here are some categories to explore:",
			"list": [
				{
					"payload": "electronics",
					"title": "Electronics"
				},
				{
					"payload": "fashion",
					"title": "Fashion"
				},
				{
					"payload": "home",
					"title": "Home & Kitchen"
				}
			]
		}
	],
	"trackOrder": [
		{
			"text": "Please provide your order ID to track your order."
		}
	],
	"contactSales": [
		{
			"transfer": {
				"department": "Sales",
				"welcomeMessage": "You are being transferred to our sales team."
			}
		}
	]
}
```

```json
{
	"$schema": "http://json-schema.org/draft-07/schema#",
	"title": "Bot Reply Schema",
	"oneOf": [
		{
			"type": "object",
			"properties": {
				"ref": {
					"type": "string"
				}
			},
			"required": [
				"ref"
			],
			"additionalProperties": false
		},
		{
			"type": "object",
			"required": [
				"greeting",
				"selectLanguage",
				"wrongSelection",
				"technicalError"
			],
			"additionalProperties": {
				"type": "array",
				"items": {
					"type": "object",
					"properties": {
						"text": {
							"oneOf": [
								{
									"type": "object",
									"additionalProperties": {
										"type": "string",
										"maxLength": 4096,
										"not": {
											"pattern": "^[0-9]+$"
										}
									}
								},
								{
									"type": "string",
									"maxLength": 4096,
									"not": {
										"pattern": "^[0-9]+$"
									}
								}
							]
						},
						"buttons": {
							"type": "array",
							"minItems": 1,
							"maxItems": 3,
							"items": {
								"type": "object",
								"required": [
									"payload",
									"title"
								],
								"properties": {
									"payload": {
										"type": "string"
									},
									"title": {
										"oneOf": [
											{
												"type": "object",
												"additionalProperties": {
													"type": "string",
													"minLength": 1,
													"maxLength": 20,
													"not": {
														"pattern": "^[0-9]+$"
													}
												}
											},
											{
												"type": "string",
												"minLength": 1,
												"maxLength": 20,
												"not": {
													"pattern": "^[0-9]+$"
												}
											}
										]
									}
								}
							}
						},
						"list": {
							"type": "array",
							"minItems": 1,
							"maxItems": 10,
							"items": {
								"type": "object",
								"required": [
									"payload",
									"title"
								],
								"properties": {
									"payload": {
										"type": "string"
									},
									"title": {
										"oneOf": [
											{
												"type": "object",
												"additionalProperties": {
													"type": "string",
													"minLength": 1,
													"maxLength": 24,
													"not": {
														"pattern": "^[0-9]+$"
													}
												}
											},
											{
												"type": "string",
												"minLength": 1,
												"maxLength": 24,
												"not": {
													"pattern": "^[0-9]+$"
												}
											}
										]
									},
									"description": {
										"oneOf": [
											{
												"type": "object",
												"additionalProperties": {
													"type": "string",
													"maxLength": 72
												}
											},
											{
												"type": "string",
												"maxLength": 72
											}
										]
									}
								}
							}
						},
						"image": {
							"oneOf": [
								{
									"type": "object",
									"additionalProperties": {
										"type": "string",
										"format": "uri",
										"pattern": "\\.(jpg|jpeg|png)$"
									}
								},
								{
									"type": "string",
									"format": "uri",
									"pattern": "\\.(jpg|jpeg|png)$"
								}
							]
						},
						"imageCaption": {
							"oneOf": [
								{
									"type": "object",
									"additionalProperties": {
										"type": "string",
										"maxLength": 1024
									}
								},
								{
									"type": "string",
									"maxLength": 1024
								}
							]
						},
						"transfer": {
							"type": "object",
							"required": [
								"department"
							],
							"properties": {
								"department": {
									"type": "string"
								},
								"fallbackDepartment": {
									"type": "string"
								},
								"conditions": {
									"type": "object",
									"properties": {
										"startBusinessHour": {
											"type": "string",
											"pattern": "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
										},
										"stopBusinessHour": {
											"type": "string",
											"pattern": "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
										},
										"workDays": {
											"type": "array",
											"items": {
												"type": "string",
												"enum": [
													"mo",
													"tu",
													"we",
													"th",
													"fr",
													"sa",
													"su"
												]
											}
										}
									}
								},
								"welcomeMessage": {
									"oneOf": [
										{
											"type": "object",
											"additionalProperties": {
												"type": "string",
												"maxLength": 4096
											}
										},
										{
											"type": "string",
											"maxLength": 4096
										}
									]
								}
							}
						},
						"close": {
							"type": "object",
							"properties": {
								"reason": {
									"oneOf": [
										{
											"type": "object",
											"additionalProperties": {
												"type": "string",
												"maxLength": 4096
											}
										},
										{
											"type": "string",
											"maxLength": 4096
										}
									]
								}
							}
						},
						"selectLanguage": {
							"type": "object",
							"required": [
								"language"
							],
							"properties": {
								"language": {
									"type": "string",
									"enum": [
										"ar",
										"en"
									]
								}
							}
						}
					}
				}
			}
		}
	]
}

```

Given a Json schema for the structure of a bot reply object that defines the flow of a bot conversation.
Details: Conversation Flow Model

The conversation flow is an implicit directed graph:

Node = entryId

Edge = button.id from any response inside that entry

Example:
greeting → menu if greeting[0].buttons[0].id = "menu"

There is no separate flow object, the graph is derived solely from button linking.

When the conversation starts, if the user has not selected a language yet, the bot sends the selectLanguage response. Then, when the user selects a language, the bot sends the greeting response in the selected language.
If the user clicks on a button in any response, the bot sends the response corresponding to the button's id.
If the user input does not match any button id in the current response, the bot sends the wrongSelection response. and then the bot send the current response again or if the current response has no buttons, the bot sends the greeting response again.

Each text entry can be a string or an localization object with language codes as keys and localized strings as values.

Requirements for the UI:
1. Display the conversation flow as a directed graph, with nodes representing entryIds and edges representing button links.
2. Allow users to add, edit, and delete entryIds (nodes) in the conversation flow.
3. Allow users to add, edit, and delete buttons (edges) within each entryId.
4. Provide a way to visualize the flow of the conversation, showing how users can navigate through different entryIds by clicking buttons.
5. Include validation to ensure that button ids link
6. Provide a preview mode to simulate the conversation flow based on the current bot reply object.
7. Support localization by allowing users to add multiple language versions for text entries.
8. Ensure that the UI is user-friendly and intuitive, with clear instructions and tooltips where necessary.
9. Allow users to save and export the bot reply object in JSON format.
10. Implement error handling to manage invalid configurations, such as missing entryIds or button links that do not correspond to any entryId.
11. Provide a search functionality to quickly find and navigate to specific entryIds or buttons within the conversation flow.
12. Allow users to test the conversation flow by simulating user inputs and observing the bot's responses.
13. The should be flexible enough to support future extensions, such as adding new types of responses or conditions for transitions between entryIds.ing to existing entryIds.
14. When the user edit the actions, such as transfer or close, the UI should provide specific fields to configure the details of these actions.

Build a user interface (UI) that meets the above requirements for managing and visualizing the bot reply conversation flow based on the provided JSON schema. Use any suitable web development framework or library of your choice. 

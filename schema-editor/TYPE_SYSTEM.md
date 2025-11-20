# WhatsApp Bot Schema - Type System Documentation

This document describes the TypeScript type system used in the schema editor, which ensures compliance with the WhatsApp bot JSON schema.

## Core Types

### Localizable
```typescript
type Localizable = string | { [lang: string]: string };
```
Represents text that can be either a simple string or a localized object with language keys (e.g., `{en: "Hello", ar: "مرحبا"}`).

### IWhatsAppButton
```typescript
interface IWhatsAppButton {
  title: Localizable;
  payload?: string;
}
```
Represents a button that can be displayed to users. 
- **title**: Button label (1-20 characters, cannot be only numbers)
- **payload**: Optional node ID to navigate to when clicked

### IWhatsAppListItem
```typescript
interface IWhatsAppListItem {
  title: Localizable;
  description?: Localizable;
  payload?: string;
}
```
Represents an item in a selection list.
- **title**: Item label (1-24 characters)
- **description**: Optional description (max 72 characters)
- **payload**: Optional node ID to navigate to when selected

### IBotResponse
```typescript
interface IBotResponse {
  text?: Localizable;
  image?: Localizable;
  buttons?: IWhatsAppButton[];
  list?: IWhatsAppListItem[];
  selectLanguage?: { language: string };
  transfer?: ActionTransferRoom;
  close?: ActionCloseRoom;
}
```
Represents a single bot response with various possible components:
- **text**: Message text (max 4096 characters)
- **image**: Image URL (must end with .jpg, .jpeg, or .png)
- **buttons**: Array of buttons (1-3 items max)
- **list**: Array of list items (1-10 items max)
- **selectLanguage**: Language selection action
- **transfer**: Transfer to agent action
- **close**: Close conversation action

### ActionTransferRoom
```typescript
interface ActionTransferRoom {
  department?: string;
  businessHours?: {
    start: string;  // Format: "HH:MM"
    end: string;    // Format: "HH:MM"
    workDays: number[];  // 0=Sunday, 1=Monday, etc.
  };
}
```
Defines how to transfer a conversation to a human agent.

### ActionCloseRoom
```typescript
interface ActionCloseRoom {
  reason?: string;
}
```
Defines how to close/end a conversation.

### IBotResponseRef
```typescript
interface IBotResponseRef {
  ref: string;
}
```
A reference to another node (allows creating aliases or shared responses).

### BotNode
```typescript
type BotNode = IBotResponse[] | IBotResponseRef;
```
A node can be either:
- An array of responses (standard node)
- A reference to another node

### BotConfig
```typescript
type BotConfig = {
  [nodeId: string]: BotNode;
};
```
The complete bot configuration - a mapping of node IDs to their content.

## Validation Utilities

The type system includes validation functions to ensure schema compliance:

### validateTimeFormat(time: string): boolean
Validates time format as "HH:MM" (e.g., "09:00", "17:30").

### validateImageUrl(url: string): boolean
Validates that image URLs end with .jpg, .jpeg, or .png.

### validateButtonTitle(title: string): boolean
Validates button titles:
- Length: 1-20 characters
- Cannot be only numbers

### validateListTitle(title: string): boolean
Validates list item titles:
- Length: 1-24 characters

### validateText(text: Localizable, maxLength: number = 4096): boolean
Validates text content doesn't exceed maximum length.

### validateBotResponse(response: IBotResponse): string[]
Validates a complete bot response, returns array of error messages.

### validateBotConfig(config: BotConfig): { valid: boolean; errors: string[] }
Validates the entire bot configuration, returns validation result with any errors.

## Constraints Summary

| Element | Constraint |
|---------|-----------|
| Button title | 1-20 chars, not only numbers |
| List item title | 1-24 chars |
| List item description | Max 72 chars |
| Response text | Max 4096 chars |
| Buttons per response | 1-3 items |
| List items per response | 1-10 items |
| Image URL | Must end with .jpg, .jpeg, or .png |
| Business hours time | Format "HH:MM" |
| Work days | Array of 0-6 (0=Sunday) |

## System Nodes

The following node IDs are reserved as system nodes (cannot be deleted):
- `greeting`: Initial greeting message
- `selectLanguage`: Language selection prompt
- `wrongSelection`: Error message for invalid selections
- `technicalError`: Error message for system failures

## Example Usage

```typescript
// Simple text response
const simpleNode: BotNode = [{
  text: "Hello! How can I help you?"
}];

// Localized text with buttons
const menuNode: BotNode = [{
  text: {
    en: "Please select an option:",
    ar: "الرجاء اختيار خيار:"
  },
  buttons: [
    { title: "Support", payload: "support" },
    { title: "Sales", payload: "sales" }
  ]
}];

// Transfer to agent with business hours
const transferNode: BotNode = [{
  text: "Connecting you to an agent...",
  transfer: {
    department: "CustomerService",
    businessHours: {
      start: "09:00",
      end: "17:00",
      workDays: [1, 2, 3, 4, 5]  // Monday-Friday
    }
  }
}];

// Reference node (alias)
const redirectNode: BotNode = {
  ref: "menu"
};

// Complete configuration
const config: BotConfig = {
  greeting: simpleNode,
  menu: menuNode,
  support: transferNode,
  sales_redirect: redirectNode
};

// Validate before export
const validation = validateBotConfig(config);
if (!validation.valid) {
  console.error("Validation errors:", validation.errors);
}
```

## Migration Notes

If you have existing configurations using old type names:
- `LocalizedText` → `Localizable`
- `BotResponse` → `IBotResponse`

The validation system will help identify any schema violations in existing configurations.

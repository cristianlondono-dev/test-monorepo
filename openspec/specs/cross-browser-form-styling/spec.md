# cross-browser-form-styling

## Purpose

Ensure native form controls (starting with `<select>` elements, via the shared `inputClass` used across forms like `UserForm.tsx` and `TaskForm.tsx`) and the base body font render consistently across Safari/WebKit, Chrome, and Firefox, instead of relying on each browser engine's UA defaults. This is a styling-only capability with no impact on form behavior, validation, or data types.

## Requirements

### Requirement: Select elements render consistently across browsers
The system SHALL render the `Rol` `<select>` in `UserForm.tsx` with the same border, padding, background color, and text styling as the surrounding `<input>` fields in Safari, Chrome, and Firefox, without relying on any browser's native dropdown chrome.

#### Scenario: Viewing the user form in Safari
- **WHEN** the "Nuevo usuario" form is opened in Safari
- **THEN** the `Rol` select's border, padding, background, and font match the `Nombre`/`Apellido`/`Email` text inputs, with no native WebKit dropdown styling visible

#### Scenario: Viewing the user form in Chrome or Firefox
- **WHEN** the "Nuevo usuario" form is opened in Chrome or Firefox
- **THEN** the `Rol` select renders the same way it already does today (no visual regression), matching the same border/padding/background/font as the text inputs

### Requirement: Select elements show a custom dropdown indicator
The system SHALL display a visible dropdown arrow indicator on the `Rol` select after its native browser arrow is removed, in both light and dark color schemes.

#### Scenario: Light mode
- **WHEN** the `Rol` select is rendered with `prefers-color-scheme: light` (or no dark mode active)
- **THEN** a dropdown arrow icon is visible on the right side of the select, styled to match the light-mode color palette

#### Scenario: Dark mode
- **WHEN** the `Rol` select is rendered with `prefers-color-scheme: dark`
- **THEN** a dropdown arrow icon is visible on the right side of the select, styled to match the dark-mode color palette (not the light-mode arrow color)

### Requirement: Base body font renders consistently across browsers
The system SHALL render page text using the configured Geist font family (already loaded via `next/font/google`) instead of falling back to each browser/OS's native Arial/Helvetica substitution.

#### Scenario: Page loads successfully
- **WHEN** any page in `apps/web` finishes loading in a browser that successfully loads the Geist webfont
- **THEN** body text is rendered in the Geist font, not in the browser's native Arial/Helvetica substitute

#### Scenario: Webfont fails to load
- **WHEN** the Geist webfont fails to load for any reason
- **THEN** body text falls back to Arial, Helvetica, or sans-serif, in that order, so the page remains readable

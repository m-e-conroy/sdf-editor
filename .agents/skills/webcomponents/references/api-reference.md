# Web Components API Reference

Detailed API surface for the three core Web Components technologies. Consult this when you need specifics beyond what's in SKILL.md.

## CustomElementRegistry

### `customElements.define(name, constructor, options?)`

| Parameter         | Type     | Description                                                                               |
| ----------------- | -------- | ----------------------------------------------------------------------------------------- |
| `name`            | `string` | Must contain a hyphen. Lowercase only. Cannot start with a digit.                         |
| `constructor`     | `class`  | Must extend `HTMLElement` (autonomous) or a specific built-in element class (customized). |
| `options.extends` | `string` | Name of built-in element to extend (e.g., `"button"`). Not supported in Safari.           |

### `customElements.get(name)`

Returns the constructor for a registered element, or `undefined`.

### `customElements.getName(constructor)`

Returns the tag name for a registered constructor, or `null`.

### `customElements.whenDefined(name)`

Returns a `Promise` that resolves when the element is defined. Useful for lazy loading:

```js
customElements.whenDefined("my-widget").then(() => {
  document.querySelector("my-widget").initialize();
});
```

### `customElements.upgrade(root)`

Forces upgrade of all matching elements in a subtree — useful after `innerHTML`.

---

## Element.attachShadow(init)

| Option                  | Type                            | Default   | Description                                                            |
| ----------------------- | ------------------------------- | --------- | ---------------------------------------------------------------------- |
| `mode`                  | `"open" \| "closed"`            | Required  | Open exposes `element.shadowRoot`; closed returns `null`.              |
| `delegatesFocus`        | `boolean`                       | `false`   | Auto-forwards focus to the first focusable element in the shadow tree. |
| `clonable`              | `boolean`                       | `false`   | Whether `cloneNode()` clones the shadow root.                          |
| `serializable`          | `boolean`                       | `false`   | Whether `getHTML()` / `innerHTML` serializes the shadow root.          |
| `slotAssignment`        | `"named" \| "manual"`           | `"named"` | Manual slot assignment via `slot.assign()`.                            |
| `customElementRegistry` | `CustomElementRegistry \| null` | Global    | Scoped registry for this shadow root.                                  |

### Elements That Can Host a Shadow Root

Most elements support shadow DOM. Notable exceptions:

**Cannot host shadow DOM:** `<img>`, `<input>`, `<textarea>`, `<select>`, `<a>`, `<br>`, `<hr>`, `<iframe>`, `<script>`, `<style>`, `<link>`

---

## ShadowRoot Properties & Methods

| Property/Method                    | Description                                  |
| ---------------------------------- | -------------------------------------------- |
| `shadowRoot.host`                  | The element the shadow root is attached to   |
| `shadowRoot.mode`                  | `"open"` or `"closed"`                       |
| `shadowRoot.innerHTML`             | Get/set the shadow tree's HTML               |
| `shadowRoot.adoptedStyleSheets`    | Array of `CSSStyleSheet` objects             |
| `shadowRoot.querySelector(sel)`    | Query within the shadow tree                 |
| `shadowRoot.querySelectorAll(sel)` | Query all within the shadow tree             |
| `shadowRoot.activeElement`         | Currently focused element in the shadow tree |
| `shadowRoot.getHTML(options?)`     | Serialize to HTML string                     |
| `shadowRoot.delegatesFocus`        | Whether focus is delegated                   |

---

## HTMLSlotElement

| Property/Method                   | Description                                                                            |
| --------------------------------- | -------------------------------------------------------------------------------------- |
| `slot.assignedNodes(options?)`    | Returns nodes assigned to this slot. Pass `{ flatten: true }` to get fallback content. |
| `slot.assignedElements(options?)` | Same as above but only returns elements (no text nodes).                               |
| `slot.assign(...nodes)`           | Manually assign nodes (when `slotAssignment: "manual"`).                               |
| `slotchange` event                | Fires when distributed nodes change.                                                   |

---

## ElementInternals

Accessed via `this.attachInternals()`. Only on autonomous custom elements.

### Key Properties

| Property                      | Description                                       |
| ----------------------------- | ------------------------------------------------- |
| `internals.states`            | `CustomStateSet` — add/remove/check custom states |
| `internals.form`              | The associated `<form>` element                   |
| `internals.shadowRoot`        | The element's shadow root (even if closed)        |
| `internals.validity`          | `ValidityState` object                            |
| `internals.validationMessage` | Current validation message                        |

### Key Methods

| Method                                  | Description                              |
| --------------------------------------- | ---------------------------------------- |
| `setFormValue(value, state?)`           | Set the element's form submission value  |
| `setValidity(flags, message?, anchor?)` | Set custom validity                      |
| `checkValidity()`                       | Check validity, may fire `invalid` event |
| `reportValidity()`                      | Check and show validation UI             |

### Custom States

```js
// Add a state
this._internals.states.add("loading");

// Check a state
this._internals.states.has("loading"); // true

// Remove a state
this._internals.states.delete("loading");

// Style from outside
// my-element:state(loading) { opacity: 0.5; }
```

---

## CSS Selectors Reference

### Inside Shadow DOM

| Selector                  | Description                       | Example                                      |
| ------------------------- | --------------------------------- | -------------------------------------------- |
| `:host`                   | The host element                  | `:host { display: block; }`                  |
| `:host(selector)`         | Host matching selector            | `:host(.active) { border: 2px solid blue; }` |
| `:host-context(selector)` | Host inside matching ancestor     | `:host-context(.dark) { color: white; }`     |
| `::slotted(selector)`     | Top-level slotted elements        | `::slotted(p) { margin: 0; }`                |
| `:defined`                | Any defined custom element        | `my-el:defined { opacity: 1; }`              |
| `:state(ident)`           | Custom state via `CustomStateSet` | `my-el:state(checked) { color: green; }`     |

### Outside Shadow DOM (Consumer)

| Selector       | Description                           | Example                                    |
| -------------- | ------------------------------------- | ------------------------------------------ |
| `::part(name)` | Shadow DOM element with `part="name"` | `my-el::part(header) { font-size: 2rem; }` |
| `:defined`     | Styled once element is registered     | `my-el:not(:defined) { display: none; }`   |

### Limitations

- `::slotted()` only targets **direct children** placed into the slot, not deeper descendants.
- `::part()` does not pierce nested shadow roots — only one level deep.
- `:host-context()` has limited browser support (not in Firefox as of early 2026).

---

## Declarative Shadow DOM

Server-rendered shadow DOM via `<template>`:

```html
<my-component>
  <template shadowrootmode="open">
    <style>
      :host {
        display: block;
      }
    </style>
    <p>Server-rendered content</p>
    <slot></slot>
  </template>
  <span>Light DOM content</span>
</my-component>
```

| Attribute                         | Description                                       |
| --------------------------------- | ------------------------------------------------- |
| `shadowrootmode="open\|closed"`   | Creates a shadow root from the template           |
| `shadowrootclonable`              | Shadow root is clonable                           |
| `shadowrootdelegatesfocus`        | Shadow root delegates focus                       |
| `shadowrootserializable`          | Shadow root can be serialized                     |
| `shadowrootcustomelementregistry` | Defers registry association for scoped registries |

The `<template>` element is consumed by the parser — it does not remain in the DOM.

---

## Scoped Custom Element Registries

Avoid global name collisions by creating isolated registries:

```js
const registry = new CustomElementRegistry();

registry.define(
  "my-button",
  class extends HTMLElement {
    connectedCallback() {
      this.textContent = "Scoped button!";
    }
  },
);

const shadow = host.attachShadow({
  mode: "open",
  customElementRegistry: registry,
});

shadow.innerHTML = "<my-button></my-button>";
```

> **Note:** Scoped registries are a newer feature. Check current browser support before relying on them.

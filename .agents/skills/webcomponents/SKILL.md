---
name: web-components
description: Build reusable, encapsulated UI components using native Web Components APIs — no framework required. Covers Custom Elements, Shadow DOM, HTML Templates, Slots, lifecycle callbacks, and styling with CSS encapsulation. Use this skill whenever the user mentions web components, custom elements, shadow DOM, HTML templates or slots, `customElements.define`, `attachShadow`, `connectedCallback`, or wants to create reusable HTML elements without React, Vue, Angular, or other frameworks. Also triggers on requests for framework-free component architecture, vanilla JS components, or encapsulated UI widgets.
---

# Web Components (No Framework)

Build reusable UI components via browser native APIs.

Three core technologies:

| Technology | Purpose |
| :--- | :--- |
| **Custom Elements** | Define HTML tags with custom behavior |
| **Shadow DOM** | Encapsulate markup and styles |
| **HTML Templates & Slots** | Reusable structure with slots for child elements |

> **Reference:** [MDN Web Components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components)

---

## Custom Elements

### Anatomy

Class extends `HTMLElement`. Name **must contain hyphen** (e.g., `my-widget`).

```js
class MyComponent extends HTMLElement {
  static observedAttributes = ["variant", "size"];

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
  }

  disconnectedCallback() {}

  adoptedCallback() {}

  attributeChangedCallback(name, oldValue, newValue) {
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .inner { padding: 1rem; }
      </style>
      <div class="inner">
        <slot></slot>
      </div>
    `;
  }
}

customElements.define("my-component", MyComponent);
```

### Registration

```js
// Autonomous custom element
customElements.define("my-component", MyComponent);

// Customized built-in element (Safari lacks support)
customElements.define("fancy-button", FancyButton, { extends: "button" });
```

Use autonomous for maximum compatibility.

### Lifecycle Callbacks

| Callback | When fires |
| :--- | :--- |
| `constructor()` | Created. Call `super()`. Do not read attributes or children here. |
| `connectedCallback()` | Added to DOM. Primary setup/listener attachment. |
| `disconnectedCallback()` | Removed from DOM. Cleanup listeners/timers. |
| `attributeChangedCallback(name, old, new)` | Observed attribute changed. Needs `static observedAttributes`. |
| `adoptedCallback()` | Moved to new document. |
| `connectedMoveCallback()` | Moved via `moveBefore()` without disconnect cycle. |

### Responding to Attributes

```js
class StatusBadge extends HTMLElement {
  static observedAttributes = ["status"];

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "status") {
      this.shadowRoot.querySelector(".badge").textContent = newValue;
      this.shadowRoot.querySelector(".badge").className = `badge ${newValue}`;
    }
  }
}
```

Reflect props to attributes:

```js
get status() {
  return this.getAttribute("status");
}

set status(val) {
  this.setAttribute("status", val);
}
```

---

## Shadow DOM

Encapsulation for styles and markup.

### Creating Shadow Root

```js
// Imperative
const shadow = this.attachShadow({ mode: "open" });

// Declarative (SSR)
// <my-component>
//   <template shadowrootmode="open">
//     <p>Shadow DOM</p>
//   </template>
// </my-component>
```

Use `mode: "open"`. Closed is not security barrier, breaks debugging.

### Encapsulation Rules

| What | Encapsulated? |
| :--- | :--- |
| CSS selectors | Yes — no leaks in or out |
| `document.querySelector()` | Yes — hides shadow nodes from page queries |
| `element.shadowRoot.querySelector()` | Reaches inside open roots |
| JS events | Bubble out. `event.composedPath()` truncated if closed |
| Inherited CSS (`color`, `font-family`) | No — inherits through boundary |

---

## HTML Templates & Slots

### Templates

Inert HTML cloned at runtime.

```js
const template = document.getElementById("card-template");
const clone = template.content.cloneNode(true);
this.shadowRoot.appendChild(clone);
```

### Slots

Inject content into shadow DOM.

```html
<!-- Component template -->
<template id="card-template">
  <style>
    .card { border: 1px solid #ddd; padding: 1rem; }
  </style>
  <div class="card">
    <h2><slot name="title">Default Title</slot></h2>
    <div class="body">
      <slot>Default body content</slot>
    </div>
    <footer>
      <slot name="actions"></slot>
    </footer>
  </div>
</template>
```

```html
<!-- Usage -->
<my-card>
  <span slot="title">Product Name</span>
  <p>Default slot.</p>
  <button slot="actions">Buy Now</button>
</my-card>
```

| Slot type | Behavior |
| :--- | :--- |
| Named (`<slot name="x">`) | Filled by children with `slot="x"` |
| Default (`<slot>`) | Catches children without `slot` attribute |
| Fallback content | Inside `<slot>`, shown if slot is empty |

### Slot Changes

```js
this.shadowRoot.querySelector("slot").addEventListener("slotchange", (e) => {
  const assigned = e.target.assignedNodes({ flatten: true });
  console.log("Slot content changed:", assigned);
});
```

---

## Styling

### CSS Selectors

| Selector | Where | What does |
| :--- | :--- | :--- |
| `:host` | Inside shadow DOM | Styles host element |
| `:host(.active)` | Inside shadow DOM | Styles host matching selector |
| `:host-context(.dark)` | Inside shadow DOM | Styles host if ancestor matches |
| `::slotted(span)` | Inside shadow DOM | Styles top-level slotted elements |
| `::part(label)` | Outside shadow DOM | Styles shadow elements with `part="label"` |

### :host and :host-context

```css
/* Inside shadow DOM */
:host {
  display: block;
  font-family: system-ui, sans-serif;
}

:host([size="large"]) {
  font-size: 1.5rem;
}

:host-context(.dark-theme) {
  background: #1a1a1a;
  color: #f0f0f0;
}
```

### CSS Parts

Expose elements for external styling:

```js
// Template
`<button part="trigger">Click</button>
 <div part="panel">Panel</div>`;
```

```css
/* External */
my-dropdown::part(trigger) {
  background: navy;
  color: white;
}
```

### Constructable Stylesheets

Efficient style sharing:

```js
const shared = new CSSStyleSheet();
shared.replaceSync(`
  :host { display: block; box-sizing: border-box; }
  *, *::before, *::after { box-sizing: inherit; }
`);

class MyComponent extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [shared, componentStyles];
  }
}
```

---

## Accessibility

Shadow DOM obscures semantics. Explicit setups required.

### ARIA

ID references (`aria-labelledby`, etc.) **cannot cross boundaries**.

```js
connectedCallback() {
  const shadow = this.attachShadow({ mode: "open" });

  // Strategy 1: Host ARIA
  this.setAttribute("role", "tablist");
  this.setAttribute("aria-label", "Nav tabs");

  // Strategy 2: ElementInternals
  // this._internals = this.attachInternals();
}
```

### Focus

`delegatesFocus` forwards focus to shadow tree.

```js
this.attachShadow({ mode: "open", delegatesFocus: true });
```

Keep interactive elements navigable:

```html
<button part="close" aria-label="Close">×</button>
```

### Form-Associated

Work with `<form>`, validation, and `FormData`:

```js
class MyInput extends HTMLElement {
  static formAssociated = true;

  constructor() {
    super();
    this._internals = this.attachInternals();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <label><slot></slot></label>
      <input type="text">
    `;
    const input = this.shadowRoot.querySelector("input");
    input.addEventListener("input", () => {
      this._internals.setFormValue(input.value);
    });
  }

  get validity() { return this._internals.validity; }
  get validationMessage() { return this._internals.validationMessage; }
  checkValidity() { return this._internals.checkValidity(); }
  reportValidity() { return this._internals.reportValidity(); }
}

customElements.define("my-input", MyInput);
```

### Checklist

- [ ] Apply `role` to host or internal elements.
- [ ] `aria-label`/`aria-labelledby` present for accessibility context.
- [ ] Interactive elements keyboard navigable.
- [ ] `delegatesFocus: true` set for focusable wrappers.
- [ ] `ElementInternals` used for form integration.
- [ ] Visible focus indicators maintained (do not suppress `:focus-visible`).

---

## Complete Example

`<alert-banner>` component:

```js
// alert-banner.js
const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host { display: block; font-family: system-ui, sans-serif; }
    .banner { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; border-radius: 6px; border: 1px solid; }
    :host([variant="info"]) .banner { background: #e8f4fd; border-color: #b3d9f2; color: #0c5a97; }
    :host([variant="warning"]) .banner { background: #fff8e1; border-color: #ffe082; color: #8d6e00; }
    :host([variant="error"]) .banner { background: #fdecea; border-color: #f5c6cb; color: #a71d2a; }
    .icon { flex-shrink: 0; }
    .content { flex: 1; }
    button { background: none; border: none; cursor: pointer; font-size: 1.25rem; line-height: 1; padding: 0.25rem; color: inherit; opacity: 0.7; }
    button:hover, button:focus-visible { opacity: 1; }
  </style>

  <div class="banner" role="alert">
    <span class="icon" aria-hidden="true">
      <slot name="icon">ℹ️</slot>
    </span>
    <div class="content">
      <slot></slot>
    </div>
    <button part="close" aria-label="Dismiss">×</button>
  </div>
`;

class AlertBanner extends HTMLElement {
  static observedAttributes = ["variant"];

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    if (!this.hasAttribute("variant")) {
      this.setAttribute("variant", "info");
    }
    this.shadowRoot.querySelector("button").addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("dismiss", { bubbles: true }));
      this.remove();
    });
  }

  attributeChangedCallback(name, oldValue, newValue) {}
}

customElements.define("alert-banner", AlertBanner);
```

```html
<!-- Usage -->
<alert-banner variant="warning">
  <span slot="icon">⚠️</span>
  Session expires in 5 min.
</alert-banner>
```

---

## Common Patterns

### Lazy Rendering

Defer rendering until visible in viewport:

```js
connectedCallback() {
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      this.render();
      observer.disconnect();
    }
  });
  observer.observe(this);
}
```

### Custom Events

Dispatch up DOM tree with `CustomEvent`:

```js
this.dispatchEvent(
  new CustomEvent("item-selected", {
    bubbles: true,
    composed: true, // crosses boundary
    detail: { id: this.dataset.id },
  }),
);
```

### Custom States

Internal states for CSS via `CustomStateSet`:

```js
class ToggleSwitch extends HTMLElement {
  constructor() {
    super();
    this._internals = this.attachInternals();
  }
  get checked() { return this._internals.states.has("checked"); }
  set checked(flag) {
    flag ? this._internals.states.add("checked") : this._internals.states.delete("checked");
  }
}
```

```css
/* External */
toggle-switch:state(checked) { --track-color: green; }
```

---

## Anti-Patterns

| Don't | Do Instead |
| :--- | :--- |
| Render `innerHTML` inside constructor | Render in `connectedCallback()` |
| Inspect attributes or children in constructor | Defer element checks to `connectedCallback()` |
| Implement custom `tabindex > 0` | Rely on natural DOM focus navigation order |
| Forget to call `super()` in constructor | Make `super()` the first call in constructor |
| Ignore observer/event cleanup | Perform removals in `disconnectedCallback()` |
| Use closed shadow DOM mode | Use `mode: "open"` for debugging and testing |
| Set ID references across DOM boundaries | Keep bindings within tree or use `ElementInternals` |

---

## Browser Support

Evergreen support:

| Feature | Chrome | Firefox | Safari | Edge |
| :--- | :--- | :--- | :--- | :--- |
| Custom Elements v1 | 54+ | 63+ | 10.1+ | 79+ |
| Shadow DOM v1 | 53+ | 63+ | 10+ | 79+ |
| HTML Templates | 26+ | 22+ | 8+ | 13+ |
| Slots | 53+ | 63+ | 10+ | 79+ |
| Constructable Stylesheets | 73+ | 101+ | 16.4+ | 79+ |
| Form-associated Custom | 77+ | 98+ | 16.4+ | 79+ |
| Declarative Shadow DOM | 111+ | 123+ | 16.4+ | 111+ |
| Customized built-in | 54+ | 63+ | **No** | 79+ |

## Related Skills

- **[frontend-design](../frontend-design/SKILL.md)** — Design tokens and architecture.
- **[css-expert](../css-expert/SKILL.md)** — Shadow DOM styling selectors.
- **[web-accessibility](../web-accessibility/SKILL.md)** — Semantics and focus management.

# Web Components Patterns & Examples

This document contains complete examples, advanced patterns, and accessibility guidelines for Web Components.

## Complete Example: Alert Banner

A fully encapsulated `<alert-banner>` component demonstrating Custom Elements, Shadow DOM, and Slots:

```javascript
const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: block;
      font-family: system-ui, sans-serif;
    }
    .banner {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-radius: 6px;
      border: 1px solid;
    }
    :host([variant="info"]) .banner {
      background: #e8f4fd;
      border-color: #b3d9f2;
      color: #0c5a97;
    }
    .icon { flex-shrink: 0; }
    .content { flex: 1; }
    button {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1.25rem;
      padding: 0.25rem;
      color: inherit;
      opacity: 0.7;
    }
    button:hover { opacity: 1; }
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

  attributeChangedCallback(name, oldValue, newValue) {
    // Variant styles are handled via :host([variant]) CSS selectors
  }
}

customElements.define("alert-banner", AlertBanner);
```

```html
<!-- Usage -->
<alert-banner variant="info">
  <span slot="icon">ℹ️</span>
  Update installed successfully.
</alert-banner>
```

## Accessibility

Web components require explicit accessibility work because shadow DOM can obscure semantic information from assistive technology.

### ARIA and Shadow DOM
ARIA attribute references (`aria-labelledby`, `aria-describedby`, `aria-controls`) **do not cross shadow boundaries** by default. Use these strategies:

```javascript
connectedCallback() {
  const shadow = this.attachShadow({ mode: "open" });

  // Strategy 1: Set ARIA on the host element (in light DOM)
  this.setAttribute("role", "tablist");
  this.setAttribute("aria-label", "Navigation tabs");

  // Strategy 2: Use ElementInternals for form-associated components
}
```

### Focus Management
Use `delegatesFocus` to automatically forward focus into the shadow tree:

```javascript
this.attachShadow({ mode: "open", delegatesFocus: true });
```

### Form-Associated Custom Elements
Make custom elements work with `<form>`, validation, and `FormData`:

```javascript
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

  // Participate in form validation
  get validity() { return this._internals.validity; }
  get validationMessage() { return this._internals.validationMessage; }
  checkValidity() { return this._internals.checkValidity(); }
  reportValidity() { return this._internals.reportValidity(); }
}

customElements.define("my-input", MyInput);
```

## Common Patterns

### Lazy Rendering
Defer heavy rendering until the element is visible:

```javascript
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
Communicate up the DOM tree with `CustomEvent`:

```javascript
this.dispatchEvent(new CustomEvent("item-selected", {
  bubbles: true,
  composed: true,  // crosses shadow boundary
  detail: { id: this.dataset.id }
}));
```

### Browser Support

All evergreen browsers support the full Web Components API:

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Custom Elements v1 | 54+ | 63+ | 10.1+ | 79+ |
| Shadow DOM v1 | 53+ | 63+ | 10+ | 79+ |
| HTML Templates | 26+ | 22+ | 8+ | 13+ |
| Slots | 53+ | 63+ | 10+ | 79+ |
| Constructable Stylesheets | 73+ | 101+ | 16.4+ | 79+ |
| Form-associated custom elements | 77+ | 98+ | 16.4+ | 79+ |
| Declarative Shadow DOM | 111+ | 123+ | 16.4+ | 111+ |
| Customized built-in elements | 54+ | 63+ | **No** | 79+ |

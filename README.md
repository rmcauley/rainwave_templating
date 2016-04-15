# RW Javascript Templating System

Takes in Handlebars-like templates and outputs native Javascript DOM calls.
Optionally saves generated elements.

## Synopsis

`templates/example.hbar`:

```html
<div class="some_div" bind="bound_div">{{ hello_world }}</div>
```

`js/hello.js`

```javascript
var obj = { "hello_world": "DOM ahoy!" }
JSTemplates.example(obj);
console.log(obj.$t._root);                 // a documentFragment
console.log(obj.$t.bound_div.textContent); // "DOM ahoy!"
document.body.appendChild(obj.$t._root);
```

The resulting HTML:

```html
<div class="some_div">DOM ahoy!</div>
```

## Template Format

Templates look much like Handlebars, except handlers are dealt with differently:

- Handlebars: `<div>{{ format_time time }}</div>`
-  RWTemplate: `<div helper="format_time">{{ time }}</div>`

Restrictions:
   - `{{#each}}` cannot handle objects - only arrays.
   - `{{#if}}` cannot be used inside < >
       - BAD : `<a {{#if href}}href="hello"{{/if}}>`
       - GOOD: `{{#if href}}<a href="hello"></a>{{/if}}`
   - `{{#if}}` must contain whole elements
       - BAD : `{{#if href}} <a href="href"> {{else}} <a> {{/if}} something </a>`
       - GOOD: `{{#if href}}<a href="hello"></a>{{else}}<a></a>{{/if}}`

Some handy things to know:
	
  - `{{ @root.blah }}`
    - access root context object
  - `{{ ^document.lang }}`
    - use raw JS in the template excluding ^
  - `{{#if ^c.flag == FLAG_CONSTANT }}`
    - access the current object the template system is looking at with _c

## Helpers

You can add your own helpers by 

## Convenience Extras

You can add your own convenience functions that will automatically
turn into straight Javascript by adding/remove from `raw_js_functions` in `RWTemplates.py`.
This will allow you to call, e.g., {{ gettext("Hello") }} in template files without needing
to do {{ ^gettext("Hello") }}.

## Form Handling

Works, but needs documentation.

## Gotchas

- Cannot deal with SVG

# RW Javascript Templating System

Takes in Handlebars-like templates and outputs native Javascript DOM calls.
Optionally saves generated elements.  No "runtime" Javascript files are
required.

## Synopsis

Create a template to be compiled, `jstemplates/example.html`:

```html
<div class="some_div" bind="bound_div">{{ hello_world }}</div>
```

Put a snippet of Javascript on your page:

```javascript
var obj = { "hello_world": "DOM ahoy!" }
JSTemplates.example(obj);
console.log(obj.$t._root);                 // a documentFragment
console.log(obj.$t.bound_div.textContent); // "DOM ahoy!"
document.body.appendChild(obj.$t._root);
```

Compile the template with Python:

```
./RWTemplates.py
```

When the Javascript is invoked, you'll get:

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
  - `{{#if ^_c.flag == FLAG_CONSTANT }}`
    - access the current object the template system is looking at with _c

## Convenience Extras

You can add your own convenience functions that will automatically
turn into straight Javascript by adding/remove from `raw_js_functions` in `RWTemplates.py`.
This will allow you to call, e.g., {{ gettext("Hello") }} in template files without needing
to do {{ ^gettext("Hello") }}.

## Form Handling and Helpers

Works, but needs documentation.  This requires extra libraries to be present on the page,
included before your main template file.

## Gotchas

- Cannot deal with SVG
- Does not do partial page loading - all templates must be loaded at once.
- For IE8 compatibility you need to use the `--full` flag when compiling.

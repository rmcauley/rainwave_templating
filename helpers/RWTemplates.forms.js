/* eslint no-param-reassign: 0, camelcase: 0, one-var: 0, no-console: 0, eqeqeq: 0, max-depth: 0 */

/**
 * Sets up and defines RWTemplateHelpers to handle forms.
 * @return { undefined }
 */
function RWTemplateFormsInit() {
	"use strict";

	var btnSuccess = "btn-success";
	var btnError = "btn-danger";
	var btnNormal = "btn-primary";
	var errorClass = "has-error";

	var bootstrap = true;

	var RWTemplateHelpers = window.RWTemplateHelpers;
	var RWTemplateObject = window.RWTemplateObject;

	var autosave_timeouts = {};

	/**
	 * Helper to change opacity to 1.0 if value is truthy, 0.6 if value is falsey.
	 * @param   { string|integer } val  - Truthy/falsey value.
	 * @param   { Element        } elem - Element to change opacity of.
	 * @returns { undefined }
	 */
	RWTemplateHelpers.opacity = function(val, elem) {
		if (val) elem.style.opacity = "1.0";
		else elem.style.opacity = "0.6";
	};
	RWTemplateHelpers.opacity_get = false;

	/**
	 * Sets className of element to bound value.
	 * @param   { string|integer } val
	 * @param   { Element        } elem
	 * @returns { undefined }
	 */
	RWTemplateHelpers.className = function(val, elem) {
		elem.className = val;
	};

	/**
	 * Removes any form-related error classes from an element and/or its parent.
	 * Sister function to add_error_class.
	 * @param   { Element        } elem
	 * @returns { undefined }
	 */
	RWTemplateHelpers.remove_error_class = function(element) {
		var elem = element.classList ? element : this;
		if (!elem.classList) return;
		if (elem.classList.contains(errorClass)) {
			elem.classList.remove(btnError);
		}
		if (bootstrap && !elem.classList.contains("form-group")) {
			while (elem.parentNode && elem.parentNode.classList) {
				if (elem.parentNode.classList.contains("form-group")) {
					elem.parentNode.classList.remove(errorClass);
					break;
				}
				elem = elem.parentNode;
			}
		}
	};

	/**
	 * remove_error_class function name for minified templates.
	 * @param   { Element        } elem
	 * @returns { undefined }
	 */
	RWTemplateHelpers._rec = function(elem) {
		elem.addEventListener("focus", RWTemplateHelpers.remove_error_class);
	};

	/**
	 * Adds an error class to an element, or its parent form-group if using bootstrap.
	 * @param   { Element        } elem
	 * @returns { undefined }
	 */
	RWTemplateHelpers.add_error_class = function(element) {
		var elem = element && element.classList ? element : this;
		if (!elem.classList) return;
		if (elem.classList.contains(errorClass)) {
			elem.classList.remove(errorClass);
		}
		if (bootstrap && !elem.classList.contains("form-group")) {
			while (elem.parentNode && elem.parentNode.classList) {
				if (elem.parentNode.classList.contains("form-group")) {
					elem.parentNode.classList.add(errorClass);
					break;
				}
				elem = elem.parentNode;
			}
		}
	};

	/**
	 * Changes a Bootstrap button's class.
	 * @param   { Element   } btn
	 * @param   { string    } newClass
	 * @returns { undefined }
	 */
	RWTemplateHelpers.change_button_class = function(btn, newClass) {
		btn.classList.remove(btnSuccess);
		btn.classList.remove(btnError);
		btn.classList.remove(btnNormal);
		if (newClass !== btn._normal_class) {
			btn.classList.remove(btn._normal_class);
		}
		btn.classList.add(newClass);
	};

	/**
	 * Change a button's text, or revert the button back to its original innerHTML.
	 * @param   { Element   } btn
	 * @param   { string    } [text]  - Omit to revert button.
	 * @returns { undefined }
	 */
	RWTemplateHelpers.change_button_text = function(btn, text) {
		if (btn._no_changes_please) return;
		if (!btn._changed) {
			btn._changed = true;
			// btn.style.minWidth = btn.offsetWidth + "px";
			btn._original_html = btn.innerHTML;
		}
		if (!text && btn._original_html) {
			btn.innerHTML = btn._original_html;
		}
		else if (text) {
			btn.textContent = text;
		}
	};

	/**
	 * Stop event propagation for all browsers, including IE8,
	 * @param   { Event     } e
	 * @returns { undefined }
	 */
	RWTemplateHelpers.stop_ie8_propagation = function(e) {
		e = e || window.event;
		e.cancelBubble = true;
		e.returnValue = false;
		if (e.stopPropagation) e.stopPropagation();
		if (e.preventDefault) e.preventDefault();
		return e;
	};

	/**
	 * Stop a button from working.
	 * @param   { Event     } e
	 * @returns { undefined }
	 */
	var stop_button = function(e) {
		// e.stopPropagation();
		e.preventDefault();
	};

	/**
	 * Sets up form event trapping.
	 * @param   { object    } _c   - template context
	 * @param   { Element   } form - <form> HTML element
	 * @returns { undefined }
	 */
	RWTemplateHelpers.on_form_render = function(_c, form) {
		if (!_c.$t) return;

		var track_last_button = function(e) {
			_c.$t._last_button = this;
		};

		form.onsubmit = function(e) {
			if (autosave_timeouts[_c.$t]) {
				clearTimeout(autosave_timeouts[_c.$t]);
				autosave_timeouts[_c.$t] = null;
			}
			e = RWTemplateHelpers.stop_ie8_propagation(e);
			if (_c.$t && _c.$t.on_submit) {
				_c.$t.on_submit();
			}
			return false;
		};
		var nodes = form.querySelectorAll("button");
		for (var i = 0; i < nodes.length; i++) {
			if (!nodes[i].getAttribute("type") || (nodes[i].getAttribute("type") != "submit")) {
				nodes[i].addEventListener("click", stop_button);
			}
			else if (nodes[i].getAttribute("type") == "submit") {
				nodes[i].addEventListener("click", track_last_button);
			}
		}
	};
	// renamed function for minified template usage
	RWTemplateHelpers._ofr = RWTemplateHelpers.on_form_render;

	/**
	 * Gets new values from form for a context, and any contexts that exist within it.
	 * @param   { Boolean   } update_in_place - Updates the context with new data
	 * @param   { Boolean   } only_diff       - Get only what's changed
	 * @param   { Boolean   } shallow         - Do not go into any other contexts.
	 * @returns { undefined }
	 */
	RWTemplateObject.prototype.get = function(update_in_place, only_diff, shallow) {
		var new_obj = {};
		var i, arr_i, ii;
		for (i in this._c) {
			if (!this._c.hasOwnProperty(i)) continue;
			if (i.charAt(0) === "$") continue;

			if ((Object.prototype.toString.call(this._c[i]) == "[object Array]") && !shallow) {
				var new_arr = [];
				for (arr_i = 0; arr_i < this._c[i].length; arr_i++) {
					if (this._c[i][arr_i] && this._c[i][arr_i].$t && this._c[i][arr_i].$t.get) {
						new_arr.push(this._c[i][arr_i].$t.get(update_in_place, only_diff));
					}
				}
				if (new_arr.length) {
					new_obj[i] = new_arr;
				}
			}
			else if ((this._c[i] !== null) && (this._c[i] !== undefined) && this._c[i].$t && this._c[i].$t.get && !shallow) {
				var new_sub_obj = this._c[i].$t.get(update_in_place, only_diff);
				for (ii in new_sub_obj) {
					if (new_sub_obj.hasOwnProperty(ii)) {
						new_obj[i] = new_sub_obj;
						break;
					}
				}
			}
			else if (this[i]) {
				var elem, tagname, new_val;
				for (var eli = 0; eli < this[i].length; eli++) {
					new_val = undefined;
					elem = this[i][eli];
					if (typeof(elem) === "function") continue;
					tagname = elem.nodeType && elem.tagName ? elem.tagName.toLowerCase() : null;
					if (tagname === "select") {
						new_val = elem.value;
					}
					else if ((tagname === "input") && (elem.getAttribute("type") === "radio")) {
						if (elem.checked) {
							new_val = elem.value;
						}
					}
					else if ((tagname === "input") && (elem.getAttribute("type") === "checkbox")) {
						if (elem.checked) {
							if (elem.getAttribute("value")) {
								new_val = elem.getAttribute("value");
							}
							else {
								new_val = true;
							}
						}
						else {
							new_val = false;
						}
					}
					else if ((elem.getAttribute("type") !== "submit") && (typeof(elem.value) !== "undefined") && (tagname !== "li")) {
						new_val = elem.value;
					}

					if ((typeof(new_val) !== "undefined") && elem.getAttribute("helper")) {
						if (typeof(RWTemplateHelpers[elem.getAttribute("helper") + "_get"]) === "function") {
							new_val = RWTemplateHelpers[elem.getAttribute("helper") + "_get"](this._c, new_val);
						}
						else if (typeof(RWTemplateHelpers[elem.getAttribute("helper") + "_get"]) === "undefined") {
							console.warn("Helper " + elem.getAttribute("helper") + " has a setter but no getter (value " + new_val + ").  Define RWTemplateHelpers." + elem.getAttribute("helper") + "_get.");
						}
					}

					if (typeof(new_val) !== "undefined") {
						if (elem.hasAttribute("int") && !isNaN(new_val) && !isNaN(parseInt(new_val))) {
							new_val = parseInt(new_val);
						}
						else if (elem.hasAttribute("float") && !isNaN(new_val) && !isNaN(parseFloat(new_val))) {
							new_val = parseFloat(new_val);
						}
						if ((!only_diff && (typeof(new_obj[i]) === "undefined")) || (new_val !== this._c[i]) || (new_val && elem.hasAttribute("save-on-true"))) {
							new_obj[i] = new_val;
						}
					}
				}
			}
		}

		return new_obj;
	};

	/**
	 * Reverts form to values present in the context. (an "undo", if the context hasn't been altered by user input)
	 * @returns { undefined }
	 */
	RWTemplateObject.prototype.reset = function() {
		this.normal();
		// Since our original context hasn't changed (or rather, it *shouldn't* have changed
		// unless someone messed around with it outside this library) we can just call update()
		// which will override whatever input the user put in.
		RWTemplateObject.prototype.update();
	};

	var allowed_tags = [ "select", "button", "textarea", "input" ];

	/**
	 * Gets all form input elements that have bind attributes that correspond to existing
	 * variables in the template context.
	 * @returns { Element[] }
	 */
	RWTemplateObject.prototype.get_form_elements = function() {
		var elements = [];
		var i, j;
		for (i in this) {
			if (!this.hasOwnProperty(i)) continue;
			if (i.charAt(0) === "$") continue;
			if (i === "_c") continue;
			if (this[i] && this[i]._no_save_propagation) continue;

			if (Object.prototype.toString.call(this[i]) === "[object Array]") {
				for (j = 0; j < this[i].length; j++) {
					if (typeof(this[i][j]) === "object") {
						if (allowed_tags.indexOf(this[i][j].tagName.toLowerCase()) !== -1) {
							elements.push(this[i][j]);
						}
					}
				}
			}
		}
		for (i in this._c) {
			if (!this._c.hasOwnProperty(i)) continue;
			if (i.charAt(0) == "$") continue;
			if (!this._c[i]) continue;
			if (this._c[i]._no_save_propagation) continue;

			if ((typeof(this._c[i].$t) != "undefined") && this._c[i].$t._c && (this._c[i].$t._c != this._c)) {
				elements = elements.concat(this._c[i].$t.get_form_elements());
			}
			else if (Object.prototype.toString.call(this._c[i]) == "[object Array]") {
				for (j = 0; j < this._c[i].length; j++) {
					if (typeof(this._c[i][j].$t) != "undefined") {
						elements = elements.concat(this._c[i][j].$t.get_form_elements());
					}
				}
			}
		}
		return elements;
	};

	/**
	 * Resets all form inputs to have no value.
	 * @returns { undefined }
	 */
	RWTemplateObject.prototype.clear = function() {
		var elements = this.normal();
		for (var i = 0; i < elements.length; i++) {
			elements[i].value = null;
		}
	};

	/**
	 * Disables a form and sets the form's submit button to say "submitting."
	 * @param   { string    } [submit_message] - Message to put in submit button, defaults to "Saving..."
	 * @param   { Boolean   } [no_disable]     - If true, will not disable form.
	 * @returns { undefined }
	 */
	RWTemplateObject.prototype.submitting = function(submit_message, no_disable) {
		if (typeof(submit_message) != "string") {
			submit_message = typeof(gettext) == "function" ? gettext("Saving...") : "Saving...";
		}
		var elements = this.normal();
		for (var i = 0; i < elements.length; i++) {
			if (((elements[i].getAttribute("type") == "submit") && !this._last_button) || (elements[i] == this._last_button)) {
				if (submit_message) {
					RWTemplateHelpers.change_button_text(elements[i], submit_message || (typeof(gettext) == "function" ? gettext("Saving...") : "Saving..."));
				}
				if (!no_disable) {
					RWTemplateHelpers.change_button_class(elements[i], elements[i]._normal_class || btnNormal);
				}
			}
			if (!no_disable) {
				elements[i].disabled = true;
				elements[i].classList.add("disabled");
			}
		}
	};

	var tracking_errors = {};

	/**
	 * Displays error state on the form, designed to work with Django REST.
	 * @param   { object         } rest_error      - JSON from Django REST API call
	 * @param   { XMLHttpRequest } xhr_object      - XMLHttpRequest used for server submission
	 * @param   { string         } [error_message] - Text to put into error box, default changes according to XMLHttpRequest status or "Try Again."
	 * @returns { undefined }
	 */
	RWTemplateObject.prototype.error = function(rest_error, xhr_object, error_message) {
		if (xhr_object) {
			if (xhr_object.status === 403) {
				error_message = typeof(gettext) == "function" ? gettext("Invalid Permissions") : "Invalid Permissions";
			}
			else if ((xhr_object.status % 300) < 100) {
				error_message = typeof(gettext) == "function" ? gettext("Server Error (300)") : "Server Error (300)";
			}
			else if ((xhr_object.status % 500) < 100) {
				error_message = typeof(gettext) == "function" ? gettext("Server Error (500)") : "Server Error (500)";
			}
		}
		if (rest_error && rest_error.detail) {
			error_message = error_message || rest_error.detail;
		}
		error_message = error_message || (typeof(gettext) == "function" ? gettext("Try Again") : "Try Again");

		var elements = this.normal();
		var submit_btns = [];
		var i;
		for (i = 0; i < elements.length; i++) {
			if (this._c.hasOwnProperty(i)) RWTemplateHelpers.remove_error_class(elements[i]);
			if (elements[i].getAttribute("disabled") != "always") {
				elements[i].disabled = false;
				elements[i].classList.remove("disabled");
			}
			if (((elements[i].getAttribute("type") == "submit") && !this._last_button) || (elements[i] == this._last_button)) {
				submit_btns.push(elements[i]);
			}
		}

		if (submit_btns.length) {
			for (i = 0; i < submit_btns.length; i++) {
				RWTemplateHelpers.change_button_text(submit_btns[i], error_message);
				RWTemplateHelpers.change_button_class(submit_btns[i], btnError);
			}

			tracking_errors[submit_btns[0]] = function() {
				for (i = 0; i < submit_btns.length; i++) {
					RWTemplateHelpers.change_button_text(submit_btns[i]);
					RWTemplateHelpers.change_button_class(submit_btns[i], btnNormal);
				}

				for (i = 0; i < elements.length; i++) {
					elements[i].removeEventListener("focus", tracking_errors[submit_btns[0]]);
				}
				tracking_errors[submit_btns[0]] = null;
			};

			for (i = 0; i < elements.length; i++) {
				elements[i].addEventListener("focus", tracking_errors[submit_btns[0]]);
			}
		}

		if (rest_error) {
			var eli;
			for (i in rest_error) {
				if (this._c[i] && this._c[i].$t && (Object.prototype.toString.call(this._c[i]) == "[object Array]") && (Object.prototype.toString.call(rest_error[i]) == "[object Array]")) {
					if (!this._c[i]._no_save_propagation) {
						for (eli = 0; eli < rest_error[i].length && eli < this._c[i].length; eli++) {
							this._c[i][eli].$t.error(rest_error[i][eli], xhr_object, error_message);
						}
					}
				}
				else if ((typeof(this._c[i]) == "object") && this._c[i] && this._c[i].$t && !this._c[i]._no_save_propagation) {
					this._c[i].$t.error(rest_error[i], xhr_object, error_message);
				}
				else if (this.hasOwnProperty(i)) {
					for (eli = 0; eli < this[i].length; eli++) {
						RWTemplateHelpers.add_error_class(this[i][eli]);
					}
				}
			}
		}
	};

	/**
	 * Normalizes form: re-enables all inputs and resets buttons to default state and text.
	 * @param   { string    } [submit_button_text] - Defaults to previous submit button contents.
	 * @returns { undefined }
	 */
	RWTemplateObject.prototype.normal = function(submit_button_text) {
		var elements = this.get_form_elements();
		for (var i = 0; i < elements.length; i++) {
			RWTemplateHelpers.remove_error_class(elements[i]);
			elements[i].disabled = false;
			elements[i].classList.remove("disabled");
			if (elements[i].getAttribute("type") == "submit") {
				if ((typeof(this._success_message) !== "string") || this._success_message) {
					RWTemplateHelpers.change_button_text(elements[i], submit_button_text);
				}
				RWTemplateHelpers.change_button_class(elements[i], elements[i]._normal_class || btnNormal);
			}
		}
		return elements;
	};

	/**
	 * Changes submit buttons to display a success state.
	 * @param   { string    } [success_message] - Defaults to "Saved"
	 * @param   { Boolean   } [permanent]       - Makes button permanently display success_message
	 * @returns { undefined }
	 */
	RWTemplateObject.prototype.success_display = function(success_message, permanent) {
		if (typeof(this._success_message == "string") && !this._success_message) {
			success_message = null;
		}
		else {
			success_message = success_message || this._success_message || this._c._success_message || (typeof(gettext) == "function" ? gettext("Saved") : "Saved");
		}
		var elements = this.normal();
		var this_obj, normalize;
		if (!permanent) {
			this_obj = this;
			normalize = function() {
				this_obj._success_timeout = null;
				this_obj.normal();
			};
		}
		for (var i = 0; i < elements.length; i++) {
			elements[i].disabled = permanent;
			elements[i].classList[permanent ? "add" : "remove"]("disabled");
			if (((elements[i].getAttribute("type") == "submit") && !this._last_button) || (elements[i] == this._last_button)) {
				if (success_message) {
					RWTemplateHelpers.change_button_text(elements[i], success_message);
				}
				RWTemplateHelpers.change_button_class(elements[i], btnSuccess);
				if (!permanent) {
					if (this._success_timeout) {
						clearTimeout(this._success_timeout);
						this._success_timeout = null;
					}
					this._success_timeout = setTimeout(normalize, 2000);
				}
			}
		}
	};

	/**
	 * Convenience function to updates context data, updates HTML, and calls success_display().
	 * @param   { object         } json         - Data to update context with
	 * @param   { XMLHttpRequest } [xhr_object] - unused
	 * @returns { undefined }
	 */
	RWTemplateObject.prototype.success = function(json, xhr_object) {
		this.update_data(json);
		this.update();
		this.success_display();
	};

	var setup_timeout = function(element, template_obj) {
		element.addEventListener("input", function() {
			if (autosave_timeouts[template_obj]) {
				clearTimeout(autosave_timeouts[template_obj]);
			}
			autosave_timeouts[template_obj] = setTimeout((template_obj.on_autosave || template_obj.on_submit), 2000);
		});
	};

	var setup_autosave = function(element, template_obj) {
		element.addEventListener("change", function() {
			if (autosave_timeouts[template_obj]) {
				clearTimeout(autosave_timeouts[template_obj]);
				autosave_timeouts[template_obj] = null;
			}
			var was_changed = template_obj.get(false, true);
			var has_changed;
			for (var i in was_changed) {
				if (was_changed.hasOwnProperty(i)) {
					has_changed = true;
					break;
				}
			}
			if (has_changed) {
				(template_obj.on_autosave || template_obj.on_submit)();
			}
		});
	};

	/**
	 * Enables auto-save functionality on all elements in a form.
	 * @returns { undefined }
	 */
	RWTemplateObject.prototype.enable_auto_save = function() {
		if (!this.on_submit && !this.on_autosave) {
			throw("$t.on_submit or $t.on_autosave must be defined before calling enable_auto_save.");
		}
		var elements = this.get_form_elements();
		for (var i = 0; i < elements.length; i++) {
			if (!elements[i]._autosaving) {
				if ((elements[i].tagName == "TEXTAREA") || ((elements[i].tagName == "INPUT") && (elements[i].getAttribute("type") == "text"))) {
					setup_timeout(elements[i], this);
				}
				setup_autosave(elements[i], this);
				elements[i]._autosaving = true;
			}
		}
	};

	/**
	 * Sets up "tabs" to pair elements with a bind attribute of "x_tab" and a bind attribute
	 * of "x_area" to create a tabbed interface.
	 * @param   { object    } obj           - Template context
	 * @param   { string    } [default_tab] - Default tab to open (e.g. if "hello", opens "hello_tab"+"hello_area" bound element+area)
	 * @returns { undefined }
	 */
	RWTemplateHelpers.tabify = function(obj, default_tab) {
		if (!obj.$t) return;
		var areas = [];
		var tabs = [];
		var hide_areas = function() {
			for (var i = 0; i < areas.length; i++) {
				areas[i].classList.add("tab_invisible");
			}
			for (i = 0; i < tabs.length; i++) {
				tabs[i].parentNode.classList.remove("active");
			}
		};
		var tab_open = function() {
			hide_areas();
			this.parentNode.classList.add("active");
			if (obj.$t[this._tab_name + "_area"] && obj.$t[this._tab_name + "_area"][0]) {
				obj.$t[this._tab_name + "_area"][0].classList.remove("tab_invisible");
			}
			else {
				throw("Can't find corresponding area for " + this._tab_name + ".  Make sure you have a " + this._tab_name + "_area bound.");
			}
		};
		for (var i in obj.$t) {
			if ((i.indexOf("_area") !== -1) && (i.indexOf("_area") == (i.length - 5))) {
				areas.push(obj.$t[i][0]);
				obj.$t[i][0].classList.add("tab_area");
				obj.$t[i][0].classList.add("tab_invisible");
			}
			else if ((i.indexOf("_tab") !== -1) && (i.indexOf("_tab") == (i.length - 4))) {
				tabs.push(obj.$t[i][0]);
				obj.$t[i][0]._tab_name = i.substr(0, i.indexOf("_tab"));
				obj.$t[i][0]._open = tab_open;
				obj.$t[i][0].addEventListener("click", obj.$t[i][0]._open);
			}
		}
		hide_areas();
		if (default_tab) {
			obj.$t[default_tab + "_area"][0].classList.remove("tab_invisible");
			obj.$t[default_tab + "_tab"][0].parentNode.classList.add("active");
		}
	};
}

import { Vector3 } from './math.js';

class InputBinding {
    /**
     * Responsible for converting newValue to the appropriate type.
     *
     * @callback InputValueCallback
     * @param {string} newValue
     * @returns {*}
     */

    /**
     * Called when `value` changes.
     *
     * @callback ChangeCallback
     * @param {*} value
     * @returns {void}
     */

    /**
     * @param {HTMLInputElement} input
     * @param {*} initialValue
     * @param {InputValueCallback} inputValueCallback
     * @param {(ChangeCallback|null)} changeCallback
     */
    constructor(input, initialValue = 0, inputValueCallback = Number, changeCallback = null) {
        this.input = input;
        this._value = initialValue;
        this.input.value = initialValue;
        this.inputValueCallback = inputValueCallback;
        this.changeCallback = changeCallback;
        this.input.addEventListener('change', this._handleChange.bind(this));
    }

    get value() {
        return this._value;
    }

    set value(newValue) {
        this._value = newValue;
        this.input.value = newValue;
        if (this.changeCallback) this.changeCallback(newValue);
    }

    /**
     * @param {Event} e
     */
    _handleChange(e) {
        const newValue = this.inputValueCallback(e.target.value);
        this.input.value = newValue;
        this._value = newValue;
        if (this.changeCallback) this.changeCallback(newValue);
    }
}

/**
 * @param {HTMLInputElement} query
 * @param {*} initialValue
 * @param {InputValueCallback} inputValueCallback
 * @returns {InputBinding}
 */
const bindInput = (query, initialValue, inputValueCallback = Number) => {
    const element = document.querySelector(query);
    const binding = new InputBinding(element, initialValue, inputValueCallback);
    return binding;
};

/**
 * @param {HTMLInputElement} xQuery
 * @param {HTMLInputElement} yQuery
 * @param {HTMLInputElement} zQuery
 * @param {Vector3} initialValue
 * @param {InputValueCallback} inputValueCallback
 */
const bindInputVector3 = (xQuery, yQuery, zQuery, initialValue) => {
    const bindings = {
        x: bindInput(xQuery, initialValue.x),
        y: bindInput(yQuery, initialValue.y),
        z: bindInput(zQuery, initialValue.z)
    };

    const wrapper = {
        _value: new Vector3(bindings.x.value, bindings.y.value, bindings.z.value),
        get value() {
            return this._value;
        },
        set value(newValue) {
            bindings.x.value = newValue.x;
            bindings.y.value = newValue.y;
            bindings.z.value = newValue.z;
            this._value.x = newValue.x;
            this._value.y = newValue.y;
            this._value.z = newValue.z;
        },
        get x() {
            return bindings.x.value;
        },
        set x(newValue) {
            bindings.x.value = newValue;
            this._value.x = newValue;
        },
        get y() {
            return bindings.y.value;
        },
        set y(newValue) {
            bindings.y.value = newValue;
            this._value.y = newValue;
        },
        get z() {
            return bindings.z.value;
        },
        set z(newValue) {
            bindings.z.value = newValue;
            this._value.z = newValue;
        }
    };

    bindings.x.changeCallback = (value) => (wrapper._value.x = value);
    bindings.y.changeCallback = (value) => (wrapper._value.y = value);
    bindings.z.changeCallback = (value) => (wrapper._value.z = value);

    return wrapper;
};

export { InputBinding, bindInput, bindInputVector3 };

;(function(global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? factory(exports)
    : typeof define === 'function' && define.amd
    ? define(['exports'], factory)
    : factory((global['final-form-calculate'] = {}))
})(this, function(exports) {
  'use strict'

  //
  var toPath = function toPath(key) {
    if (key === null || key === undefined || !key.length) {
      return []
    }

    if (typeof key !== 'string') {
      throw new Error('toPath() expects a string')
    }

    return key.split(/[.[\]]+/).filter(Boolean)
  }

  //

  var getIn = function getIn(state, complexKey) {
    // Intentionally using iteration rather than recursion
    var path = toPath(complexKey)
    var current = state

    for (var i = 0; i < path.length; i++) {
      var key = path[i]

      if (
        current === undefined ||
        current === null ||
        typeof current !== 'object' ||
        (Array.isArray(current) && isNaN(key))
      ) {
        return undefined
      }

      current = current[key]
    }

    return current
  }

  var _typeof =
    typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol'
      ? function(obj) {
          return typeof obj
        }
      : function(obj) {
          return obj &&
            typeof Symbol === 'function' &&
            obj.constructor === Symbol &&
            obj !== Symbol.prototype
            ? 'symbol'
            : typeof obj
        }

  var isPromise$1 = function(obj) {
    return (
      !!obj &&
      ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' ||
        typeof obj === 'function') &&
      typeof obj.then === 'function'
    )
  }

  //

  var tripleEquals$1 = function tripleEquals(a, b) {
    return a === b
  }
  var createDecorator = function createDecorator() {
    for (
      var _len = arguments.length, calculations = Array(_len), _key = 0;
      _key < _len;
      _key++
    ) {
      calculations[_key] = arguments[_key]
    }

    return function(form) {
      var previousValues = {}
      var unsubscribe = form.subscribe(
        function(_ref) {
          var values = _ref.values

          form.batch(function() {
            var runUpdates = function runUpdates(field, isEqual, updates) {
              var next = values && getIn(values, field)
              var previous = previousValues && getIn(previousValues, field)
              if (!isEqual(next, previous)) {
                if (typeof updates === 'function') {
                  var results = updates(next, field, values, previousValues)
                  if (isPromise$1(results)) {
                    results.then(function(resolved) {
                      Object.keys(resolved).forEach(function(destField) {
                        form.change(destField, resolved[destField])
                      })
                    })
                  } else {
                    Object.keys(results).forEach(function(destField) {
                      form.change(destField, results[destField])
                    })
                  }
                } else {
                  Object.keys(updates).forEach(function(destField) {
                    var update = updates[destField]
                    var result = update(next, values, previousValues)
                    if (isPromise$1(result)) {
                      result.then(function(resolved) {
                        form.change(destField, resolved)
                      })
                    } else {
                      form.change(destField, result)
                    }
                  })
                }
              }
            }
            var fields = form.getRegisteredFields()
            calculations.forEach(function(_ref2) {
              var field = _ref2.field,
                isEqual = _ref2.isEqual,
                updates = _ref2.updates

              if (typeof field === 'string') {
                runUpdates(field, isEqual || tripleEquals$1, updates)
              } else {
                // field is a either array or regex
                var matches = Array.isArray(field)
                  ? function(name) {
                      return ~field.indexOf(name)
                    }
                  : function(name) {
                      return field.test(name)
                    }
                fields.forEach(function(fieldName) {
                  if (matches(fieldName)) {
                    runUpdates(fieldName, isEqual || tripleEquals$1, updates)
                  }
                })
              }
            })
            previousValues = values
          })
        },
        { values: true }
      )
      return unsubscribe
    }
  }

  //

  exports.default = createDecorator

  Object.defineProperty(exports, '__esModule', { value: true })
})
//# sourceMappingURL=final-form-calculate.umd.js.map

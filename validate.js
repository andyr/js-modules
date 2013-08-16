define(function (require) {
/**
 * Generic form validation:
 * - Add validation functions (required, optional, states)
 * - Be generic enough to retrofit existing forms
 * - Mix into underscore 
 *
 * Usage:
 *  var errors = _v(rules).validate(form);
 *  isValid = _.reduce( errors, function (error) {
 *    return !(error);
 *  } );
 *
 * - depends on underscore.js
 * @param ruleMap = {
 *     'zip': {
 *       'isNumeric': [],
 *       'lengthEquals': [5]
 *     },
 *     'phone': {
 *       'required': [true]
 *     }
 *   }
 * @param attrs = {
 *     'zip': '98103',
 *     'city': 'Seattle',
 *     'phone': 'xyz'
 *   }
 *
 * @return errors = {
 *     'phone': [
 *       'xyz isn't a valid phone',
 *       'some other error?'
 *     ]
 *   }
 *
 * */


  var log               = console.log.bind(console),
      _                 = require('underscore');

  var Validator = function (ruleMap) {

    String.atMost = function (max) { 
      if( !(this.length <= max) )
        throw("At most " + max + " characters.");
    }
    String.atLeast = function (min) {
      if( !(this.length >= min) )
        throw("At least " + min + " characters.");
    }
    String.isNumeric = function () {
      if( !(/^[0-9]+$/g).test(this) )
        throw("Can only contain numbers.");
    }
    String.checkLength = function (min, max) {
      // check that str is [min,max] in length
      try {
        this.checkLengthGreaterThan(min) && this.checkLengthLessThan(max)
      } catch(ex) {
        throw(ex.message);
      }
    }
    String.isPhone = function () {
      if( !(/(\([0-9]{3}\s\)|[0-9]{3}-)[0-9]{3}-[0-9]{4}/).test(this) )
        throw("Enter a valid phone number.");

    return {
      validate: function (attrs) {
        var errors = [];

        errors = _.map(attrs, function (rules, fieldName) {
          var value = attrs[fieldName] || "",
              rules = ruleMap[fieldName] || [];
              localErrors = {};
          log("Mapping errors: ", value, fieldName, rules);
          localErrors[fieldName] = []
          _.each(rules, function (rule, i) { // only 1 rule in a ruleObj
            _.each(rule, function (args, func) {
              try {
                log("Trying rule ", fieldName, value, func, args);

                // Reflect so we can more generically express:
                // Number()['toFixed'].apply(4, [2]) == "4.00"
                value[func].apply(value, args)
              } catch(exc) {
                if( exc.message )
                  localErrors[fieldName].push(exc.message);
              }
            });
          });
          return localErrors;
        });
        return errors;
      }
    };
  };

  return {
    Validator: Validator
  }

});


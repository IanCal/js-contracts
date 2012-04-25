function setContracts(f)  {
        f.prototype.contractsSet = true;
        return function(){
            if(f.prototype.precondition && !f.prototype.precondition.apply(this, arguments)){
                throw new Error("Precondition violated");
            };
            var result = f.apply(this, arguments);
            var postConditionArgs = Array.prototype.slice.call(arguments, 0);
            postConditionArgs.push(result);
            if(f.prototype.postcondition && !f.prototype.postcondition.apply(this, postConditionArgs)){
                throw new Error("Postcondition violated");
            };
            return result;
        }
    }

/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
// Modified to use the function modification above for pre/post conditions

(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
  // The base Class implementation (does nothing)
  this.Class = function(){};
  
  // Create a new Class that inherits from this class
  Class.extend = function(prop) {
    var _super = this.prototype;
    
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;
    var prop_name = undefined;
    
    // Copy the properties over onto the new prototype
    for (var name in prop) {
      prop_name = prop[name];
      if (typeof(prop_name) == "function" && prop_name.prototype.contractsSet != true){
            prop_name = setContracts(prop_name);
      }
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop_name == "function" && 
        typeof _super[name] == "function" && fnTest.test(prop_name) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
            
            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];
            
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);        
            this._super = tmp;
            
            return ret;
          };
        })(name, prop_name) :
        prop_name;
    }
    
    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }
    
    // Populate our constructed prototype object
    Class.prototype = prototype;
    
    // Enforce the constructor to be what we expect
    Class.prototype.constructor = Class;

    // And make this class extendable
    Class.extend = arguments.callee;
    
    return Class;
  };
})();

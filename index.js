// Make these methods safe from overwriting.
var call = Function.prototype.call,
    slice = call.bind(Array.prototype.slice),
    toString = call.bind(Object.prototype.toString),
    hasOwnProperty = call.bind(Object.prototype.hasOwnProperty),
    defineProperty = Object.defineProperty,
    create = Object.create,
    keys = Object.keys;

var start = Object.create({}, {
    create: {
        value: function(context){
            var s = create(this);
            if(context){
                defineProperty(s, 'context', {
                    value: context
                });
            }
            return s;
        },
        configurable: true
    },
    define: {
        value: function(name, descriptor){
            defineProperty(this.context, name, descriptor);
        }
    },
    has: {
        value: function(name, onPrototype){
            if(onPrototype) return name in this.context;
            return hasOwnProperty(this.context, name);
        }
    },
    clean: {
        value: function(){
            keys(this.context).filter(function(key){
                return this.has(key);
            }, this)
            .map(function(key){
                //Try to delete first.
                //delete removes the property
                try{delete this.context[key];}catch(e){}
                return key;
            }, this);
        }
    },
    context: {
        get: function(){
            return this;
        },
        configurable: true
    },
    inherit: {
        value: function(){
            return create(this.context);
        }
    },
    extend: {
        value: function(){
            return slice(arguments).reduce(function(prev, source){
                return keys(source).reduce(function(prev, name){
                    if(hasOwnProperty(source, name))
                        prev[name] = source[name];
                    return prev;
                }, prev);
            }, this.context);
        }
    },
    extendReadOnly: {
        value: function(){

            return slice(arguments).reduce(function(prev, source){
                return keys(source).reduce(function(prev, name){
                    if(hasOwnProperty(source, name)){
                        defineProperty(prev, name, {
                            value: source[name],
                            configurable: true,
                            enumerable: true
                        });
                    }

                    return prev;
                }, prev);
            }, this.context);
        }
    },
    affix: {
        value: function(){

            var enumerable = true, objects;

            if(typeof arguments[arguments.length - 1] === 'boolean'){
                enumerable = arguments[arguments.length - 1];
                objects = slice(arguments, 0, -1);
            }else{
                objects = slice(arguments);
            }

            objects.forEach(function(source){
                return keys(source).forEach(function(key){
                    if(hasOwnProperty(source, key)){
                        this.define(key, {
                            value: source[key],
                            enumerable: enumerable
                        });
                    }
                }, this);
            }, this);

            return this.context;
        }
    },
    bind: {
        value: function(source, descriptor){
            var descript,
            d = {
                writable: true,
                configurable: true,
                enumerable: true
            };

            if(typeof descriptor === 'object'){
                d = WellSpring(d).extend(descriptor);
            }

            for(var name in source){
                if(typeof source[name] === 'function' && hasOwnProperty(source, name)){
                    descript = WellSpring(d).compose({
                        value: source[name].bind(source)
                    });
                    try{
                        this.define(name, descript);
                    }catch(e){
                        throw e;
                    }
                }
            }
        }
    },
    compose: {
        value: function(){
            var dest = WellSpring(this.inherit());
            return dest.extend.apply(dest, arguments);
        }
    },
    inject: {
        value: function(args, callback){
            var ret;

            if(arguments.length === 1){
                callback = args;
                args = [this.context];
            }else if(toString(args) !== '[object Array]'){
                args = slice(arguments, arguments.length - 2);
                callback = arguments[arguments.length - 1];
            }

            ret = callback.apply(null, args);

            if(ret && ret.then){
                return ret;
            }

            return Promise.resolve(ret);
        }
    }
});

function WellSpring(context){
    return start.create(context || null);
}

Object.defineProperty(WellSpring, 'prototype', {
    value: start
});

module.exports = WellSpring;

/*
NOTE


Property descriptors are by default:
    * Not eumerable
    * Not writable
    * Not configurable

*/

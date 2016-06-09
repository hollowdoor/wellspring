Wellspring
==========

Install
=======

`npm install --save wellspring`

API
===

ws(object) -> `wellspring instance`
-----------------------------------

`ws` would be the constructor of wellspring.

ws(object).inherit() -> `new object`
------------------------------------

Create a *new object* that inherits from `object`.

The *new object* will have `object` as its prototype.

This is a style of differential inheritance.

ws(object).extend(source) -> `object`
-------------------------------------

Add properties from a `source` object to the `object`.

ws(object).extendReadOnly(source) -> `object`
---------------------------------------------

Add read only properties to the `object` from a `source` object.

**Warning:** Right now properties set with `extendReadOnly` are iterable, and configurable. This could change in the future.

ws(object).compose(objects, ...) -> new object
----------------------------------------------

Create a new object that inherits from `object`, and has all the properties of the *objects*. :)

Objects in the right most position have precedence so if more the one of the *objects* has the same property the right most wins.

Compose pretty much works like `extend`, but creates a new object as well.

ws(object).inject(arg(s), ..., callback) -> promise
---------------------------------------------------

Pass a callback to `inject` that will be called immediately.

The arg(s) argument is optional. arg(s) is the arguments of `callback` arg(s) can be an array.

When no arg(s) is passed then the default argument is the `object`.

Return a promise from the `callback` to preserve asynchronous integrity.

`inject` always returns a promise, but if you do synchronous stuff in the inject `callback` you don't have to wait for the promise to resolve. You can use what ever you do in the callback right away.

You can return anything from the `callback`. `inject` will always return a promise. Even if you don't use that promise.

ws().create(object) -> wellspring instance
------------------------------------------

Create a wellspring instance that operates on `object`. You shouldn't need to do this usually.

ws(object).define(name, descriptor) -> object
---------------------------------------------

Create a property on `object` with `name` using a javascript property `descriptor`.

ws(object).has(name, onThePrototype) -> boolean
-----------------------------------------------

Check if the property name exists on the object.

`onThePrototype` is an optional boolean argument to allow checking on the prototype chain.

Example:

```javascript
var ws = require('wellspring');

var obj = {};

ws(obj).extend({
    greeting: 'Hi',
    print: function(val){
        console.log(val);
    }
});


ws(obj).inject((obj) => {
    ws(obj).extend({
        greet: function(){
            this.print(this.greeting + ' all!')
        }
    });
});

ws(obj).inject((obj) => {
    return new Promise(resolve => {
        obj.bla = 'bla'
        resolve();
    });
}).then(function(){
    //The bla property would be ready now.
});

// Create a new object that has obj as it's prototype.
var obj2 = ws(obj).inherit();

obj2.greet() //Hi all!
```

See the **EXAMPLES.md** file in the wellspring git repository for more.

Why?
----

Differential inheritance is good for speedy programming, inheritance, and plugin systems.

There is also `stampit` which is a nice library you might want to try. `stampit` is the original differential inheritance library.

When?
-----

In the opinion of the creator of this library differential inheritance can be used anywhere, but is best used for plugin systems.

Reading
=======

-	[Universal design pattern](http://steve-yegge.blogspot.com/2008/10/universal-design-pattern.html)
-	[Fly weight pattern](http://www.dofactory.com/javascript/flyweight-design-pattern)
-	[Prototype based programming](https://en.wikipedia.org/wiki/Prototype-based_programming)

**This library is using the super permissive license WTFPL.**

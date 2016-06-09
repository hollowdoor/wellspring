Examples
========

-	[Extension, and injection](#ext_injection)
-	[Bulk asynchronous extension](#bulk_async_injection)
-	[Differential Inheritance](#differential_inheritance)
-	[Extend wellspring itself](#extend_wellspring)

<a name="ext_injection">Extension, and injection</a>
----------------------------------------------------

```javascript
var ws = require('wellspring');

var obj = {original: 'original'};

ws(obj).extend({
    greeting: 'Hi',
    print: function(val){
        console.log(val);
    }
});


ws(obj).inject(obj, (obj) => {
    ws(obj).extend({
        greet: function(){
            this.print(this.greeting + ' all')
        }
    });
});

ws(obj).inject((obj) => {
    return new Promise(function(resolve){
        obj.asyncValue = 'something';
        resolve();
    });
}).then(function(){
    console.log('ready')
});


obj.greet();

```

<a name="bulk_async_injection">Bulk asynchronous extension, and injection.</a>
------------------------------------------------------------------------------

```javascript
var ws = require('wellspring');

var obj = {original: 'original'};

var plugins = [
    (obj) => {
        return new Promise(resolve => {
            ws(obj).extend({
                greet: function(){
                    this.print(this.greeting + ' all')
                }
            });
            resolve();
        });
    },
    (obj) => {
        return new Promise(resolve => {
            ws(obj).extend({
                greeting: 'Hi',
                print: function(val){
                    console.log(val);
                }
            });
            resolve();
        });
    },
    (obj) => {
        return new Promise(resolve => {
            obj.bla = 'bla'
            resolve();
        });
    }
];



Promise.all(plugins.map((plugin) => {
    return ws(obj).inject(plugin);
})).then(main).catch((err)=>{console.log(err)});

function main(){
    obj.greet();
}

```

<a name="differential_inheritance">Differential Inheritance</a>
---------------------------------------------------------------

A.K.A. prototypical inheritance. A.K.A. properties pattern.

```javascript
var ws = require('wellspring');

var animal = {
    type: 'animal',
    phrase: null,
    speak: function(){
        console.log(this.phrase ? `The ${this.type} says ${this.phrase}` : '?');
    }
};

var cat = ws(animal).inherit();
cat.type = 'cat';
cat.phrase = 'Meow!';

var dog = ws(animal).inherit();
dog.type = 'dog';
dog.phrase = 'Woof!';

var lion = ws(cat).inherit();
lion.phrase = 'Roar!!!';

cat.speak(); // The cat says Meow!
dog.speak(); // The dog says Woof!
lion.speak(); // The cat says Roar!!!

animal.speak(); // ?
```

<a name="extend_wellspring">Extend wellspring itself</a>
--------------------------------------------------------

This will extend the wellspring prototype.

```javascript
var ws = require('wellspring');

ws(ws.prototype).inject((obj) => {
    ws(obj).extend({
        wsPlugin: function(){
            console.log('Hi I\'m a wellspring prototype plugin.')
        }
    });
});

var obj = {original: 'original'};

ws(obj).wsPlugin();
```

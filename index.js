var glob = require('glob'),
    util = require("util"),
    events = require("events"),
    cwd = process.cwd();


module.exports.load = Load;

function Load(folder, options, after){
    
    if(typeof after === 'undefined' && typeof options === 'function'){
        after = options;
        options = {};
    }
    
    var pattern = folder + '*' + 'package.json';
    
    return Open(pattern, options, after);
}

function Open(pattern, options, cb){
    var allowed = options.allowed || null,
        opts = {},
        resolver = new Resolver();
        mods = {};
    
    if(options.cwd)
        opts.cwd = options.cwd;
    
    glob(pattern, opts, function(err, list){
        
        
        readPackages(list, function(packageNames){
            var current;
            
            for(var i=0; i<packageNames.length; i++){
                try{
                    current = require(packageNames[i]);
                    
                    resolver.add(current);
                }catch(e){
                    console.log('Plugin ' + packageNames[i] + ' could not be required.');
                }
            }
        });
    });
    
    return resolver;
}

function readPackages(names, cb){
    var running = names.length,
        packageNames = [],
    
    read = function(name){
        fs.readFile(name, function(err, str){
            var json;
            
            try{
                json = JSON.parse(str);
            }catch(e){
                throw Error('package.json is not valid json');
            }
            
            packageNames.push(json);
            if(!--running)
                cb(packageNames);
            
        });
    };
    
    for(var i=0; i<names.length; i++){
        read(names[i]);
    }
}

function Resolver(){
    this.objects = {};
    this.dependers = {};
    this.depends = [];
    this.loaded = false;
    this.info = new DependsInfo(this);
}

Resolver.prototype.has = function(names){
    return this.info.has(names);
};

Resolver.prototype.isComplete = function(names){
    return this.info.isComplete(names);
};

Resolver.prototype.canResolve = function(plugin){
    return this.has(plugin.depends || []) && this.isComplete(plugin.depends || []);
};

Resolver.prototype.add = function(plugin){
        
    this.dependers[name] = plugin;
    this.complete[name] = false;
    return this.resolve();
};

Resolver.prototype.resolve = function(){
    
    for(var name in this.dependers){
        
        if(this.canResolve(this.dependers[name])){
            if(this.dependers[name].exec)
                this.objects[name] = this.dependers[name].exec(this.objects, new DependsInfo(this, name));
            else
                this.objects[name] = this.dependers[name].value;
            delete this.dependers[name];
        }
    }
    
    return this;
};

function DependsInfo(resolver, current){
    
    events.EventEmitter.call(this);
    
    this.jobs = 0;
    this.current = current;
    
    this.ready = function(){
        if(!--this.jobs)
            this.emit(current + ':ready');
    };
    
    this.has = function(name){
        if(Object.prototype.toString.call(names) === '[object Array]' && names.length)
            if(!names.length)
                return undefined;return names.every(
                function(value){ return this.objects[String(value)] && true || false; }, resolver);
        else
            return resolver.objects[String(names)] && true || false;
    };
    
    this.isComplete = function(names){
        if(Object.prototype.toString.call(names) === '[object Array]')
            if(!names.length)
                return undefined;
            return names.every(function(value){ return this.complete[String(value)]; }, resolver);
        else
            return resolver.complete[String(names)];
    };
    
    
}

util.inherits(DependsInfo, events.EventEmitter);



/*possible depencies
files, properties, objects, methods
*/
function DependencyEvents(context){
    this.listeners = {};
    this.complete = [];
    this.context = obj;
}

DependencyEvents.prototype.dispatch = function(name){
    var smack = Object.keys(this.listeners),
        current,
        ready = 1,
        listeners,
        regular;
    
    for(var i=0; smack.length; i++){
        current = smack[i].split(':');
        
        if(current.length > 1 && current.indexOf(name) !== -1){
            for(var j=0; j<current.length; j++){
                if(this.complete.indexOf(current[j]) !== -1){
                    ready++;
                }
            }
            
            if(ready === smack.length){
                listeners = this.listeners[smack[i]];
                
                for(var k=0; k<listeners.length; k++){
                    listeners[k].call(null, this.context);
                }
                
                break;
            }
        }
        
        ready = 1;
    }
    
    if(this.listeners[name]){
        listeners = this.listeners[name];
        for(var i=0; i<listeners.length; i++){
            listeners[i].call(null, this.context);
        }
        
        this.complete.push(name);
    }
};

DependencyEvents.prototype.on = function(name, cb){
    var ready = 1,
        names = name.split(':');
    
    for(var i=0; i<names.length; i++){
        if(this.complete.indexOf(names[i]) !== -1){
            ready++;
        }
    }
    
    if(ready === names.length){
        cb.call(null, this.context);
        return this;
    }
    
    this.listeners[name].push(cb);
    return this;
};

function ModuleList(){
    this.list = {};
    this.names = [];
}

ModuleList.prototype.add = function(mod){
    
    this.names.push(mod.name);
    
    for(var n in mod){
        this.list[n] = this.list[n] || [];
        this.list[n].push({
            name: mod.name,
            exec: mod[n]
        });
    }
    
    return this;
};

ModuleList.prototype.run = function(name, obj, done){
    
    var events = new DependencyEvents(obj),
        list = this.list[name];
    
    list = list.reverse();
    
    var next = function(){
        if(!--index)
            return done.call(events, obj);
        
        list[index].exec.call(events, obj, next);
        events.dispatch(list[index].name);
    };
    
    next();
    
    return events;
};

/*
ModuleList.prototype.run = function(name, obj, done){
    var a = this.list[name].concat([]),
        first = [],
        current;
    
    var eventer = {
        complete: [],
        listeners: {}
    };
    eventer.on = function(name, cb){
        if(complete.indexOf(name) !== -1){
            cb.call(null, obj);
        }else{
            eventer.listeners[name] = eventer.listeners[name] || [];
            eventer.listeners[name].push(cb);
        }
    };
    
    eventer.emit = function(name){
        complete.push(name);
        var listeners = eventer.listeners[name];
        for(var i=0; i<listeners.length; i++){
            listeners[i].apply(null, obj);
        }
    };
    
    for(var i=0; i<a.length; i++){
        if(a.depends && a.depends.length){
            for(var j=0; j<a.depends.length; j++){
                if(this.names.indexOf(a.depends[j])){
                
                }
            }
        }
    }
};

ModuleList.prototype.run = function(name, obj, done){
    var list = this.list[name],
        index;
    
    var found = false,
        d;
    for(var i=0; i<list.length; i++){
        if(list[i].dependencies){
            d = list[i].dependencies;
            while(d.length)
                current = d.pop();
                if(list[i].dependencies.indexOf(list[j].name) !== -1){
                    found = true;
                }
            }
            if(!found)
                
            found = false;
        }
    }
    var inject = {};
    
    for(var i=0; i<list.length; i++){
        inject[list[i].name] = (function(fn, context){
            return function(cb){
                fn.apply(context, obj, cb);
                fn.complete = true;
            };
        }(list[i], inject));
    }
    
    list = list.reverse();
    
    index = list.length;
    
    var waiting = [];
    
    var next = function(){
        
        if(!--index)
            return done.apply(inject, obj);
        
        if(!list[index].complete){
            list[index].apply(inject, obj, next);
            list[index].complete = true;
        }
        
    };
    
    next.wait = function(){
        waiting.push(list[index]);
        next();
    };
};*/

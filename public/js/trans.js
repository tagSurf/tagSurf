var trans = {
    cancel: function(tobj) {
        if (tobj.cancelled) return;
        tobj.cancelled = true;
        if (tobj.timeout) {
            clearTimeout(tobj.timeout);
            tobj.timeout = null;
        }
        tobj.node.removeEventListener("webkitTransitionEnd", tobj.wrapper, false);
        if (tobj.transition) {
            if (tobj.isClass)
                tobj.node.classList.remove(tobj.transition);
            else
                tobj.node.style['-webkit-transition'] = '';
        }
    },
    go: function(node, x, y, t, cb) {
        return trans.trans(node, cb,
            '-webkit-transform ' + t + 'ms linear',
            'translate3d(' + x + 'px,' + y + 'px,0)');
    },
    trans: function(node, cb, transition, transform) {
        var tobj = { node: node, transition: transition, transform: transform,
            isClass: transition && transition.split(" ").length == 1 };
        tobj.wrapper = function () {
            if (tobj.cancelled) return;
            trans.cancel(tobj);
            cb && cb();
        };
        node.addEventListener("webkitTransitionEnd", tobj.wrapper, false);
        if (transition) {
            if (tobj.isClass)
                node.classList.add(transition);
            else {
                node.style['-webkit-transition'] = transition;
                tobj.timeout = setTimeout(tobj.wrapper,
                parseInt(transition.split(" ")[1]));
            }
        }
        if (transform) node.style['-webkit-transform'] = transform;
        return tobj;
    }
};

var starttrans = function(node, velocities, cb) {

};

var trans = {
    constants: {
        tick: 300,
    },
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
    _tick: function(td) {
        var tn = td.node, tct = trans.constants.tick;
        if (tn.xVelocity || tn.yVelocity) {
            trans.go(tn,
                tn.xDrag + tn.xVelocity * tct,
                tn.yDrag + tn.yVelocity * tct,
                tct, function() {
                    trans._tick(td);
                });
        } else {
            tn.ticking = false;
            td.onStop();
        }
    },
    start: function(node, onStop) {
        // node must track and update its own
        // velocities: node.xVelocity/yVelocity.
        // these represent TRUE velocity, unlike
        // node.vx/vy, which are unbounded finger
        // velocities. node also needs xDrag/yDrag.
        if (node.ticking) return;
        node.ticking = true;
        trans._tick({
            node: node,
            onStop: onStop
        });
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
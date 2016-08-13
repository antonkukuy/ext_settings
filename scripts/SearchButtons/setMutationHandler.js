/* EXAMPLE:
    
    setMutationHandler(document, '.container p.some-child', function(nodes) {
        // single node:
        nodes[0].remove();
        
        // or multiple nodes:
        nodes.forEach(function(node) {
            node.style.display = 'none';
        });

        //this.disconnect(); // disconnect the observer, this is useful for one-time jobs
        return true; // continue enumerating current batch of mutations
    });
*/

// ==UserScript==
// @name          setMutationHandler
// @description   MutationObserver wrapper to wait for the specified CSS selector
// @namespace     wOxxOm.scripts
// @author        wOxxOm
// @grant         none
// @version       2.0.7
// ==/UserScript==

function setMutationHandler(baseNode, selector, cb, options) {
    var queue = [];
    var timer;
    var ob = new MutationObserver(function handler(mutations) {
        if (mutations && mutations.length > 100) {
            if (!queue.length)
                setTimeout(handler, 0);
            queue.push(mutations);
            return;
        }
        do {
            if (!mutations) {
                mutations = queue.shift();
                if (!mutations)
                    return;
            }

            for (var i=0, ml=mutations.length; i < ml; i++) {
                var m = mutations[i];
                switch (m.type) {
                    case 'childList':
                        var nodes = m.addedNodes, nl = nodes.length;
                        var textNodesOnly = true;
                        for (var j=0; j < nl; j++) {
                            var n = nodes[j];
                            textNodesOnly &= n.nodeType == 3; // TEXT_NODE
                            if (n.nodeType != 1) // ELEMENT_NODE
                                continue;
                            if (n.matches(selector))
                                n = [n];
                            else if (n.querySelector(selector))
                                n = Array.prototype.slice.call(n.querySelectorAll(selector));
                            else
                                continue;
                            if (!cb.call(ob, n, m))
                                return;
                        }
                        if (textNodesOnly && m.target.matches(selector) && !cb.call(ob, [m.target], m))
                            return;
                        break;
                    case 'attributes':
                        if (m.target.matches(selector) && !cb.call(ob, [m.target], m))
                            return;
                        break;
                    case 'characterData':
                        if (m.target.parentNode && m.target.parentNode.matches(selector) && !cb.call(ob, [m.target.parentNode], m))
                            return;
                        break;
                }
            }
            mutations = null;
        } while (queue.length);
    });
    ob.observe(baseNode, options || {subtree:true, childList:true});
    return ob;
}

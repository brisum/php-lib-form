(function(factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof exports !== 'undefined') {
        module.exports = factory(require('jquery'));
    } else {
        factory(jQuery);
    }
}(function($) {
    'use strict';

    // serializeJSON fixed
    $.fn.serializeJSON = function(){
        var json = {};
        var form = $(this);
        form.find('input, select, textarea').each(function(){
            var val;
            if (!this.name) return;

            if ('radio' === this.type) {
                if (json[this.name]) { return; }

                json[this.name] = this.checked ? this.value : '';
            } else if ('checkbox' === this.type) {
                val = json[this.name];

                if (!this.checked) {
                    // if (!val) { json[this.name] = ''; }
                } else {
                    json[this.name] =
                        typeof val === 'string' ? [val, this.value] :
                            $.isArray(val) ? $.merge(val, [this.value]) :
                                this.value;
                }
            } else {
                json[this.name] = this.value;
            }
        });
        return json;
    }
}));

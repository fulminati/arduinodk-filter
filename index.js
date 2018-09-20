/*!
 * arduinodk-filter
 *
 * Copyright(c) 2016-2017 Javanile.org
 * MIT Licensed
 */

const fu = require('nodejs-fu')
    , glob = require('glob')
    , foreach = require('boor').foreach

module.exports = {

    /**
     * USE this tag\(("|')(.*?[^\\])??((\\\\)+)?+("|') for escaoe quotes
     *
     */
    selector: function (filter) {
        return new RegExp('@' + filter + '\\(.*?\\)', 'gm')
    },

    /**
     *
     * @param sketch
     * @param filter
     * @param processSelector
     */
    onBefore: function (sketch, filter, processor) {
        var files = glob.sync('**/*.{ino,h}', { cwd: sketch.path, absolute: true })
        var selector = this.selector(filter)

        foreach(files, (file) => {
            var prev = file + '.' + filter
            var code = fu.readFile(fu.fileExists(prev) ? prev : file)

            if (code.match(selector)) {
                fu.writeFile(prev, code)
                fu.writeFile(file, this.processor(code, selector, processor))
            }
        });
    },

    /**
     *
     * @param sketch
     * @param filter
     */
    onAfter: function (sketch, filter) {
        var files = glob.sync('**/*.' + filter, { cwd: sketch.path, absolute: true })

        foreach(files, (file) => {
            fu.writeFile(file.slice(0, -1 - filter.length), fu.readFile(file))
            fu.unlink(file)
        });
    },

    /**
     *
     * @param code
     * @param processor
     */
    processor: function (code, selector, processor) {
        return code.replace(selector, function (token, arg1, arg2) {
            console.log('AA', token)
            //let token = arguments.shift()
            return processor(token)
        })
    },

    /**
     *
     * @param string
     * @returns {string}
     */
    quote: function (string) {
        return '"' + string + '"';
    }
};

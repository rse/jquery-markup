/*
**  jquery.markup.js -- jQuery Template Based Markup Generation
**  Copyright (c) 2013 Ralf S. Engelschall <rse@engelschall.com>
**
**  Permission is hereby granted, free of charge, to any person obtaining
**  a copy of this software and associated documentation files (the
**  "Software"), to deal in the Software without restriction, including
**  without limitation the rights to use, copy, modify, merge, publish,
**  distribute, sublicense, and/or sell copies of the Software, and to
**  permit persons to whom the Software is furnished to do so, subject to
**  the following conditions:
**
**  The above copyright notice and this permission notice shall be included
**  in all copies or substantial portions of the Software.
**
**  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
**  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
**  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
**  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
**  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
**  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
**  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

(function ($) {

    /*  the storage of all markup expansion functions  */
    var markup = {};

    /*  local context-sensitive markup-expansion API function  */
    $.fn.extend({
        markup: function (id, data) {
            var result = this;
            this.each(function () {
                var el = $.markup(id, data);
                $(this).append(el);
                result = el;
            })
            return result;
        }
    });

    /*  global context-free markup-expansion API function  */
    $.markup = function (id, data) {
        if (typeof markup[id] === "undefined")
            throw new Error("jquery: markup: ERROR: no such markup with id '" + id + "' found");
        return $($.parseHTML(markup[id](data)));
    };

    /*  plugin version number  */
    $.markup.version = "1.0.0";

    /*  debug level  */
    $.markup.debug = 0;
    var debug = function (level, msg) {
        if (   $.markup.debug >= level
            && typeof console !== "undefined"
            && typeof console.log === "function")
            console.log("jquery: markup: DEBUG[" + level + "]: " + msg);
    };
    var esctxt = function (txt) {
        return "\"" +
            txt.replace(/\r/g, "\\r")
            .replace(/\n/g, "\\n")
            .replace(/"/g, "\\\"") +
        "\"";
    };

    /*  template language registry  */
    var registry = {};
    $.markup.register = function (lang) {
        registry[lang.id] = lang;
    };

    /*  compile a markup into an expansion function  */
    var compile = function (type, id, txt) {
        debug(1, "compile: type=" + type + " id=" + id);
        debug(4, "compile: txt=" + esctxt(txt));

        if (typeof registry[type] === "undefined")
            throw new Error("jquery: markup: ERROR: no template language registered under id '" + type + "'");
        if (!registry[type].available())
            throw new Error("jquery: markup: ERROR: template language '" +
                type + "' (" + registry[type].name + ", " + registry[type].url + ") " +
                "known but not found under run-time");
        markup[id] = registry[type].compile(txt);
    };

    /*  parse a markup definition document  */
    var parse = function (type, txt) {
        debug(3, "parse: type=" + type + " txt=" + esctxt(txt));
        var section = [];
        section.push({ txt: "", attr: { id: "", type: type, include: "false" }});
        var m;
        while (txt !== "") {
            /*  section opening tag  */
            if ((m = txt.match(/^<markup((?:\s+(?:id|type|include)="[^"]*")+)\s*>/)) !== null) {
                /*  parse key="value" attributes  */
                debug(4, "parse: section opening tag: " + esctxt(m[0]));
                var attr = {};
                var txt2 = m[1], m2;
                while ((m2 = txt2.match(/^\s+([a-z]+)="([^"]*)"/)) !== null) {
                    debug(4, "parse: section attribute: name=" + esctxt(m2[1]) + " value=" + esctxt(m2[2]));
                    attr[m2[1]] = m2[2].match(/^true|false$/) ? (m2[2] === "true") : m2[2];
                    txt2 = txt2.substr(m2[0].length);
                }
                if (typeof attr.id === "undefined")
                    throw new Error("jquery: markup: ERROR: missing required 'id' attribute");
                if (section[section.length - 1].attr.id !== "")
                    attr.id = section[section.length - 1].attr.id + "/" + attr.id;
                if (typeof attr.type === "undefined")
                    attr.type = section[section.length - 1].attr.type;
                if (typeof attr.include === "undefined")
                    attr.include = false;

                /*  open new section  */
                section.push({ txt: "", attr: attr });
                txt = txt.substr(m[0].length);
            }

            /*  section closing tag  */
            else if ((m = txt.match(/^<\/markup\s*>/)) !== null) {
                /*  close current section  */
                debug(4, "parse: section closing tag: " + esctxt(m[0]));
                var s = section.pop();
                compile(s.attr.type, s.attr.id, s.txt);
                if (s.attr.include)
                    section[section.length - 1].txt += s.txt;
                txt = txt.substr(m[0].length);
            }

            /*  plain-text between tags (arbitray long)  */
            else if ((m = txt.match(/^((?:.|\r?\n)+?)(?=<\/?markup|$)/)) !== null) {
                /*  append plain-text to current section  */
                debug(4, "parse: plain-text (arbitrary long): " + esctxt(m[0]));
                section[section.length - 1].txt += m[1];
                txt = txt.substr(m[0].length);
            }

            /*  plain-text between tags (single character fallback)  */
            else {
                /*  append plain-text to current section  */
                debug(4, "parse: plain-text (single character fallback): " + esctxt(txt.substr(0, 1)));
                section[section.length - 1].txt += txt.substr(0, 1);
                txt = txt.substr(1);
            }
        }
    };

    /*  queue markup loading requests  */
    var queue = [];
    $.markup.queue = function (url, type) {
        debug(2, "queue: url=" + url + " type=" + type);
        queue.push({ url: url, type: type });
    };

    /*  asynchronously load all queued markup  */
    $.markup.load = function (onDone) {
        debug(1, "load: loading all queued markup requests");
        var todo = queue; queue = [];
        var done = 0;
        for (var i = 0; i < todo.length; i++) {
            var type = todo[i].type;
            debug(2, "load: url=" + todo[i].url + " type=" + type);
            $.get(todo[i].url, function (txt) {
                parse(type, txt);
                done++;
                if (done >= todo.length)
                    onDone();
            });
        }
    };

    /*  automatically process all <link> tags  */
    $(document).ready(function () {
        debug(1, "ready: processing all <link> tags");
        $("head > link").each(function () {
            var h = $(this).attr("href");
            var r = $(this).attr("rel");
            var t = $(this).attr("type");
            if (h !== "" && r !== "" && t !== "") {
                var mr = r.match(/^markup(?:\/([a-z]+))?$/);
                var mt = t.match(/^text\/(?:html|x-markup-([a-z]+))$/);
                if (mr !== null && mt !== null) {
                    var type = (typeof mr[1] === "string" && mr[1] !== "") ? mr[1] :
                               (typeof mt[1] === "string" && mt[1] !== "") ? mt[1] : "plain";
                    $.markup.queue(h, type);
                }
            }
        });
    });

    /*  helper function for checking that a function is available  */
    $.markup.isfn = function (path) {
        var p = path.split(/\./);
        var o = window;
        for (var i = 0; i < p.length; i++) {
            o = o[p[i]];
            if (   (i <   p.length - 1 && typeof o === "undefined")
                || (i === p.length - 1 && typeof o !== "function" ))
                return false;
        }
        return true;
    };

    /*  Plain HTML (efficient: pass-through only, incomplete: no data)  */
    $.markup.register({
        id:        "plain",
        name:      "Plain HTML",
        url:       "-",
        available: function ()    { return true; },
        compile:   function (txt) { return function (data) { return txt; }; }
    });

    /*  Handlebars (efficient: pre-compilation, complete: data support)  */
    $.markup.register({
        id:        "handlebars",
        name:      "Handlebars",
        url:       "http://handlebarsjs.com/",
        available: function ()    { return $.markup.isfn("Handlebars.compile"); },
        compile:   function (txt) { return Handlebars.compile(txt); }
    });

    /*  DUST (efficient: pre-compilation, complete: data support)  */
    $.markup.register({
        id:        "dust",
        name:      "DUST",
        url:       "http://akdubya.github.io/dustjs/",
        available: function ()    { return $.markup.isfn("dust.compile"); },
        compile:   function (txt) { return dust.compile(txt); }
    });

    /*  Jade (efficient: pre-compilation, complete: data support)  */
    $.markup.register({
        id:        "jade",
        name:      "Jade",
        url:       "http://jade-lang.com/",
        available: function ()    { return $.markup.isfn("jade.compile"); },
        compile:   function (txt) { return jade.compile(txt); }
    });

    /*  Mustache (efficient: pre-compilation, complete: data support)  */
    $.markup.register({
        id:        "mustache",
        name:      "Mustache",
        url:       "http://mustache.github.io/",
        available: function ()    { return $.markup.isfn("Mustache.compile"); },
        compile:   function (txt) { return Mustache.compile(txt); }
    });

    /*  Markup.js (inefficient: on-the-fly compilation, complete: data support)  */
    $.markup.register({
        id:        "markup",
        name:      "Markup.js",
        url:       "https://github.com/adammark/Markup.js/",
        available: function ()    { return $.markup.isfn("Mark.up"); },
        compile:   function (txt) { return function (data) { return Mark.up(txt, data) }; }
    });

    /*  Emmet markup (inefficient: on-the-fly compilation, incomplete: no data support)  */
    $.markup.register({
        id:        "markup",
        name:      "Markup.js",
        url:       "http://emmet.io/",
        available: function ()    { return $.markup.isfn("emmet.expandAbbreviation"); },
        compile:   function (txt) { return function (data) { return emmet.expandAbbreviation(txt) }; }
    });

})(jQuery);


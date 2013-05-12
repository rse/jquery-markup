
jQuery-Markup
=============

(jQuery Template Based Markup Generation)

Motivation
----------

When developing a Single-Page Application (SPA), JavaScript code is
used to render the entire UI in the browser on-the-fly. The UI is still
based on HTML markup and CSS stylesheets. While the CSS stylesheets are
(as their name implies) inherently cascading and are applied by the
browser once the HTML markup comes into place, the HTML markup has to
be manually rendered via JavaScript into the DOM tree. For this various
so-called HTML template languages exist. They allow you to describe the
markup in more concise and partially dynamic language and render the
static plain HTML markup on-the-fly. But a handy solution is needed to
on-the-fly pick up particular templates, render them and inject them
into the DOM.

Solution
--------

FIXME

Template Engine Support
-----------------------

The following HTML template languages and corresponding
expansion engines are supported out-of-the-box:

- `plain`: Plain-Text markup (efficient: pass-through)
- `handlebars`: [Handlebars](http://handlebarsjs.com/) (efficient: pre-compilation)
- `dust`: [DUST](http://akdubya.github.io/dustjs/) (efficient: pre-compilation)
- `jade`: [Jade](http://jade-lang.com/) (efficient: pre-compilation)
- `mustache`: [Mustache](http://mustache.github.io/) (efficient: pre-compilation)
- `markup`: [Markup](https://github.com/adammark/Markup.js/) (inefficient: on-the-fly compilation)
- `emmet`: [Emmet](http://emmet.io) (inefficient: on-the-fly compilation)

For supporting an additional template engine use a construct like the following:

    $.markup.register({
        id:        "handlebars",
        name:      "Handlebars",
        url:       "http://handlebarsjs.com/",
        available: function ()    { return $.markup.isfn("Handlebars.compile"); },
        compile:   function (txt) { return Handlebars.compile(txt); }
    });

License
-------

Copyright (c) 2013 Ralf S. Engelschall (http://engelschall.com/)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


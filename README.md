# Quick and dirty examples of making SVG sprites and using SVG icons

### Basic idea
- Have one or multiple icon sets on file _(or possibly hosted remotely, like on AWS' S3)_
- Have a build process or terminal command allowing for the optimisation of the SVGs & creation of the SVG sprite
- Have a component _(Vue, Blade, ...)_ allowing for the consumption of a specific icon in the icon sprite

### Examples

Say we have a bunch of icons organised in the following folders:

- icons > feathericons > user.svg
- icons > feathericons > home.svg
- icons > heroicons > outline > plus.svg
- icons > heroicons > outline > arrow-long-right.svg

Our build process or terminal command would have to scan for the available icons then create a sprite like the following:

```xml
<svg id="icons-sprite" xmlns="http://www.w3.org/2000/svg" xmlns:link="http://www.w3.org/1999/xlink">
    <symbol
        id="icon-feathericons-user"
        ...
    >
        <path d="..." />
    </symbol>
    <symbol
        id="icon-feathericons-home"
        ...
    >
        <path d="..." />
    </symbol>
    <symbol
        id="icon-heroicons-outline-plus"
        ...
    >
        <path d="..." />
    </symbol>
    <symbol
        id="icon-heroicons-outline-arrow-long-right"
        ...
    >
        <path d="..." />
    </symbol>
</svg>
```

Then, our usage of those icons would be centralised into one component like so:

```html
<x-icon class="h-6 w-6" name="heroicons.outline.arrow-long-right" aria-hidden="true" />
```

/// <reference types="vitest" />

import type { Plugin } from 'vite';
import type { ViteSvgIconsPlugin } from 'vite-plugin-svg-icons/dist/index';
import path from 'path';
import fs from 'fs';
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import watchAndRun from '@kitql/vite-plugin-watch-and-run';
import { compilerIcons } from 'vite-plugin-svg-icons';
import favicons from 'favicons';

export default defineConfig({
    resolve: {
        alias: {
            '~': path.resolve('.'),
            '@': path.resolve('./resources/ts'),
        },
    },
    plugins: [
        laravel({
            input: [
                'resources/css/app.css',
                'resources/ts/vendor/Boyo.ts',
                'resources/ts/vendor/Turbo.ts',
                'resources/ts/app.ts',
                'resources/ts/logged.ts',
            ],
            refresh: true,
        }),
        /**
         * @see https://www.kitql.dev/docs/setup/03_vite-plugin-watch-and-run
         */
        watchAndRun([
            {
                name: 'ide-helper:models -M',
                run: 'php artisan ide-helper:models -M',
                watch: path.resolve('app/Models/**/*.php').replace(/\\/g, '/'),
            },
        ]),
        customSvgIconsPlugin(),
        // faviconsPlugin(),
    ],

    /**
     * @see https://vitest.dev/config/#configuration
     */
    test: {
        environment: 'node',
        include: ['./resources/tests/vitest/**/*.test.ts'],
        /**
         * @see https://github.com/vitest-dev/vitest/blob/95b1ba4c17df1677136b39762c19d859db3f4cb2/packages/vitest/src/types/coverage.ts
         */
        coverage: {
            reportsDirectory: './resources/tests/vitest/.coverage',
            // include: ['src/utils/**/*.{ts,js}'],
            // Threshold
            statements: 90,
            branches: 90,
            functions: 90,
            lines: 90,
        },
    },
});

/* SVG icons plugin
------------------------------------------------*/

/**
 * @see https://github.com/vbenjs/vite-plugin-svg-icons/blob/7550357300793b96b3561fc708899b9f4309e906/packages/core/src/index.ts#L25
 */
function customSvgIconsPlugin(): Plugin {
    type FileStats = {
        relativeName: string;
        mtimeMs?: number;
        code: string;
        symbolId?: string;
    };

    const cache = new Map<string, FileStats>();

    const iconsDir = path.resolve(process.cwd(), 'resources/assets/icons');

    const options: ViteSvgIconsPlugin = {
        iconDirs: [iconsDir],
        symbolId: 'icon-[dir]-[name]',
        inject: 'body-last' as const,
        customDomId: 'icons-sprite',
        svgoOptions: {},
    };

    return {
        name: 'custom-vite:svg-icons',
        closeBundle: async () => {
            const { insertHtml } = await compilerIcons(
                cache,
                // @ts-expect-error shush
                options.svgoOptions,
                options
            );

            fs.writeFile(
                `${path.dirname(iconsDir)}/__icon-sprite.svg`,
                `
                <svg
                    id="${options.customDomId}"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlns:link="http://www.w3.org/1999/xlink"
                >
                    ${
                        insertHtml.replace(
                            /class="[a-zA-Z0-9:;.\s()\-,]*"/gi,
                            ''
                        ) /* .replace(/<symbol /ig, '<symbol class="icon" ') */
                    }
                </svg>
            `,
                'utf8',
                () => {}
            );
        },
    };
}

/* Favicons plugin
------------------------------------------------*/

/**
 * @see https://github.com/itgalaxy/favicons#usage
 */
function faviconsPlugin(): Plugin {
    return {
        name: 'custom-vite:favicons',
        closeBundle: async () => {
            const relativePath = '/favicons';

            try {
                const response = await favicons('./public/images/logo-icon.png', {
                    path: relativePath, // Path for overriding default icons path. `string`
                    appName: 'budgy.app', // Your application's name. `string`
                    appShortName: undefined, // Your application's short_name. `string`. Optional. If not set, appName will be used
                    appDescription: 'Application de suivi des dépenses / Application de suivi budgétaire', // Your application's description. `string`
                    developerName: undefined, // Your (or your developer's) name. `string`
                    developerURL: undefined, // Your (or your developer's) URL. `string`
                    dir: 'auto', // Primary text direction for name, short_name, and description
                    lang: 'fr-FR', // Primary language for name and short_name
                    background: '#fff', // Background colour for flattened icons. `string`
                    theme_color: '#8b5cf6', // Theme color user for example in Android's task switcher. `string`
                    appleStatusBarStyle: 'black-translucent', // Style for Apple status bar: "black-translucent", "default", "black". `string`
                    display: 'standalone', // Preferred display mode: "fullscreen", "standalone", "minimal-ui" or "browser". `string`
                    orientation: 'any', // Default orientation: "any", "natural", "portrait" or "landscape". `string`
                    scope: '/', // set of URLs that the browser considers within your app
                    start_url: '/?homescreen=1', // Start URL when launching the application from a device. `string`
                    preferRelatedApplications: false, // Should the browser prompt the user to install the native companion app. `boolean`
                    relatedApplications: undefined, // Information about the native companion apps. This will only be used if `preferRelatedApplications` is `true`. `Array<{ id: string, url: string, platform: string }>`
                    version: '1.0', // Your application's version string. `string`
                    pixel_art: false, // Keeps pixels "sharp" when scaling up, for pixel art.  Only supported in offline mode.
                    loadManifestWithCredentials: false, // Browsers don't send cookies when fetching a manifest, enable this to fix that. `boolean`
                    manifestMaskable: false, // Maskable source image(s) for manifest.json. "true" to use default source. More information at https://web.dev/maskable-icon/. `boolean`, `string`, `buffer` or array of `string`
                    icons: {
                        // Platform Options:
                        // - offset - offset in percentage
                        // - background:
                        //   * false - use default
                        //   * true - force use default, e.g. set background for Android icons
                        //   * color - set background for the specified icons
                        //
                        android: true, // Create Android homescreen icon. `boolean` or `{ offset, background }` or an array of sources
                        appleIcon: true, // Create Apple touch icons. `boolean` or `{ offset, background }` or an array of sources
                        appleStartup: true, // Create Apple startup images. `boolean` or `{ offset, background }` or an array of sources
                        favicons: true, // Create regular favicons. `boolean` or `{ offset, background }` or an array of sources
                        windows: false, // Create Windows 8 tile icons. `boolean` or `{ offset, background }` or an array of sources
                        yandex: false, // Create Yandex browser icon. `boolean` or `{ offset, background }` or an array of sources
                    },
                    // shortcuts: [
                    //     // Your applications's Shortcuts (see: https://developer.mozilla.org/docs/Web/Manifest/shortcuts)
                    //     // Array of shortcut objects:
                    //     {
                    //         name: 'View your Inbox', // The name of the shortcut. `string`
                    //         short_name: 'inbox', // optionally, falls back to name. `string`
                    //         description: 'View your inbox messages', // optionally, not used in any implemention yet. `string`
                    //         url: '/inbox', // The URL this shortcut should lead to. `string`
                    //         icon: 'test/inbox_shortcut.png', // source image(s) for that shortcut. `string`, `buffer` or array of `string`
                    //     },
                    // ],
                    // // more shortcuts objects
                });

                // console.log(response.images); // Array of { name: string, contents: <buffer> }
                // console.log(response.files); // Array of { name: string, contents: <string> }
                // console.log(response.html); // Array of strings (html elements)

                console.log({ response });

                const entries = [
                    ...response.images,
                    ...response.files,
                    ...[{ name: 'content.html', contents: response.html.join('') }],
                ];

                const fullPath = path.resolve(path.resolve(process.cwd(), `public/${relativePath}`));

                entries.forEach((entry) => {
                    fs.writeFileSync(`${fullPath}/${entry.name}`, entry.contents);
                });
            } catch (error) {
                console.log(error.message);
            }
        },
    };
}

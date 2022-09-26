<?php

declare(strict_types=1);

namespace App\Console\Commands\Generate;

use Illuminate\Support\Str;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Spatie\ImageOptimizer\OptimizerChain;
use Symfony\Component\Finder\SplFileInfo;
use Spatie\ImageOptimizer\Optimizers\Svgo;

class GenerateIconsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'generate:icons';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generates an SVG sprite + a VueJS icon component.';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $this->setupDestPath();

        $files = collect(File::files($this->srcPath()));

        $sprite = $files
            ->filter(function (SplFileInfo $file): bool {
                return $this->isSVGFile($file);
            })
            ->map(function (SplFileInfo $file): array {
                $this->optimizeSVG($file->getRealPath());

                $name    = $this->generateName($file->getFilename());
                $content = $file->getContents();
                $content = $this->convertToSymbol($name, $content);
                $defs    = $this->extractDefs($content);

                return compact('content', 'defs');
            });

        file_put_contents(
            $this->destPath(),
            $this->wrap(
                $sprite->pluck('content')->join(''),
                $sprite->pluck('defs')->join('')
            )
        );

        $this->generateComponents();

        $this->info('Icon sprite successfully generated.');
    }

    /**
     * The source folder where the generated icons will be stored.
     */
    private function srcPath(): string
    {
        return storage_path('/app/assets/svg/sprite');
    }

    /**
     * The destination folder where the generated icons will be stored.
     */
    private function destPath(): string
    {
        return public_path('/svg/icons.svg');
    }

    /**
     * Prepare the destination folder.
     */
    private function setupDestPath(): void
    {
        $dir = dirname($this->destPath());

        if (File::isDirectory($dir)) {
            return;
        }

        File::makeDirectory($dir);
        // File::put("{$dir}/.gitignore", '*');
    }

    /**
     * Standardize the icon name.
     */
    private function generateName(string $name): string
    {
        return Str::slug(pathinfo($name, PATHINFO_FILENAME));
    }

    /**
     * Generate the components (VueJS & BladeX).
     */
    private function generateComponents(): void
    {
        $src = dirname($this->srcPath()) . '/stubs/icon';

        // $vueJS  = [
        //     'src'  => "{$src}.vue",
        //     'dest' => resource_path('/js/blocks/components/icon.vue'),
        // ];
        $blade = [
            'src'  => "{$src}.blade.php",
            'dest' => resource_path('/views/components/icon.blade.php'),
        ];

        foreach ([/* $vueJS,  */$blade] as $component) {
            copy($component['src'], $component['dest']);
        }
    }

    private function isSVGFile(SplFileInfo $file): bool
    {
        if (strtolower($file->getExtension()) !== 'svg') {
            return false;
        }

        return in_array(mime_content_type($file->getRealPath()), [
            'text/html',
            'image/svg',
            'image/svg+xml',
            'text/plain',
        ]);
    }

    private function optimizeSVG(string $pathToImage): void
    {
        // OptimizerChainFactory::create()->optimize($pathToImage);

        (new OptimizerChain())->addOptimizer(new Svgo([
            '--disable=cleanupIDs,removeViewBox',
            '--enable=removeDimensions',
        ]))->optimize($pathToImage);
    }

    private function extractDefs(string $content): string
    {
        preg_match('/<defs>(.+)<\/defs>/', $content, $matches);

        return $matches && isset($matches[1]) ? $matches[1] : '';
    }

    private function convertToSymbol(string $name, string $content): string
    {
        $content = str_replace('<svg', "<symbol id=\"i-{$name}\"", $content);
        $content = str_replace('</svg>', '</symbol>', $content);
        $content = str_replace('feather ', '', $content);
        $content = str_replace('feather-', 'icon-', $content);
        $content = str_replace('/<defs>(.+)<\/defs>/', '', $content);

        return $content;
    }

    private function wrap(string $content, string $defs): string
    {
        return '<?xml version="1.0" encoding="UTF-8"?>'
            . '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">'
            . (!empty($defs) ? "<defs>{$defs}</defs>" : '')
            . $content
            . '</svg>';
    }
}

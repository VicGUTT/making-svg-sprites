<svg {{ $attributes->merge(['class' => 'icon']) }} xmlns="http://www.w3.org/2000/svg">
    @isset ($title)
        <title>{{ $title }}</title>
    @endisset
    @isset ($desc)
        <desc>{{ $desc }}</desc>
    @endisset
    <use href="#i-{{ $name }}" xlink:href="#i-{{ $name }}"></use>
</svg>
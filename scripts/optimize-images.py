"""
Gera as imagens otimizadas usadas pelo site a partir dos ORIGINAIS.

  npm run images        (equivale a: python -I scripts/optimize-images.py)

Originais: src/assets/originais/<tipo>/   (brands, desktop, profile, projetos, tech,
           wallpaper; referencias/ guarda modelos visuais). NÃO entram no build.
Saídas:    src/assets/wallpaper/, brands/, desktop/, profile/, tech/, projetos/ e public/ (favicons)

Para trocar uma imagem: substitua o arquivo em originais/ (mesmo nome) e rode
o comando. Para um ícone novo da área de trabalho, acrescente uma linha em ICONS
e importe a saída em src/data/portfolio.ts. Requer Python 3 + Pillow.
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent / "src" / "assets"
SRC = ROOT / "originais"
PUBLIC = ROOT.parent.parent / "public"

# Foto de perfil e recorte (esquerda, topo, direita, base). None = imagem inteira,
# centralizada num quadrado. A foto anterior (minha_foto.jpg, extraída de
# minha_foto.CR2) usava o recorte (1320, 308, 3300, 2288).
PHOTO = "foto.png"
# Enquadra você e o alienígena (a foto tem 1371×1148). As anteriores continuam na pasta.
PHOTO_CROP = (60, 0, 1208, 1148)

# Logos dos projetos (originais/projetos/logos/) → projetos/logos/, 2× de 64 px.
# Projeto sem logo próprio usa o template gerado aqui (projetos/logos/template.png).
PROJECT_LOGOS = ("aquanauta", "sistrafa", "diara", "foldaero")

# Ícones da área de trabalho: original → saída 96×96 (2× de 48 px).
ICONS = {
    "desktop/lixeira.png": "desktop/lixeira.png",
    "desktop/mycomputer.png": "desktop/computador.png",
    "desktop/arquivos.png": "desktop/arquivos.png",
    "desktop/msn.png": "desktop/msn.png",
    "desktop/thesims.png": "desktop/thesims.png",
    "desktop/cs16.png": "desktop/cs16.png",
    "desktop/minecraft.png": "desktop/minecraft.png",
}


# Ícones de tecnologias enviados em imagem (os demais vêm de `npm run tech-icons`).
TECH = {
    "tech/chatgpt.png": "tech/chatgpt.png",
    "tech/openai.png": "tech/openai.png",
    "tech/localstorage.png": "tech/localstorage.png",
}

# Logos dos canais de Contato (originais/contato/). Gmail e Hotmail vêm com o nome
# escrito; o recorte (esquerda, topo, direita, base) isola só o símbolo.
CONTACT = {
    "github_logo.png": ("contato/github.png", None),
    "gmail_logo.png": ("contato/gmail.png", (1240, 440, 2070, 1070)),
    "hotmail_logo.png": ("contato/hotmail.png", (80, 640, 1300, 1530)),
    "instagram_logo.png": ("contato/instagram.png", None),
}

# Capturas dos projetos (originais/projetos/): galeria da janela Detalhes.
GALLERY = {
    "aquanauta_print1.png": "projetos/aquanauta-1.webp",
    "aquanauta_print2.png": "projetos/aquanauta-2.webp",
    "aquanauta_print3.png": "projetos/aquanauta-3.webp",
    "flor_digital_print1.png": "projetos/flor-digital-1.webp",
    "flor_digital_print2.png": "projetos/flor-digital-2.webp",
    "sistrafa_inicio.png": "projetos/sistrafa-1.webp",
    "sistrafa_pergunta.png": "projetos/sistrafa-2.webp",
    "sistrafa_checklist.png": "projetos/sistrafa-3.webp",
    "sistrafa_especie.png": "projetos/sistrafa-4.webp",
    "sistrafa_revisao.png": "projetos/sistrafa-5.webp",
}
THUMB = (800, 450)  # miniatura do card, 16:9 (2× de ~400 px)

def square(image: Image.Image) -> Image.Image:
    """Corta a margem transparente e centraliza num quadrado (tamanhos visuais iguais)."""
    image = image.convert("RGBA")
    box = image.getbbox()
    if box:
        image = image.crop(box)
    side = max(image.size)
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(image, ((side - image.width) // 2, (side - image.height) // 2))
    return canvas


def cover(image: Image.Image, size: tuple[int, int], x_anchor: float = 0.5) -> Image.Image:
    """Recorte que preenche `size` (sem distorcer); `x_anchor` 0 = esquerda, 1 = direita."""
    image = image.convert("RGB")
    scale = max(size[0] / image.width, size[1] / image.height)
    resized = image.resize((round(image.width * scale), round(image.height * scale)), Image.LANCZOS)
    left = round((resized.width - size[0]) * x_anchor)
    top = (resized.height - size[1]) // 2
    return resized.crop((left, top, left + size[0], top + size[1]))


def showcase(shots: list[Image.Image]) -> Image.Image:
    """Miniatura 16:9 com capturas de formatos variados sobre fundo azul-petróleo."""
    w, h = 1600, 900
    base = Image.new("RGB", (w, h), "#06202b")
    glow = Image.new("L", (w, h), 0)
    ImageDraw.Draw(glow).ellipse((-200, -300, 1400, 900), fill=255)
    glow = glow.filter(ImageFilter.GaussianBlur(220))
    base.paste(Image.new("RGB", (w, h), "#11607a"), (0, 0), glow)

    def place(img: Image.Image, box: tuple[int, int, int, int]) -> None:
        x0, y0, x1, y1 = box
        img = img.convert("RGBA")
        scale = min((x1 - x0) / img.width, (y1 - y0) / img.height)
        img = img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)
        x = x0 + (x1 - x0 - img.width) // 2
        y = y0 + (y1 - y0 - img.height) // 2
        shadow = Image.new("L", (img.width + 80, img.height + 80), 0)
        ImageDraw.Draw(shadow).rectangle((40, 48, img.width + 40, img.height + 48), fill=170)
        shadow = shadow.filter(ImageFilter.GaussianBlur(18))
        base.paste(Image.new("RGB", shadow.size, "#000"), (x - 40, y - 40), shadow)
        base.paste(img, (x, y), img)

    place(shots[0], (60, 40, 600, 860))
    place(shots[1], (650, 40, 1540, 560))
    place(shots[2], (650, 600, 1540, 860))
    return base

def phones(shots: list[Image.Image], background: str = "#0b2a1c", glow: str = "#1f6b45") -> Image.Image:
    """Miniatura 16:9 com telas de celular lado a lado, sobre fundo com brilho."""
    w, h = 1600, 900
    base = Image.new("RGB", (w, h), background)
    light = Image.new("L", (w, h), 0)
    ImageDraw.Draw(light).ellipse((200, -250, 1400, 750), fill=255)
    base.paste(Image.new("RGB", (w, h), glow), (0, 0), light.filter(ImageFilter.GaussianBlur(200)))
    gap = 36
    # Altura que cabe na largura (margem de 70 px de cada lado), no máximo 800.
    height = min(800, round((w - 140 - gap * (len(shots) - 1)) / sum(s.width / s.height for s in shots)))
    imgs = [s.convert("RGB").resize((round(s.width * height / s.height), height), Image.LANCZOS) for s in shots]
    total = sum(i.width for i in imgs) + gap * (len(imgs) - 1)
    x = (w - total) // 2
    y = (h - height) // 2
    for img in imgs:
        shadow = Image.new("L", (img.width + 80, img.height + 80), 0)
        ImageDraw.Draw(shadow).rounded_rectangle((40, 50, img.width + 40, img.height + 50), 24, fill=180)
        base.paste(Image.new("RGB", shadow.size, "#000"), (x - 40, y - 40), shadow.filter(ImageFilter.GaussianBlur(18)))
        mask = Image.new("L", img.size, 0)
        ImageDraw.Draw(mask).rounded_rectangle((0, 0, img.width - 1, img.height - 1), 22, fill=255)
        base.paste(img, (x, y), mask)
        x += img.width + gap
    return base

def logo_template() -> Image.Image:
    """Logo provisório (128 px): flor branca num ladrilho de vidro azul-esverdeado."""
    size, scale = 128, 4
    big = size * scale
    img = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    mask = Image.new("L", (big, big), 0)
    ImageDraw.Draw(mask).rounded_rectangle((8, 8, big - 8, big - 8), 96, fill=255)
    tile = Image.new("RGBA", (big, big))
    draw = ImageDraw.Draw(tile)
    top, bottom = (120, 214, 236), (18, 112, 150)
    for y in range(big):
        k = y / big
        draw.line([(0, y), (big, y)], fill=tuple(round(a + (b - a) * k) for a, b in zip(top, bottom)) + (255,))
    img.paste(tile, (0, 0), mask)
    draw = ImageDraw.Draw(img)
    gloss = Image.new("L", (big, big), 0)
    ImageDraw.Draw(gloss).ellipse((40, -170, big - 40, big // 2), fill=90)
    img.paste(Image.new("RGBA", (big, big), (255, 255, 255, 255)), (0, 0), Image.composite(gloss, Image.new("L", (big, big), 0), mask))
    cx, cy, r = big // 2, big // 2 + 10, 64
    import math
    for i in range(5):
        a = math.radians(i * 72 - 90)
        px, py = cx + math.cos(a) * r, cy + math.sin(a) * r
        draw.ellipse((px - 58, py - 58, px + 58, py + 58), fill=(255, 255, 255, 235))
    draw.ellipse((cx - 38, cy - 38, cx + 38, cy + 38), fill=(255, 200, 70, 255))
    draw.rounded_rectangle((8, 8, big - 8, big - 8), 96, outline=(10, 70, 100, 200), width=6)
    return img.resize((size, size), Image.LANCZOS)

def save(image: Image.Image, relative: str, **options) -> None:
    out = ROOT / relative
    out.parent.mkdir(parents=True, exist_ok=True)
    image.save(out, **options)
    print(f"{relative:34} {out.stat().st_size // 1024:>4} KB")


def main() -> None:
    # Papel de parede: WebP 1920 (desktop) e 1280 (celular).
    wallpaper = Image.open(SRC / "wallpaper" / "wallpaper_xp.png").convert("RGB")
    save(wallpaper.resize((1920, round(1920 * wallpaper.height / wallpaper.width)), Image.LANCZOS),
         "wallpaper/wallpaper-1920.webp", format="WEBP", quality=80, method=6)
    save(wallpaper.resize((1280, round(1280 * wallpaper.height / wallpaper.width)), Image.LANCZOS),
         "wallpaper/wallpaper-1280.webp", format="WEBP", quality=78, method=6)

    # Logo do site (barra de título, menu, barra de tarefas) e favicons.
    logo = square(Image.open(SRC / "brands" / "AFL_logo.png"))
    save(logo.resize((128, 128), Image.LANCZOS), "brands/logo.png", optimize=True)
    PUBLIC.mkdir(exist_ok=True)
    # Favicons: PNG, ícone do iPhone e ícones do manifesto (Android / "Adicionar à tela inicial").
    for size, name in ((64, "favicon.png"), (180, "apple-touch-icon.png"), (192, "icon-192.png"), (512, "icon-512.png")):
        out = PUBLIC / name
        icon = logo.resize((size, size), Image.LANCZOS)
        if size >= 180:  # 256 cores: ícones grandes ficam ~5× menores, sem diferença visível
            icon = icon.quantize(256, method=Image.Quantize.FASTOCTREE)
        icon.save(out, optimize=True)
        print(f"public/{name:27} {out.stat().st_size // 1024:>4} KB")
    # favicon.ico com 16, 32 e 48 px (navegadores e ferramentas que só procuram /favicon.ico).
    ico = PUBLIC / "favicon.ico"
    logo.resize((48, 48), Image.LANCZOS).save(ico, sizes=[(16, 16), (32, 32), (48, 48)])
    print(f"public/{'favicon.ico':27} {ico.stat().st_size // 1024:>4} KB")

    # Foto de perfil (moldura do Início): quadrado, 2× de 120 px.
    photo = Image.open(SRC / "profile" / PHOTO).convert("RGB")
    photo = photo.crop(PHOTO_CROP) if PHOTO_CROP else cover(photo, (min(photo.size), min(photo.size)))
    save(photo.resize((240, 240), Image.LANCZOS), "profile/foto.webp", format="WEBP", quality=86, method=6)

    # Botão Iniciar.
    save(square(Image.open(SRC / "brands" / "Windows_logo.png")).resize((96, 96), Image.LANCZOS),
         "brands/start-logo.png", optimize=True)

    # Spotify: logo completo (aba) e só o círculo (ícone pequeno).
    spotify = Image.open(SRC / "brands" / "Spotify_logo.png").convert("RGBA")
    full = spotify.crop(spotify.getbbox())
    full.thumbnail((240, 240), Image.LANCZOS)
    save(full, "brands/spotify-logo.png", optimize=True)
    alpha = spotify.split()[3]
    seen, gap = False, spotify.height
    for y in range(spotify.height):
        row = any(alpha.getpixel((x, y)) > 10 for x in range(0, spotify.width, 2))
        if row:
            seen = True
        elif seen:
            gap = y
            break
    save(square(spotify.crop((0, 0, spotify.width, gap))).resize((64, 64), Image.LANCZOS),
         "brands/spotify-icon.png", optimize=True)

    # Ícones da área de trabalho.
    for source, target in ICONS.items():
        save(square(Image.open(SRC / source)).resize((96, 96), Image.LANCZOS), target, optimize=True)

    # Ícones de tecnologias (ladrilho de 20 px → 64 px para telas densas).
    for source, target in TECH.items():
        save(square(Image.open(SRC / source)).resize((64, 64), Image.LANCZOS), target, optimize=True)

    # Logos de contato (36 px na tela → 72 px).
    for source, (target, crop) in CONTACT.items():
        img = Image.open(SRC / "contato" / source).convert("RGBA")
        if crop:
            img = img.crop(crop)
        save(square(img).resize((72, 72), Image.LANCZOS), target, optimize=True)

    # Logos dos projetos e o template para quem ainda não tem.
    for name in PROJECT_LOGOS:
        logo_img = square(Image.open(SRC / "projetos" / "logos" / f"{name}.png"))
        save(logo_img.resize((128, 128), Image.LANCZOS), f"projetos/logos/{name}.png", optimize=True)
    save(logo_template(), "projetos/logos/template.png", optimize=True)

    # Projetos: galeria (até 1200 px de largura) e miniaturas 16:9 dos cards.
    shots = {name: Image.open(SRC / "projetos" / name) for name in GALLERY}
    for source, target in GALLERY.items():
        img = shots[source].convert("RGB")
        if img.width > 1200:
            img = img.resize((1200, round(1200 * img.height / img.width)), Image.LANCZOS)
        save(img, target, format="WEBP", quality=84, method=6)
    aquanauta = [shots[f"aquanauta_print{i}.png"] for i in (1, 2, 3)]
    save(showcase(aquanauta).resize(THUMB, Image.LANCZOS), "projetos/aquanauta-thumb.webp", format="WEBP", quality=84, method=6)
    save(cover(shots["flor_digital_print1.png"], THUMB, x_anchor=0.3), "projetos/flor-digital-thumb.webp", format="WEBP", quality=84, method=6)
    sistrafa = [shots[f"sistrafa_{n}.png"] for n in ("inicio", "pergunta", "checklist", "especie")]
    save(phones(sistrafa).resize(THUMB, Image.LANCZOS), "projetos/sistrafa-thumb.webp", format="WEBP", quality=84, method=6)


if __name__ == "__main__":
    main()

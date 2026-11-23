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

Image.MAX_IMAGE_PIXELS = None  # a foto de perfil tem ~60 megapixels

ROOT = Path(__file__).resolve().parent.parent / "src" / "assets"
SRC = ROOT / "originais"
PUBLIC = ROOT.parent.parent / "public"

# Foto de perfil e recorte (esquerda, topo, direita, base). None = imagem inteira,
# centralizada num quadrado. A foto anterior (minha_foto.jpg, extraída de
# minha_foto.CR2) usava o recorte (1320, 308, 3300, 2288).
PHOTO = "foto_tela_inicial.jpg"
# Quadrado centrado no rosto (a foto tem 1007×1049). As outras continuam na pasta:
# foto.png (o alienígena) usava o recorte (60, 0, 1208, 1148); nova_foto_perfil.jpg
# (corpo inteiro, 7794×7794; foi testada e descartada) usava (2500, 200, 5100, 2800).
PHOTO_CROP = (70, 110, 980, 1020)
# Foto da apresentação do TCC (destaque no Início).
TCC_PHOTO = "foto_tcc.jpg"

# Logos dos projetos (originais/projetos/logos/) → projetos/logos/, 2× de 64 px.
# Projeto sem logo próprio usa o template gerado aqui (projetos/logos/template.png).
PROJECT_LOGOS = ("aquanauta", "sistrafa", "diara", "foldaero")
# Logos cujo original tem fundo branco (recortado para ficar transparente).
LOGO_CUT_WHITE = ("aquanauta",)

# Ícones da área de trabalho: original → saída 96×96 (2× de 48 px).
ICONS = {
    "desktop/lixeira.png": "desktop/lixeira.png",
    "desktop/mycomputer.png": "desktop/computador.png",
    "desktop/arquivos.png": "desktop/arquivos.png",
    "desktop/msn.png": "desktop/msn.png",
    "desktop/thesims.png": "desktop/thesims.png",
    "desktop/cs16.png": "desktop/cs16.png",
    "desktop/minecraft.png": "desktop/minecraft.png",
    "desktop/media_player.png": "desktop/media-player.png",
    "desktop/bonzi.webp": "desktop/bonzi.png",
    "desktop/clippy.png": "desktop/clippy.png",
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
    "facebook_logo.png": ("contato/facebook.png", (922, 83, 2905, 2068)),
}
# WhatsApp: o original é vetor (originais/contato/whatsapp_logo.svg), copiado
# como está para contato/whatsapp.svg (não passa pelo Pillow).

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

def cut_out_white(image: Image.Image, tolerance: int = 32, min_hole: int = 5000) -> Image.Image:
    """Fundo branco → transparente: apaga o branco ligado às bordas e os buracos
    brancos grandes fechados pela figura (ex.: entre as pernas). Brancos pequenos
    de dentro (olhos, reflexos) ficam. Depois suaviza o contorno."""
    from collections import deque

    from PIL import ImageFilter

    rgba = image.convert("RGBA")
    w, h = rgba.size
    px = rgba.load()
    limit = 255 - tolerance

    def whiteish(x: int, y: int) -> bool:
        r, g, b, _ = px[x, y]
        return r >= limit and g >= limit and b >= limit

    mask = Image.new("L", (w, h), 255)
    m = mask.load()
    seen = bytearray(w * h)
    for sy in range(h):
        for sx in range(w):
            if seen[sy * w + sx]:
                continue
            seen[sy * w + sx] = 1
            if not whiteish(sx, sy):
                continue
            # Uma região branca contínua: vai para o fundo se tocar a borda ou for grande.
            region = [(sx, sy)]
            queue = deque(region)
            border = False
            while queue:
                x, y = queue.popleft()
                border = border or x in (0, w - 1) or y in (0, h - 1)
                for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                    if 0 <= nx < w and 0 <= ny < h and not seen[ny * w + nx]:
                        seen[ny * w + nx] = 1
                        if whiteish(nx, ny):
                            queue.append((nx, ny))
                            region.append((nx, ny))
            if border or len(region) >= min_hole:
                for x, y in region:
                    m[x, y] = 0
    # Contorno: encolhe 1 px (tira o halo branco) e desfoca de leve.
    mask = mask.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.2))
    rgba.putalpha(mask)
    return rgba.crop(mask.point(lambda v: 255 if v > 8 else 0).getbbox())


def key_out_teal(frame: Image.Image) -> Image.Image:
    """Fundo azul-esverdeado (o do GIF do Clippy) → transparente, com borda suave.
    O "quanto é fundo" vem de quanto verde e azul passam do vermelho (o Clippy é
    prata, o papel é creme e os olhos são preto e branco: nenhum é esverdeado).
    Nas bordas, tira a cor do fundo que vazou (sem halo azul)."""
    bg = (60, 140, 164)
    rgba = frame.convert("RGBA")
    px = rgba.load()
    w, h = rgba.size
    for y in range(h):
        for x in range(w):
            r, g, b, _ = px[x, y]
            teal = min(g - r, b - r)
            a = 1.0 if teal <= 22 else 0.0 if teal >= 62 else 1 - (teal - 22) / 40
            if a <= 0:
                px[x, y] = (0, 0, 0, 0)
                continue
            if a < 1:
                r, g, b = (max(0, min(255, round((c - (1 - a) * k) / a))) for c, k in zip((r, g, b), bg))
            px[x, y] = (r, g, b, round(a * 255))
    return rgba


def key_out_nudge(frame: Image.Image) -> Image.Image:
    """Quadro do "toc toc" (GIF do MSN) → mão sem fundo. Tira a moldura de 1 px e
    as barras pretas laterais do GIF e o fundo lilás (azul ~100 acima do vermelho
    e do verde; a mão fica abaixo de ~60), com borda suave e sem halo."""
    bg = (154, 149, 253)
    rgba = frame.convert("RGBA")
    px = rgba.load()
    w, h = rgba.size
    for y in range(h):
        for x in range(w):
            r, g, b, _ = px[x, y]
            if x < 146 or x > w - 147 or y < 3 or y > h - 4 or (r < 40 and g < 40 and b < 40):
                px[x, y] = (0, 0, 0, 0)
                continue
            blue = b - max(r, g)
            a = 1.0 if blue <= 62 else 0.0 if blue >= 88 else 1 - (blue - 62) / 26
            if a <= 0:
                px[x, y] = (0, 0, 0, 0)
                continue
            if a < 1:
                r, g, b = (max(0, min(255, round((c - (1 - a) * k) / a))) for c, k in zip((r, g, b), bg))
            px[x, y] = (r, g, b, round(a * 255))
    return rgba


def messenger() -> None:
    """Janela do MSN (ícone da área de trabalho): a imagem aparada e o "toc toc".

    A mão parada da imagem é coberta pela mão do GIF, esticada para o mesmo
    tamanho; ao clicar, os quadros da batida tocam por cima (folha de quadros,
    controlada pelo site). Gera também msn-toc.json com a posição da mão (em %
    da imagem), a sequência e os tempos dos quadros e os momentos das batidas."""
    import json

    png = Image.open(SRC / "desktop/msn_conteudo.png").convert("RGBA")
    trim = png.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
    content = png.crop(trim)
    save(content, "desktop/msn-conteudo.webp", format="WEBP", quality=88, method=6)
    tw, th = content.size

    # Quadros 10 a 31: mão parada (10) → três batidas (14, 20, 26) → de volta.
    gif = Image.open(SRC / "desktop/toc_toc.gif")
    first, last, impacts = 10, 31, (14, 20, 26)
    frames, durations, starts, clock = [], [], {}, 0
    for index in range(gif.n_frames):
        gif.seek(index)
        starts[index] = clock
        duration = gif.info.get("duration", 30)
        if first <= index <= last:
            frames.append(key_out_nudge(gif))
            durations.append(duration)
        clock += duration
    union = (146, 22, 814, 521)  # caixa que contém a mão em todos esses quadros
    idle = (228, 25, 692, 512)  # mão parada (quadro 10) dentro do GIF
    target = (571, 354, 909, 652)  # mão parada na imagem do MSN
    sx = (target[2] - target[0]) / (idle[2] - idle[0])
    sy = (target[3] - target[1]) / (idle[3] - idle[1])
    grow = 1.04  # um pouco maior: cobre a borda da mão da imagem
    cx, cy = (target[0] + target[2]) / 2, (target[1] + target[3]) / 2
    left = target[0] - (idle[0] - union[0]) * sx
    top = target[1] - (idle[1] - union[1]) * sy
    width, height = (union[2] - union[0]) * sx, (union[3] - union[1]) * sy
    left, top = cx + (left - cx) * grow, cy + (top - cy) * grow
    width, height = width * grow, height * grow

    # Quadros únicos (os repetidos viram o mesmo índice) numa folha em grade.
    fw, fh = round(width * 0.8), round(height * 0.8)  # folha mais leve; nítida no tamanho exibido
    unique, sequence = [], []
    for frame in frames:
        cropped = frame.crop(union).resize((fw, fh), Image.LANCZOS)
        data = cropped.tobytes()
        match = next((i for i, u in enumerate(unique) if u.tobytes() == data), None)
        if match is None:
            unique.append(cropped)
            match = len(unique) - 1
        sequence.append(match)
    columns = 6
    rows = -(-len(unique) // columns)
    sheet = Image.new("RGBA", (fw * columns, fh * rows), (0, 0, 0, 0))
    for i, frame in enumerate(unique):
        sheet.paste(frame, ((i % columns) * fw, (i // columns) * fh))
    save(sheet, "desktop/msn-toc.webp", format="WEBP", quality=86, method=6)

    pct = lambda value, total: round(value / total * 100, 3)  # noqa: E731
    meta = {
        "frameWidth": fw,
        "frameHeight": fh,
        "columns": columns,
        "rows": rows,
        "sequence": sequence,
        "durations": durations,
        "impacts": [starts[i] - starts[first] for i in impacts],
        "hand": {
            "left": pct(left - trim[0], tw),
            "top": pct(top - trim[1], th),
            "width": pct(width, tw),
            "height": pct(height, th),
        },
        # Botão "Send a nudge" da imagem (também chama a atenção).
        "nudgeButton": {
            "left": pct(1054 - trim[0], tw),
            "top": pct(148 - trim[1], th),
            "width": pct(84, tw),
            "height": pct(64, th),
        },
    }
    out = ROOT / "desktop/msn-toc.json"
    out.write_text(json.dumps(meta, indent=2) + chr(10), encoding="utf-8")
    print(f"{'desktop/msn-toc.json':34} {len(unique)} quadros únicos de {len(sequence)}")


def media_player_skin() -> None:
    """Skin do Windows Media Player (ícone da área de trabalho): o preto de fora
    e a tela da cabeça viram transparentes. O vídeo fica atrás da skin, e a
    moldura verde o recorta no formato exato da tela."""
    from collections import deque

    from PIL import ImageFilter

    skin = Image.open(SRC / "desktop/win_media_player.png").convert("RGBA")
    w, h = skin.size
    px = skin.load()
    mask = Image.new("L", (w, h), 255)
    m = mask.load()

    def dark(x: int, y: int) -> bool:
        return max(px[x, y][:3]) <= 34

    seeds = [(x, y) for x in range(w) for y in (0, h - 1)] + [(x, y) for y in range(h) for x in (0, w - 1)]
    seeds.append((200, 150))  # centro da tela
    queue = deque(seeds)
    while queue:
        x, y = queue.popleft()
        if not (0 <= x < w and 0 <= y < h) or m[x, y] == 0 or not dark(x, y):
            continue
        m[x, y] = 0
        queue.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
    skin.putalpha(mask.filter(ImageFilter.GaussianBlur(0.6)))
    save(skin, "desktop/media-player-skin.webp", format="WEBP", quality=92, method=6)


def club_penguin() -> None:
    """Pinguim do Club Penguin (aba Spotify, abaixo do "Meu perfil", só no
    computador): GIF transparente → WebP animado, 2× de ~235 px de largura."""
    gif = Image.open(SRC / "spotify" / "gif_clubpenguin.gif")
    width = 470
    height = round(gif.height * width / gif.width)
    frames, durations = [], []
    for index in range(gif.n_frames):
        gif.seek(index)
        frames.append(gif.convert("RGBA").resize((width, height), Image.LANCZOS))
        durations.append(gif.info.get("duration", 80))
    target = ROOT / "spotify/club-penguin.webp"
    target.parent.mkdir(parents=True, exist_ok=True)
    frames[0].save(target, format="WEBP", save_all=True, append_images=frames[1:], duration=durations,
                   loop=0, quality=85, method=6, lossless=False, allow_mixed=True)
    print(f"{'spotify/club-penguin.webp':<35}{target.stat().st_size // 1024:>4} KB")


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
    # Papel de parede do tema escuro (mesmos tamanhos).
    dark = Image.open(SRC / "wallpaper" / "dark_wallpaper.jpg").convert("RGB")
    save(dark.resize((1920, round(1920 * dark.height / dark.width)), Image.LANCZOS),
         "wallpaper/wallpaper-dark-1920.webp", format="WEBP", quality=80, method=6)
    save(dark.resize((1280, round(1280 * dark.height / dark.width)), Image.LANCZOS),
         "wallpaper/wallpaper-dark-1280.webp", format="WEBP", quality=78, method=6)

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
    tcc = Image.open(SRC / "profile" / TCC_PHOTO).convert("RGB")
    save(tcc.resize((560, round(560 * tcc.height / tcc.width)), Image.LANCZOS), "profile/foto-tcc.webp",
         format="WEBP", quality=84, method=6)
    # Fundo do cartão "Meu perfil" (aba Spotify): tamanho original (630 px), WebP.
    spotify_bg = Image.open(SRC / "profile" / "fundo_meuperfil_spotify.png").convert("RGB")
    save(spotify_bg, "spotify/fundo-meuperfil.webp", format="WEBP", quality=82, method=6)
    club_penguin()
    # Fundo do cartão Formação (Sobre): prédio da UNICENTRO, tamanho original, WebP.
    unicentro = Image.open(SRC / "profile" / "unicentro_fundo.jpeg").convert("RGB")
    save(unicentro, "profile/fundo-unicentro.webp", format="WEBP", quality=80, method=6)
    # Fundo do destaque do TCC no Início: o GIF de água vira vídeo (video/fundo-tcc.mp4,
    # feito com ffmpeg, veja docs/GUIA.md); aqui sai só o 1º quadro, usado enquanto o
    # vídeo carrega e para quem pede menos animação.
    tcc_bg = Image.open(SRC / "profile" / "fundo_telainicial_aquanauta.gif")
    tcc_bg.seek(0)
    save(tcc_bg.convert("RGB"), "profile/fundo-tcc.webp", format="WEBP", quality=78, method=6)

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
    # Ícone "Portfólio" (abre a janela): aparece maior (64 px), então sai com 192 px.
    # Conteúdo da Lixeira (janela ao clicar no ícone): até 480 px de altura (2× de 240).
    trash = Image.open(SRC / "desktop/lixeira_conteudo.png").convert("RGBA")
    if trash.height > 480:
        trash = trash.resize((round(trash.width * 480 / trash.height), 480), Image.LANCZOS)
    save(trash, "desktop/lixeira-conteudo.webp", format="WEBP", quality=90, method=6)
    # Bonzi surfando (anda pela tela ao clicar no ícone): fundo branco recortado,
    # 2× de 140 px de altura.
    surfer = cut_out_white(Image.open(SRC / "desktop/bonzi_conteudo.png"))
    surfer = surfer.resize((round(surfer.width * 280 / surfer.height), 280), Image.LANCZOS)
    save(surfer, "desktop/bonzi-surf.webp", format="WEBP", quality=88, method=6)
    # Clippy (assistente que aparece ao clicar no ícone): GIF animado sem o fundo,
    # salvo como WebP animado com transparência (mesmos quadros e tempos).
    gif = Image.open(SRC / "desktop/clippy_win_gif.gif")
    frames, durations = [], []
    for index in range(gif.n_frames):
        gif.seek(index)
        frames.append(key_out_teal(gif))
        durations.append(gif.info.get("duration", 100))
    target = ROOT / "desktop/clippy-assistente.webp"
    frames[0].save(target, format="WEBP", save_all=True, append_images=frames[1:], duration=durations,
                   loop=0, quality=85, method=6, lossless=False, allow_mixed=True)
    print(f"{'desktop/clippy-assistente.webp':<35}{target.stat().st_size // 1024:>4} KB")
    messenger()
    media_player_skin()
    save(square(Image.open(SRC / "desktop/portfolio.png")).resize((192, 192), Image.LANCZOS),
         "desktop/portfolio.png", optimize=True)

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
        logo_img = Image.open(SRC / "projetos" / "logos" / f"{name}.png")
        if name in LOGO_CUT_WHITE:  # original com fundo branco: vira transparente
            logo_img = cut_out_white(logo_img)
        logo_img = square(logo_img)
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

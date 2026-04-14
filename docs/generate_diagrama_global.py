from PIL import Image, ImageDraw, ImageFont


def box(draw, x, y, w, h, text, font):
    draw.rectangle((x, y, x + w, y + h), outline="black", width=3)
    tw = draw.textlength(text, font=font)
    draw.text((x + (w - tw) / 2, y + h / 2 - 8), text, fill="black", font=font)


def arrow_head(draw, x1, y1, x2, y2):
    dx = x2 - x1
    dy = y2 - y1
    if abs(dx) >= abs(dy):
        if dx >= 0:
            pts = [(x2, y2), (x2 - 12, y2 - 6), (x2 - 12, y2 + 6)]
        else:
            pts = [(x2, y2), (x2 + 12, y2 - 6), (x2 + 12, y2 + 6)]
    else:
        if dy >= 0:
            pts = [(x2, y2), (x2 - 6, y2 - 12), (x2 + 6, y2 - 12)]
        else:
            pts = [(x2, y2), (x2 - 6, y2 + 12), (x2 + 6, y2 + 12)]
    draw.polygon(pts, fill="black")


def arrow(draw, x1, y1, x2, y2):
    draw.line((x1, y1, x2, y2), fill="black", width=3)
    arrow_head(draw, x1, y1, x2, y2)


def routed_arrow(draw, points):
    for i in range(len(points) - 1):
        p1 = points[i]
        p2 = points[i + 1]
        draw.line((p1[0], p1[1], p2[0], p2[1]), fill="black", width=3)
    p1 = points[-2]
    p2 = points[-1]
    arrow_head(draw, p1[0], p1[1], p2[0], p2[1])


img = Image.new("RGB", (1900, 1150), "white")
draw = ImageDraw.Draw(img)
title_font = ImageFont.load_default()
font = ImageFont.load_default()
label_font = ImageFont.load_default()

draw.text((770, 25), "Arquitectura Global", fill="black", font=title_font)

# Boxes
box(draw, 90, 170, 250, 90, "Usuario", font)
box(draw, 410, 170, 270, 90, "PHP Forms", font)
box(draw, 760, 170, 290, 90, "PHP Backend", font)
box(draw, 1180, 90, 360, 90, "JavaScript UI", font)
box(draw, 1180, 260, 360, 90, "Python Runner", font)
box(draw, 1180, 430, 360, 90, "Resultado", font)
box(draw, 1180, 600, 360, 90, "IA Evaluadora", font)
box(draw, 1110, 770, 430, 100, "Decision final", font)
box(draw, 820, 990, 300, 90, "Codigo valido", font)
box(draw, 1240, 990, 380, 90, "Corregir y reenviar", font)

# Main left-to-right
arrow(draw, 340, 215, 410, 215)   # Usuario -> Forms
arrow(draw, 680, 215, 760, 215)   # Forms -> PHP

# Branches from PHP backend
routed_arrow(draw, [(1050, 205), (1120, 205), (1120, 135), (1180, 135)])   # -> JS
routed_arrow(draw, [(1050, 225), (1120, 225), (1120, 305), (1180, 305)])   # -> Python

# Vertical chain on right side
arrow(draw, 1360, 350, 1360, 430)  # Python -> Resultado
arrow(draw, 1360, 520, 1360, 600)  # Resultado -> IA
arrow(draw, 1360, 690, 1360, 770)  # IA -> Decision

# Decision outputs (labels moved outside lines)
routed_arrow(draw, [(1240, 870), (980, 870), (980, 990)])     # Aprobado
routed_arrow(draw, [(1420, 870), (1430, 870), (1430, 990)])   # Rechazado
draw.text((1010, 892), "Aprobado", fill="black", font=label_font)
draw.text((1455, 892), "Rechazado", fill="black", font=label_font)

# Loop back from rechazo to forms (outside bottom to avoid collisions)
routed_arrow(draw, [(1240, 1035), (560, 1035), (560, 260)])

img.save("docs/diagrama_global_bn.jpeg", quality=95)
print("Imagen generada: docs/diagrama_global_bn.jpeg")

STYLE_PRESETS = {
    "classic": {
        "font": "Arial Black",
        "font_size": 72,
        "primary_colour": "&H00FFFFFF",   # white text
        "highlight_colour": "&H0000FFFF", # yellow active word (karaoke \k)
        "outline_colour": "&H00000000",   # black outline
        "back_colour": "&H64000000",
        "bold": -1,
        "outline": 4,
        "shadow": 0,
        "alignment": 2,       # bottom-center
        "margin_v": 180,
    },
    "bold_pop": {
        "font": "Anton",
        "font_size": 84,
        "primary_colour": "&H00FFFFFF",
        "highlight_colour": "&H0000A5FF",  # orange highlight
        "outline_colour": "&H00000000",
        "back_colour": "&H00000000",
        "bold": -1,
        "outline": 6,
        "shadow": 2,
        "alignment": 2,
        "margin_v": 220,
    },
    "minimal_top": {
        "font": "Helvetica Neue",
        "font_size": 60,
        "primary_colour": "&H00FFFFFF",
        "highlight_colour": "&H00D7FF00",
        "outline_colour": "&H00000000",
        "back_colour": "&H00000000",
        "bold": 0,
        "outline": 2,
        "shadow": 0,
        "alignment": 8,       # top-center
        "margin_v": 100,
    },
}


def get_style(style_id: str) -> dict:
    return STYLE_PRESETS.get(style_id, STYLE_PRESETS["classic"])
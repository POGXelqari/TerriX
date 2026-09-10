import re

with open('game.js', 'r', encoding='utf-8', errors='ignore') as f:
    js = f.read()

audio_matches = re.findall(r'(\w*Audio\w*|\w*sound\w*|createOscillator|createGain|AudioContext)', js, re.IGNORECASE)
print("Audio matches:", set(audio_matches))

# Find sound effects logic
sound_funcs = re.findall(r'function\s+(\w+)\s*\([^)]*\)\s*\{[^}]*(?:Audio|sound|volume|mute)[^}]*\}', js, re.IGNORECASE)
print("Sound functions:", sound_funcs)

# Let's search for where Audio is instantiated
audio_inst = re.findall(r'new\s+Audio\([^)]*\)', js)
print("Audio instantiations:", audio_inst)

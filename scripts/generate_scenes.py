"""Build portable inline SVG scenes from Daniel's supplied portrait.

The JPEG is preserved byte-for-byte and embedded once; an SVG silhouette exposes
the original face, hair, glasses, and neck over independently movable vector poses.
Run this script from anywhere, then run the main portfolio build.
"""
from pathlib import Path
import base64
import json

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src"
SRC.mkdir(exist_ok=True)
portrait = base64.b64encode((ROOT / "assets/chibi.jpg").read_bytes()).decode("ascii")

defs = '''<svg xmlns="http://www.w3.org/2000/svg" class="scene-definitions" width="0" height="0" aria-hidden="true" focusable="false"><defs>
<clipPath id="portrait-silhouette"><path d="M461 135 C421 91 374 107 344 130 C312 153 301 179 278 196 C239 220 252 255 240 286 Q238 303 225 314 Q246 321 261 311 Q233 340 244 359 Q236 378 252 398 L268 429 Q251 457 273 504 Q296 539 333 541 C345 597 394 636 464 658 L462 686 Q479 705 518 706 L563 691 L560 656 C630 634 675 593 688 535 Q727 536 747 494 Q766 444 739 425 Q777 396 775 372 Q790 348 778 319 Q791 315 800 303 Q771 307 761 278 Q753 245 752 225 C735 181 689 175 650 137 C592 75 526 65 478 104 Z"/></clipPath>
<symbol id="daniel-head" viewBox="210 65 610 650"><image width="1024" height="1024" href="data:image/jpeg;base64,__PORTRAIT__" clip-path="url(#portrait-silhouette)"/></symbol>
<symbol id="daniel-shirt" viewBox="0 0 150 120"><path d="M49 9 Q75 22 101 9 L120 24 L144 63 L123 79 L113 63 L117 114 Q75 123 33 114 L37 63 L27 79 L6 63 L30 24 Z" fill="#302e2b" stroke="#49352f" stroke-width="3" stroke-linejoin="round"/><path d="M52 10 Q75 32 98 10" fill="none" stroke="#1f1e1c" stroke-width="4"/><path d="M39 81 L38 105 M111 81 L112 105" fill="none" stroke="#403c36" stroke-width="2"/></symbol>
<symbol id="boba-cup" viewBox="0 0 55 82"><path d="M10 18 L14 71 Q27 80 42 71 L47 18" fill="#c79a70" stroke="#655044" stroke-width="2.5"/><path d="M12 31 H45 L41 71 Q27 77 15 70 Z" fill="#e2b78e"/><ellipse cx="28" cy="18" rx="21" ry="6" fill="#fff7eb" stroke="#655044" stroke-width="2.5"/><path d="M29 48 L31 0" stroke="#7860ae" stroke-width="5"/><g fill="#493636"><circle cx="20" cy="63" r="3.5"/><circle cx="29" cy="67" r="3.5"/><circle cx="37" cy="62" r="3.5"/><circle cx="24" cy="55" r="3.5"/><circle cx="35" cy="53" r="3.5"/></g><path d="M17 37 L18 49" stroke="#f9e0bf" stroke-width="3" stroke-linecap="round"/></symbol>
<symbol id="coke-can" viewBox="0 0 34 57"><rect x="3" y="3" width="28" height="50" rx="7" fill="#302e31" stroke="#514651" stroke-width="2"/><ellipse cx="17" cy="5" rx="12" ry="3" fill="#c6c6ce"/><path d="M9 20 Q16 15 25 20 L25 38 Q16 33 9 38 Z" fill="#c44754"/><text x="17" y="26" text-anchor="middle" fill="white" font-size="8" font-weight="700">Coke</text><text x="17" y="35" text-anchor="middle" fill="white" font-size="6">ZERO</text></symbol>
<symbol id="water-bottle" viewBox="0 0 31 61"><rect x="10" y="1" width="12" height="7" rx="2" fill="#8c82b7"/><path d="M11 8 H21 V15 Q27 20 27 26 V53 Q27 58 22 58 H10 Q5 58 5 53 V26 Q5 20 11 15 Z" fill="#e9f8fa" stroke="#64778c" stroke-width="2"/><path d="M7 31 Q16 27 25 31 V53 Q25 56 21 56 H11 Q7 56 7 53 Z" fill="#9cd2e6"/><path d="M11 25 V45" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/></symbol>
<symbol id="pixel-star" viewBox="0 0 24 24"><path d="M9 0 H15 V6 H21 V9 H24 V15 H18 V18 H15 V24 H9 V18 H6 V15 H0 V9 H6 V6 H9 Z" fill="currentColor"/></symbol>
<symbol id="little-plant" viewBox="0 0 70 100"><path d="M34 63 V25" stroke="#698570" stroke-width="3"/><path d="M34 46 Q6 47 9 22 Q33 21 34 46 M35 32 Q36 6 59 8 Q62 29 35 32" fill="#98b59b" stroke="#698570" stroke-width="2"/><path d="M17 62 H53 L48 93 H22 Z" fill="#e8c1a7" stroke="#a77c67" stroke-width="2"/><path d="M15 61 H55 V69 H15 Z" fill="#f0d4c1" stroke="#a77c67" stroke-width="2"/></symbol>
</defs></svg>'''.replace("__PORTRAIT__", portrait)
(SRC / "scene-defs.html").write_text(defs, encoding="utf-8")

def head(x, y, w=150, h=166, extra=""):
    return f'<use href="#daniel-head" x="{x}" y="{y}" width="{w}" height="{h}" {extra}/>'

def shirt(x, y, w=116, h=93):
    return f'<use href="#daniel-shirt" x="{x}" y="{y}" width="{w}" height="{h}"/>'

def closed_eyes(x, y, w, h, blinking=False, extra=""):
    eye_class = ' class="eye-blink"' if blinking else ''
    return f'''<svg x="{x}" y="{y}" width="{w}" height="{h}" viewBox="210 65 610 650" {extra}><g{eye_class}><ellipse cx="420" cy="432" rx="28" ry="31" fill="#f5c8a1"/><ellipse cx="590" cy="430" rx="28" ry="31" fill="#f5c8a1"/><path d="M396 430 Q420 446 444 430 M566 428 Q590 444 614 428" fill="none" stroke="#513a30" stroke-width="6" stroke-linecap="round"/></g></svg>'''

def svg(name, state, title, description, content):
    return f'<svg xmlns="http://www.w3.org/2000/svg" class="avatar-scene" data-scene="{name}" data-state="{state}" data-running="false" viewBox="0 0 520 400" role="img" aria-labelledby="scene-{name}-title scene-{name}-desc"><title id="scene-{name}-title">{title}</title><desc id="scene-{name}-desc">{description}</desc><g aria-hidden="true">{content}</g></svg>'

skin = '#f4c39b'
ink = '#594137'

hero = '''<circle cx="271" cy="211" r="155" fill="#eae1ff"/><circle cx="273" cy="213" r="135" fill="#f1ebfc"/>
<ellipse cx="272" cy="350" rx="126" ry="13" fill="#dcd0f0"/>
<g class="scene-spark" style="color:#a28bbf"><use href="#pixel-star" x="96" y="117" width="19" height="19"/><use href="#pixel-star" x="416" y="208" width="13" height="13"/></g>
<g transform="rotate(-8 362 77)"><rect x="315" y="42" width="138" height="47" rx="16" fill="#fff9f0" stroke="#81708e" stroke-width="2"/><path d="M337 88 L338 101 L353 89" fill="#fff9f0" stroke="#81708e" stroke-width="2"/><text x="383" y="71" text-anchor="middle" fill="#594775" font-size="16" font-weight="700">Oh, hi there!</text></g>
<path d="M232 318 L228 346 Q241 357 257 348 L264 317 M272 318 L278 347 Q292 356 307 347 L298 315" fill="#6d6383" stroke="#493e55" stroke-width="3"/>
<path d="M197 275 Q184 308 203 324 Q214 329 219 318 L221 289" fill="#f4c39b" stroke="#594137" stroke-width="3"/>
'''+shirt(189,247,146,111)+'''
<g class="wave-arm"><path d="M309 290 Q338 253 342 226 L337 210 Q333 200 341 197 Q344 197 347 206 L348 186 Q348 178 354 180 L359 201 L363 183 Q365 175 371 180 L369 204 L376 190 Q380 183 384 189 L377 213 Q385 204 389 210 Q393 215 381 228 Q373 237 364 237 Q359 277 331 311 L317 310 Z" fill="#f4c39b" stroke="#594137" stroke-width="3" stroke-linejoin="round"/><path d="M354 209 Q365 214 368 227" fill="none" stroke="#d99976" stroke-width="2"/></g>
'''+head(153,60,235,233)+'''
<g transform="rotate(8 107 282)"><rect x="61" y="265" width="96" height="34" rx="12" fill="#dff5e6" stroke="#9daf9d" stroke-width="1.5"/><text x="109" y="287" text-anchor="middle" fill="#526b59" font-size="12" font-weight="700">PLAYER 01</text></g>'''

about = '''<rect x="35" y="50" width="449" height="310" rx="24" fill="#fff0e5"/><path d="M60 110 H460 V129 Q447 148 433 129 Q419 148 405 129 Q391 148 377 129 Q363 148 349 129 Q335 148 321 129 Q307 148 293 129 Q279 148 265 129 Q251 148 237 129 Q223 148 209 129 Q195 148 181 129 Q167 148 153 129 Q139 148 125 129 Q111 148 97 129 Q83 148 60 129 Z" fill="#e9b69c"/>
<path d="M60 110 L75 78 H447 L460 110 Z" fill="#fff9f0" stroke="#b78c79" stroke-width="2"/>
<path d="M100 79 L92 109 M152 79 L146 109 M204 79 L201 109 M256 79 V109 M308 79 L311 109 M360 79 L366 109 M412 79 L420 109" stroke="#e9b69c" stroke-width="19"/>
<rect x="192" y="61" width="146" height="39" rx="10" fill="#fffaf3" stroke="#aa8474" stroke-width="2"/><text x="265" y="87" text-anchor="middle" fill="#6c4c43" font-size="18" font-weight="700">BOBA BREAK</text>
<rect x="80" y="162" width="128" height="98" rx="8" fill="#fffaf4" stroke="#c7a08b" stroke-width="2"/><text x="144" y="183" text-anchor="middle" fill="#7b5b50" font-size="11" font-weight="700">HAPPINESS, ON ICE</text>
<use href="#boba-cup" x="92" y="192" width="26" height="40"/><use href="#boba-cup" x="132" y="192" width="26" height="40"/><use href="#boba-cup" x="171" y="192" width="26" height="40"/><path d="M94 244 H118 M135 244 H159 M174 244 H195" stroke="#d0ae97" stroke-width="4" stroke-linecap="round"/>
'''+shirt(284,240,117,89)+head(266,110,153,166)+'''
<g class="scene-state" data-pose="order"><path class="order-hand" d="M385 267 Q420 254 419 227 Q427 219 430 229 Q434 252 418 272 L397 288" fill="#f4c39b" stroke="#594137" stroke-width="3"/><rect x="355" y="156" width="110" height="32" rx="11" fill="#fffdf9" stroke="#c6a18d" stroke-width="1.5"/><text x="410" y="177" text-anchor="middle" fill="#735348" font-size="12">One boba, please!</text></g>
<path d="M62 289 H455 V344 Q455 358 441 358 H76 Q62 358 62 344 Z" fill="#e5b496" stroke="#b4846c" stroke-width="2"/><rect x="54" y="280" width="409" height="15" rx="5" fill="#f6d4b7" stroke="#b4846c" stroke-width="2"/><rect x="93" y="309" width="134" height="28" rx="13" fill="#f9e1cc"/><text x="160" y="328" text-anchor="middle" font-size="12" fill="#805746">a little cup of joy</text>
<use href="#little-plant" x="67" y="212" width="48" height="70"/>
<g class="scene-state" data-pose="order"><g class="order-cup"><use href="#boba-cup" x="265" y="225" width="39" height="58"/></g><path class="receive-boba" d="M309 270 Q301 263 291 261 Q281 254 277 262 Q275 269 290 275 L307 285" fill="#f4c39b" stroke="#594137" stroke-width="2.5"/></g>
<g class="scene-state" data-pose="sip"><g class="boba-sip"><path d="M391 277 Q395 249 365 250 L350 260 Q348 271 362 274 L376 287" fill="#f4c39b" stroke="#594137" stroke-width="3"/><use href="#boba-cup" x="321" y="229" width="44" height="66"/><path d="M340 270 Q328 261 322 271 Q320 279 338 283" fill="#f4c39b" stroke="#594137" stroke-width="2.5"/></g><g class="sip-hearts" fill="#c98680"><path d="M428 218 C418 207 409 220 428 232 C447 220 438 207 428 218 Z"/></g></g>'''

def desk_scene(gaming=False):
    if gaming:
        monitor = '''<rect x="286" y="135" width="179" height="132" rx="11" fill="#f9f9ff" stroke="#807b9b" stroke-width="3"/><rect x="297" y="146" width="157" height="103" rx="5" fill="#302d49"/><path d="M298 230 H453" stroke="#a694cf" stroke-width="3"/><path d="M319 217 H333 V227 H319 Z M379 192 H401 V198 H379" fill="#9285bf"/><g class="game-player"><path d="M307 211 H314 V205 H327 V211 H334 V225 H327 V231 H321 V225 H314 V231 H307 Z" fill="#d1eebc"/></g><g style="color:#f7d895"><use href="#pixel-star" x="358" y="175" width="12" height="12"/><use href="#pixel-star" x="417" y="201" width="12" height="12"/></g><path d="M365 267 V289 M345 290 H401" stroke="#807b9b" stroke-width="7" stroke-linecap="round"/>'''
    else:
        monitor = '''<rect x="287" y="130" width="179" height="132" rx="11" fill="#fbfaff" stroke="#877b9f" stroke-width="3"/><rect x="298" y="141" width="157" height="104" rx="5" fill="#302d44"/><g stroke-width="4" stroke-linecap="round"><path d="M313 157 H342 M320 173 H356 M327 188 H340 M327 204 H372 M320 220 H351" stroke="#ba9fdb"/><path d="M351 157 H384 M367 173 H430 M350 188 H407 M384 204 H424" stroke="#abceb8"/></g><path class="code-cursor" d="M361 219 H368" stroke="#f6d793" stroke-width="3"/><path d="M365 263 V289 M345 290 H401" stroke="#877b9f" stroke-width="7" stroke-linecap="round"/>'''
    backdrop = '#e9effc' if gaming else '#eee7f9'
    extras = '''<rect x="51" y="176" width="49" height="116" rx="8" fill="#f8f8ff" stroke="#a29ab4" stroke-width="2"/><circle cx="76" cy="207" r="14" fill="#e5ddf5" stroke="#a491c4" stroke-width="3"/><circle cx="76" cy="248" r="14" fill="#e0eef0" stroke="#96b4bc" stroke-width="3"/><circle cx="76" cy="207" r="5" fill="#a491c4"/><circle cx="76" cy="248" r="5" fill="#96b4bc"/>''' if gaming else '''<path d="M87 289 V246 L115 214" fill="none" stroke="#a495b5" stroke-width="5" stroke-linecap="round"/><path d="M104 206 L127 221 L111 238 L89 221 Z" fill="#d9cbe9" stroke="#9585a7" stroke-width="2"/><path d="M72 290 H104" stroke="#a495b5" stroke-width="6" stroke-linecap="round"/>'''
    scene = f'''<rect x="33" y="51" width="454" height="306" rx="26" fill="{backdrop}"/><rect x="75" y="76" width="105" height="63" rx="9" fill="#fffaf4" stroke="#c6bfd4" stroke-width="2"/><path d="M87 124 L111 94 L129 113 L142 100 L170 124 Z" fill="#d9caed"/><circle cx="153" cy="91" r="6" fill="#efd49d"/><path d="M47 356 H475" stroke="#c5b9d7" stroke-width="2"/>
    <path d="M133 239 Q120 201 138 181 H237 Q253 201 243 250 L229 303 H147 Z" fill="#b9a7d3" stroke="#8a77a2" stroke-width="3"/>
    <path d="M165 320 L153 349 M215 320 L228 349" stroke="#8e7f9c" stroke-width="8" stroke-linecap="round"/>{extras}{monitor}'''
    scene += '<g class="scene-state" data-pose="game">' if gaming else '<g class="scene-state" data-pose="code drink">'
    scene += shirt(133,238,122,99)+head(110,98,167,179)+closed_eyes(110,98,167,179,blinking=True)
    if gaming:
        scene += '''<path d="M130 170 Q116 97 180 96 Q253 93 255 172" fill="none" stroke="#6b5b8a" stroke-width="11" stroke-linecap="round"/><path d="M131 160 L131 190 M252 160 L252 190" stroke="#a88bd1" stroke-width="16" stroke-linecap="round"/><path d="M254 189 Q257 219 231 224" fill="none" stroke="#6b5b8a" stroke-width="4"/><rect x="224" y="219" width="15" height="9" rx="4" fill="#6b5b8a"/>'''
    scene += '</g>'
    if not gaming:
        scene += '''<g class="scene-state" data-pose="nap">'''+shirt(138,250,118,92)+'''<path d="M149 282 Q185 266 238 286" stroke="#f4c39b" stroke-width="20" stroke-linecap="round"/>'''+head(115,143,161,159,'transform="rotate(16 199 260)"')+closed_eyes(115,143,161,159,extra='transform="rotate(16 199 260)"')+'''<g class="nap-letters" fill="#8b73ad" font-weight="700"><text x="250" y="180" font-size="16">z</text><text x="268" y="157" font-size="21">z</text><text x="291" y="130" font-size="26">Z</text></g></g>'''
    scene += '''<path d="M94 306 V354 M429 306 V354" stroke="#a99581" stroke-width="10" stroke-linecap="round"/><rect x="63" y="291" width="403" height="17" rx="6" fill="#ebd5be" stroke="#bca48c" stroke-width="2"/><rect x="203" y="276" width="85" height="15" rx="4" fill="#faf5ff" stroke="#a99ab9" stroke-width="2"/><path d="M215 280 H278 M217 285 H266" stroke="#c7bdd5" stroke-width="2"/><ellipse cx="307" cy="283" rx="13" ry="7" fill="#f6f0ff" stroke="#a99ab9" stroke-width="2"/>'''
    scene += '<g class="scene-state" data-pose="game">' if gaming else '<g class="scene-state" data-pose="code">'
    scene += '''<path class="typing-hand" d="M170 266 Q192 278 238 278 Q246 283 238 287 Q193 289 165 278" fill="#f4c39b" stroke="#594137" stroke-width="2.5"/><path class="mouse-hand" d="M237 271 Q267 285 305 280 Q314 280 314 286 Q312 294 300 292 Q269 295 229 287" fill="#f4c39b" stroke="#594137" stroke-width="2.5"/></g>'''
    if not gaming:
        scene += '''<g class="scene-state" data-pose="code nap"><use href="#coke-can" x="391" y="246" width="27" height="45"/></g><g class="scene-state" data-pose="drink"><g class="coke-sip"><path d="M235 272 Q242 250 216 250 L201 256 Q197 267 213 274" fill="#f4c39b" stroke="#594137" stroke-width="2.5"/><use href="#coke-can" x="180" y="237" width="29" height="47"/><path d="M199 266 Q207 258 213 267" fill="none" stroke="#f4c39b" stroke-width="10" stroke-linecap="round"/></g></g>'''
    return scene

experience = '''<rect x="35" y="51" width="452" height="307" rx="26" fill="#e5f0e4"/><rect x="63" y="81" width="132" height="55" rx="8" fill="#fffaf1" stroke="#b4c1ac" stroke-width="2"/><text x="129" y="103" text-anchor="middle" font-size="11" fill="#63806a" font-weight="700">ONE REP</text><text x="129" y="122" text-anchor="middle" font-size="11" fill="#63806a" font-weight="700">AT A TIME</text>
<path d="M55 352 H468" stroke="#b5c6af" stroke-width="2"/>
<path d="M177 305 V343 M358 305 V343" stroke="#8d9990" stroke-width="10" stroke-linecap="round"/><rect x="147" y="285" width="241" height="22" rx="9" fill="#b2a3c6" stroke="#827190" stroke-width="3"/>
<path d="M219 341 V160 L207 149 M342 341 V160 L354 149" fill="none" stroke="#8d9990" stroke-width="8" stroke-linecap="round"/><path d="M203 343 H235 M326 343 H358" stroke="#8d9990" stroke-width="7" stroke-linecap="round"/>
<g class="scene-state" data-pose="bench"><path d="M283 259 Q332 251 350 273 L369 319 Q370 329 383 331 L401 331" fill="none" stroke="#777186" stroke-width="25" stroke-linecap="round"/><path d="M260 258 Q320 278 339 289 L351 333 H376" fill="none" stroke="#625b72" stroke-width="24" stroke-linecap="round"/>
<path d="M166 245 Q186 218 213 228 L290 249 L282 280 L177 280 Z" fill="#302e2b" stroke="#49352f" stroke-width="3"/>
'''+head(93,161,142,151,'transform="rotate(-72 168 247)"')+'''
<path class="bench-upper-arm" d="M226 260 L223 225 M284 269 L289 225" fill="none" stroke="#f4c39b" stroke-width="18" stroke-linecap="round"/>
<g class="bar-lift"><path d="M223 234 V181 M289 234 V181" stroke="#f4c39b" stroke-width="17" stroke-linecap="round"/><path d="M149 178 H365" stroke="#67707b" stroke-width="7" stroke-linecap="round"/><rect x="159" y="153" width="16" height="51" rx="5" fill="#8d7fa5" stroke="#645b76" stroke-width="2"/><rect x="178" y="143" width="21" height="71" rx="5" fill="#afa1c8" stroke="#645b76" stroke-width="2"/><rect x="318" y="143" width="21" height="71" rx="5" fill="#afa1c8" stroke="#645b76" stroke-width="2"/><rect x="342" y="153" width="16" height="51" rx="5" fill="#8d7fa5" stroke="#645b76" stroke-width="2"/><path d="M216 177 Q223 169 230 177 M282 177 Q289 169 296 177" fill="none" stroke="#f4c39b" stroke-width="8" stroke-linecap="round"/></g></g>
<g class="scene-state" data-pose="rest"><path d="M149 163 H365" stroke="#67707b" stroke-width="7" stroke-linecap="round"/><rect x="160" y="138" width="16" height="51" rx="5" fill="#8d7fa5" stroke="#645b76" stroke-width="2"/><rect x="179" y="128" width="21" height="71" rx="5" fill="#afa1c8" stroke="#645b76" stroke-width="2"/><rect x="318" y="128" width="21" height="71" rx="5" fill="#afa1c8" stroke="#645b76" stroke-width="2"/><rect x="342" y="138" width="16" height="51" rx="5" fill="#8d7fa5" stroke="#645b76" stroke-width="2"/>
<path d="M183 285 L194 331 H218 M213 285 L233 328 H255" fill="none" stroke="#736981" stroke-width="21" stroke-linecap="round"/>
'''+shirt(144,209,110,90)+head(122,89,151,160)+'''
<g class="water-sip"><path d="M244 244 Q260 217 233 213 L218 225 Q214 237 230 244" fill="#f4c39b" stroke="#594137" stroke-width="2.5"/><use href="#water-bottle" x="194" y="213" width="27" height="49"/><path d="M211 241 Q220 233 224 241" fill="none" stroke="#f4c39b" stroke-width="9" stroke-linecap="round"/></g></g>
<path d="M395 294 H445 L442 340 H400 Z" fill="#e7d6c2" stroke="#bba38b" stroke-width="2"/><path d="M399 294 Q400 280 423 283 H445 V317 H430 V306 H402 Z" fill="#faf7ee" stroke="#c5bbab" stroke-width="2"/><path d="M434 290 V312" stroke="#b8a8ca" stroke-width="3"/>
<g class="scene-state" data-pose="bench"><use href="#water-bottle" x="417" y="235" width="27" height="58"/></g>'''

scenes = {
    "hero": svg("hero", "wave", "Daniel waves hello", "Daniel's original chibi portrait, with wavy dark hair, glasses and a black T-shirt, waves a friendly hello.", hero),
    "about": svg("about", "sip", "A little boba break", "Daniel orders a boba at a peach-colored shop, then enjoys a never-ending cup.", about),
    "skills": svg("skills", "game", "Daniel's gaming corner", "Wearing a headset, Daniel plays a little star-collecting game at his pastel PC setup.", desk_scene(True)),
    "projects": svg("projects", "code", "At the coding desk", "Daniel concentrates on coding, takes a sip of Coke Zero, has a short desk nap, then returns to coding.", desk_scene(False)),
    "experience": svg("experience", "rest", "Between sets at the gym", "Daniel bench presses a weighted barbell, racks it, then sits for a water break before his next set.", experience),
}
(SRC / "scenes.json").write_text(json.dumps(scenes, ensure_ascii=False, indent=2), encoding="utf-8")
print("Generated five original inline SVG scenes and embedded portrait definitions.")

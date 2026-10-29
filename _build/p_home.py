from content import REVIEWS, RITUALS, TEAM
from csp import (cut, phone_mock, ritual_title, BOOK, GIFT, APPLE, GOOGLE_PLAY, REVIEW_GOOGLE, E, btn, book_btn, cta_band, ic, img, lines,
                  page, review_card, sec_head)


HERO_SLIDES = [  # image, focus, card label, card title, card link
    ("aveda-jungle", "62% 50%", "The Aveda ritual", "Plant-powered colour &amp; care", "hair.html"),
    ("hot-stones", "50% 50%", "Massage &amp; body", "15+ techniques, from $105", "massage.html"),
    ("ritual-scalp", "50% 30%", "Scalp Solutions", "A facial for your scalp, $75", "hair.html#treatments"),
    ("facial-hands", "50% 40%", "Éminence facials", "Organic skin care, from $75", "skin.html#facials"),
]


def hero():
    slides = "".join(
        f'<figure class="hero3-slide{" is-active" if i == 0 else ""}" data-label="{lab}" data-title="{title}" data-href="{href}" data-thumb="assets/img/{im}-800.webp">'
        f'{img(im, "", "100vw", eager=i == 0, style="object-position:" + focus)}</figure>'
        for i, (im, focus, lab, title, href) in enumerate(HERO_SLIDES))
    im0, _, lab0, title0, href0 = HERO_SLIDES[0]
    return f'''<section class="frame hero3 hero3--home" data-hero>
  <div class="hero3-media">{slides}</div>
  <div class="hero3-shade" aria-hidden="true"></div>
  <div class="hero3-inner">
    <div class="hero3-top">
      <span class="eyebrow" data-reveal="fade"><span class="dot"></span> Aveda Concept salon &amp; eco-spa · Vaudreuil-Dorion</span>
      <a class="hero3-card hero3-feature" href="{href0}" data-reveal style="--d:.6s" data-hero-card>
        <span class="hero3-thumb"><img src="assets/img/{im0}-800.webp" alt="" width="160" height="110"></span>
        <span class="hero3-ft"><span class="eyebrow" data-hero-label>{lab0}</span><strong data-hero-title>{title0}</strong></span>
        <span class="hero3-go">{ic("arrow-up")}</span>
      </a>
    </div>
    <div class="hero3-bottom">
      <div class="hero3-copy">
        <h1 class="hero3-title" data-split>{lines("Naturally", "<em>yours.</em>")}</h1>
        <p class="hero3-lead" data-reveal style="--d:.3s">Hair, skin, massage, medical aesthetics and bridal, under one roof and open 7 days. More than 100 treatments by 35+ specialists, powered by Aveda and Éminence Organics.</p>
      </div>
      <div class="hero3-actions" data-reveal style="--d:.4s">
        <div class="btn-row">{book_btn()}{btn("Find my treatment", "#finder", "glass")}</div>
        <div class="hero3-count" aria-hidden="true"><span data-hero-n>01</span><i><b></b></i><span>0{len(HERO_SLIDES)}</span></div>
      </div>
    </div>
  </div>
</section>'''


def partners():
    names = ["Aveda", "Éminence Organics", "Image Skincare", "Cynosure Elite+", "OPI", "Gehwol", "COOLA", "Cuccio"]
    row = "".join(f"<span>{n}</span><i aria-hidden=\"true\">✦</i>" for n in names)
    return f'''<section class="partners" aria-label="Brands we work with">
  <div class="container partners-in">
    <span class="eyebrow">In our treatment rooms</span>
    <div class="partners-mask"><div class="partners-track">{row}{row}</div></div>
  </div>
</section>'''


def statement():
    pill = lambda n, cls="": f'<span class="pill-img {cls}">{img(n, "", "120px")}</span>'
    return f'''<section class="section">
  <div class="container">
    <div class="sec-rule" data-reveal="fade" style="margin-bottom:clamp(28px,3vw,44px)"><span class="eyebrow"><span class="num">(01)</span> — The Carole St-Pierre way</span><span class="eyebrow hide-sm">Naturellement vôtre</span></div>
    <p class="statement" data-scrub-words>For more than 45 years, Carole has believed one thing: {pill("platinum")} you deserve the best. Today a team of 35+ specialists brings it to life with plant-powered {pill("hand-cream", "round")} Aveda and Éminence organics, so you leave <em>lighter,</em> {pill("facial-white-2")} brighter and <em>naturally</em> more you.</p>
    <div class="statement-foot mt-m" data-reveal><span class="chips"><span class="chip">Aveda Concept salon</span><span class="chip">Eco-responsible spa</span><span class="chip">Cruelty-free beauty</span></span><a class="link-arrow" href="about.html">Meet Carole {ic("arrow")}</a></div>
  </div>
</section>'''


def services():
    def photo(cls, href, im, num, cat, title, frm):
        return (f'<a class="bx bx-photo {cls}" href="{href}" data-reveal>{img(im, "", "(min-width: 1100px) 50vw, 100vw")}'
                f'<span class="bx-chip">{num} · {cat} · {frm}</span><span class="bx-cap"><span class="bx-title">{title}</span><span class="bx-go">{ic("arrow-up")}</span></span></a>')
    avatars = "".join(f'<span class="av" style="--bd:{c}">{cut("team-" + t, "")}</span>' for t, c in
                      [("carole", "var(--sage)"), ("christelle", "var(--sand-soft)"), ("jeff", "var(--sage-soft)"), ("melanie", "var(--blush)"), ("genevieve", "var(--sand)")])
    n, d, t = REVIEWS[0]
    return f'''<section class="section section--flush-top" id="services">
  <div class="container">
    {sec_head("02", "Services", "100+ treatments", "Everything you need, <em class='accent'>under one roof.</em>", "From a quick brow tidy to a four-hour ritual, every service is delivered by a specialist, never a generalist.")}
    <div class="bento2" data-stagger>
      {photo("bx-a", "hair.html", "hair-styling", "01", "Hair &amp; makeup", "Hair, <em>reimagined.</em>", "From $30")}
      {photo("bx-b", "skin.html", "facial-hands", "02", "Esthetics", "Skin that <em>glows.</em>", "From $75")}
      <div class="bx bx-stat" data-reveal>
        <div class="bx-row"><span class="avs">{avatars}</span><span class="chip">Since day one</span></div>
        <p class="bx-big"><span data-count="45">45</span><em>years</em></p>
        <p class="bx-text">of Carole's craft behind every appointment, and a team of 35+ specialists who still learn from her.</p>
      </div>
      <div class="bx bx-note" data-reveal>
        <div class="bx-row"><span class="eyebrow">Spoken here</span><span class="chip">10 languages</span></div>
        <p class="bx-mid">Calm, in <em>your</em> language.</p>
        <p class="bx-text">French, English, Spanish, German, Punjabi, Arabic, Greek, Russian and more, from the front desk to the treatment room.</p>
      </div>
      <div class="bx bx-accent" data-reveal>
        <div class="bx-row"><span class="eyebrow">Today</span><span class="bx-status" data-open-status="short"></span></div>
        <p class="bx-mid">Your moment, <em>booked in a minute.</em></p>
        <div class="btn-row">{btn("Book online", BOOK, "", ext=True, small=True)}<a class="bx-tel" href="tel:+14504557999">or call 450 455-7999</a></div>
      </div>
      {photo("bx-c", "massage.html", "hot-stones", "03", "Massage &amp; body", "Let it <em>all go.</em>", "From $105")}
      {photo("bx-d", "medispa.html", "laser", "04", "Medispa", "Results, <em>safely.</em>", "From $45")}
      {photo("bx-e", "rituals.html", "nails", "05", "Spa rituals", "Half-day <em>bliss.</em>", "From $109")}
      <figure class="bx bx-quote" data-reveal>
        <div class="bx-row"><span class="bx-mark" aria-hidden="true">“</span><span class="eyebrow">Kind words</span></div>
        <blockquote>{E(t)}</blockquote>
        <figcaption><strong>{E(n)}</strong><span class="muted">Google review · {E(d)}</span><a class="link-arrow" href="#reviews">More reviews {ic("arrow")}</a></figcaption>
      </figure>
      {photo("bx-f", "weddings.html", "bridal-bouquet", "06", "Bridal", "Your <em>big day.</em>", "From $90")}
    </div>
  </div>
</section>'''


def expand():
    return f'''<section class="xp" data-expand aria-label="Our philosophy">
  <div class="xp-sticky">
    <figure class="xp-media">{img("aveda-jungle", "An Aveda campaign image: a model among lush green leaves", "100vw")}</figure>
    <div class="xp-copy">
      <span class="eyebrow"><span class="num">✦</span> Our philosophy</span>
      <p class="xp-quote">“Your beauty and wellness are our <em>number-one</em> priority.”</p>
      <span class="mono">Carole St-Pierre · Founder</span>
    </div>
  </div>
</section>'''


def bridal():
    return f'''<section class="frame is-dark grain">
  <div class="container section">
    {sec_head("05", "Weddings", "Now booking wedding season", "Your wedding day, <em class='accent'>beautifully yours.</em>")}
    <div class="feature">
      <div class="collage" data-stagger>
        <figure class="c1" data-reveal="clip">{img("bridal-curls", "Bride with long, glossy cascading curls", "(min-width: 1000px) 30vw, 66vw")}</figure>
        <figure class="c2" data-reveal="clip">{img("bridal-updo", "Elegant low bridal chignon", "(min-width: 1000px) 16vw, 33vw")}</figure>
        <figure class="c3" data-reveal="clip">{img("bridal-jewel", "Bridal makeup with a jewelled headpiece", "(min-width: 1000px) 16vw, 33vw")}</figure>
        <figure class="c4" data-reveal="clip">{img("bridal-bouquet", "Bride holding a soft pink bouquet", "(min-width: 1000px) 16vw, 33vw")}</figure>
        <div class="c5" data-reveal><strong>15<span style="font-size:.5em">km</span></strong><span>Beauty in Action: our team comes to your home, hotel or venue.</span></div>
      </div>
      <div class="stack">
        <p class="lead" data-reveal>Carole and her team have styled and made up dozens of brides, always starting from your personality and your vision. Elegant updo, braids or natural waves: the look you have always pictured, made to last until the last dance.</p>
        <ul class="ticks" role="list" data-reveal>
          <li><span class="t">01</span><div><strong>A trial before the big day</strong><span>Hair and makeup trials at the salon, so nothing is left to chance.</span></div></li>
          <li><span class="t">02</span><div><strong>The whole wedding party</strong><span>Bridesmaids, mothers, flower girls, the groom and your guests.</span></div></li>
          <li><span class="t">03</span><div><strong>We come to you</strong><span>On-location within 15 km, for parties of 4 or more.</span></div></li>
        </ul>
        <div class="btn-row" data-reveal>{btn("Build your bridal quote", "weddings.html#quote", "lime")}{btn("See the bridal menu", "weddings.html#menu", "ghost")}</div>
      </div>
    </div>
  </div>
</section>'''


def finder():
    def opt(val, em, title, sub, final=False):
        f = " data-final" if final else ""
        return f'<button type="button" data-value="{val}"{f}><span class="em" aria-hidden="true">{em}</span><span><strong>{title}</strong><small>{sub}</small></span>{ic("arrow")}</button>'
    return f'''<section class="section" id="finder">
  <div class="container">
    {sec_head("06", "Treatment finder", "Three taps · 20 seconds", "Not sure where <em class='accent'>to start?</em>", "Tell us how you want to feel. We'll match you with the treatment our team would recommend in person.")}
    <div class="finder" data-finder data-reveal>
      <div class="finder-side">
        <div class="finder-progress" aria-hidden="true"><i class="is-on"></i><i></i><i></i><i></i></div>
        <div class="stack" style="--stack:18px">
          <h3 class="h3">Your perfect visit, <em>in three taps.</em></h3>
          <p>Every recommendation comes straight from our menu, with real prices and a direct link to book.</p>
        </div>
        <span class="mono">Prefer a human? Call 450 455-7999</span>
      </div>
      <div class="finder-main">
        <div class="finder-step is-active" data-key="need">
          <p class="eyebrow"><span class="num">Step 1 / 3</span></p>
          <p class="finder-q">What would feel amazing right now?</p>
          <div class="finder-opts">
            {opt("relax", ic("leaf"), "Melt the stress away", "Massage, warmth, quiet")}
            {opt("skin", ic("spark"), "Glowing skin", "Facials and skin care")}
            {opt("hair", ic("scissors"), "A fresh new look", "Cut, colour, care")}
            {opt("results", ic("shield"), "Visible results", "Laser and medical aesthetics")}
            {opt("bridal", ic("ring"), "I'm getting married", "Bridal hair and makeup", True)}
            {opt("gift", ic("gift"), "A gift for someone", "Gift cards and rituals", True)}
          </div>
        </div>
        <div class="finder-step" data-key="time">
          <p class="eyebrow"><span class="num">Step 2 / 3</span></p>
          <p class="finder-q">How much time can you give yourself?</p>
          <div class="finder-opts">
            {opt("short", ic("clock"), "Up to 90 minutes", "A lunch-break reset")}
            {opt("half", ic("sun"), "A couple of hours", "A proper escape")}
            {opt("day", ic("crown"), "Half a day or more", "The full ritual")}
          </div>
          <button class="finder-back" type="button" data-finder-back>{ic("left")} Back</button>
        </div>
        <div class="finder-step" data-key="who">
          <p class="eyebrow"><span class="num">Step 3 / 3</span></p>
          <p class="finder-q">Who is it for?</p>
          <div class="finder-opts">
            {opt("me", ic("user"), "Just me", "Me-time, finally")}
            {opt("two", ic("users"), "Me and someone", "Friend, partner, mom")}
            {opt("gift", ic("heart"), "It's a gift", "Make someone's day")}
          </div>
          <button class="finder-back" type="button" data-finder-back>{ic("left")} Back</button>
        </div>
        <div class="finder-step">
          <div class="finder-result" aria-live="polite"></div>
          <button class="finder-back" type="button" data-finder-restart>{ic("left")} Start over</button>
        </div>
      </div>
    </div>
  </div>
</section>'''


def rituals():
    cards = "".join(f'''<a class="rit-card" href="rituals.html#{slug}">
  <figure>{img(im, "", "(min-width: 900px) 30vw, 80vw")}<span class="chip">{dur} · ${price}</span></figure>
  <div class="rit-meta"><h3>{ritual_title(name)}</h3><span class="rit-n">{i:02d}</span></div>
  <p>{E(kicker)}.</p>
</a>''' for i, (slug, name, kicker, im, dur, price, cats, inc) in enumerate(RITUALS, 1))
    return f'''<section class="frame is-dark grain" id="rituals">
  <div class="container section rit">
    <div class="rit-intro">
      <span class="eyebrow" data-reveal="fade"><span class="num">(03)</span> — Spa rituals</span>
      <h2 class="h2" data-split>{lines("Half a day,", "<em class=\'accent\'>whole new you.</em>")}</h2>
      <p class="lead" data-reveal>Ten signature packages pair massage, skin and nail care into one seamless escape, for yourself or as a gift.</p>
      <div class="btn-row" data-reveal>{btn("All rituals", "rituals.html", "lime")}{btn("Gift a ritual", GIFT, "glass", ext=True, icon="gift")}</div>
      <div class="round-btns rit-nav" data-reveal><button type="button" data-prev aria-label="Previous ritual">{ic("left")}</button><button type="button" data-next aria-label="Next ritual">{ic("arrow")}</button></div>
    </div>
    <div class="rit-scroll" data-scroller><div class="hs-track rit-track" data-reveal="fade">{cards}</div></div>
  </div>
</section>'''


def promise():
    items = [
        ("aveda-blossom", "50% 30%", "Plant-powered", "An Aveda Concept salon", "Colour and care crafted from flower and plant essences. Gentle on the scalp, <em>brilliant</em> on the hair."),
        ("facial-white-2", "50% 92%", "Éminence Organics", "A tree for every product", "Éminence plants a tree for every product sold, so every facial leaves <em>a little more green</em> behind."),
        ("botanical-leaf", "50% 40%", "Cruelty-free", "Kind, always", "We choose brands that never test on animals. Beauty without compromise, and <em>without cruelty.</em>"),
    ]
    cards = "".join(f'''<article class="pol-item" data-reveal>
  <figure class="pol">{img(im, "", "(min-width: 900px) 30vw, 90vw", style="object-position:" + pos)}<figcaption>{cap}</figcaption></figure>
  <span class="pol-n">0{i}</span><h3>{t}</h3><p>{d}</p>
</article>''' for i, (im, pos, cap, t, d) in enumerate(items, 1))
    return f'''<section class="section" id="promise">
  <div class="container">
    {sec_head("04", "Our promise", "Aveda · Éminence · Cruelty-free", "Beauty that's kind <em class='accent'>to the planet, too.</em>", "An eco-responsible spa, from the products on our shelves to the protocols in our treatment rooms.")}
    <div class="pols" data-stagger>{cards}</div>
  </div>
</section>'''


def reviews():
    variants = ["", "lime", "", "dark", "", "", "lime", "", "dark", "", "", ""]
    cards = "".join(review_card(n, d, t, variants[i % len(variants)]) for i, (n, d, t) in enumerate(REVIEWS))
    return f'''<section class="section is-paper2" id="reviews">
  <div class="container">
    {sec_head("07", "Kind words", "Real Google reviews", "Loved by <em class='accent'>Vaudreuil-Dorion.</em>")}
    <div class="review-head" data-reveal style="margin-bottom:28px">
      <div class="score"><strong>200+</strong><span>Google reviews and counting, in French and English</span></div>
      <div class="btn-row"><div class="round-btns"><button type="button" data-prev aria-label="Previous reviews">{ic("left")}</button><button type="button" data-next aria-label="Next reviews">{ic("arrow")}</button></div>{btn("Read all reviews", REVIEW_GOOGLE, "ghost", ext=True, small=True)}</div>
    </div>
  </div>
  <div data-scroller><div class="reviews-track" data-reveal="fade">{cards}</div></div>
</section>'''


def team():
    pick = ["carole", "jeff", "christelle", "melanie", "anna-rose", "genevieve", "rebecca", "mila", "dorianne", "aarti"]
    by = {t[1]: t for t in TEAM}
    people = "".join(
        f'<a class="person" href="team.html#{s}" data-cursor="Meet"><figure data-initial="{E(by[s][0][0])}">{cut("team-" + s, "Portrait of " + by[s][0])}</figure><div><strong>{E(by[s][0])}</strong><span>{E(by[s][2])}</span></div></a>'
        for s in pick)
    return f'''<section class="section">
  <div class="container">
    {sec_head("08", "The team", "35+ specialists", "The hands <em class='accent'>behind the magic.</em>", "Every guest is matched with a specialist trained for exactly what they need, and many of our guests have followed theirs for a decade.", extra="")}
  </div>
  <div data-scroller><div class="people" data-reveal="fade">{people}</div></div>
  <div class="container mt-l" data-reveal><div class="btn-row" style="justify-content:space-between"><a class="link-arrow" href="team.html">Meet all 26 featured specialists {ic("arrow")}</a><div class="round-btns"><button type="button" data-prev aria-label="Previous">{ic("left")}</button><button type="button" data-next aria-label="Next">{ic("arrow")}</button></div></div></div>
</section>'''


def promo():
    return f'''<section class="section section--flush-top">
  <div class="container">
    <div class="promo" data-stagger>
      <article class="promo-card promo-card--gift" data-reveal>
        <div class="copy"><span class="eyebrow" style="color:var(--ink-2)"><span class="num" style="color:var(--ink)">✦</span> Gift cards</span><h2 class="h3">The gift that's <em>never the wrong size.</em></h2><p>Any amount or any ritual. Emailed instantly, and it never expires.</p></div>
        <div class="btn-row">{btn("Buy a gift card", GIFT, "", ext=True)}</div>
        <div class="giftcard" aria-hidden="true"><img src="assets/img/logo-mark.png" alt=""><div><span class="mono">Gift card</span><br><strong>Naturally yours.</strong></div></div>
      </article>
      <article class="promo-card promo-card--app on-dark" data-reveal>
        <div class="copy"><span class="eyebrow"><span class="num">✦</span> The CSP app</span><h2 class="h3">Your spa, <em class="accent">in your pocket.</em></h2><p class="muted" style="color:var(--on-dark-2)">See live availability, book and rebook, and get exclusive app-only promotions.</p></div>
        <div class="store-badges"><a href="{APPLE}" target="_blank" rel="noopener">{ic("apple")}<span><small>Download on the</small>App Store</span></a><a href="{GOOGLE_PLAY}" target="_blank" rel="noopener">{ic("play")}<span><small>Get it on</small>Google Play</span></a></div>
        {phone_mock()}
      </article>
    </div>
  </div>
</section>'''


def build():
    body = "\n".join([hero(), partners(), statement(), services(), rituals(), expand(), promise(), bridal(), finder(), reviews(), team(), promo(),
                      cta_band(image="head-massage")])
    return page("index.html", "Carole St-Pierre salon & spa | Aveda hair salon & spa in Vaudreuil-Dorion",
                "Aveda Concept hair salon and eco-responsible spa in Vaudreuil-Dorion: hair, facials, massage, laser, medical aesthetics and bridal styling. Open 7 days. Book online.",
                body, loader=True)

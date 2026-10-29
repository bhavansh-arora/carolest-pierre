from content import TEAM, TEAM_CATS
from csp import (BOOK, EMAIL, E, btn, cta_band, cut, ic, img, page, phero, sec_head)

CAT_LABEL = dict(TEAM_CATS)


def leadership():
    by = {t[1]: t for t in TEAM}
    blocks = []
    for slug in ("carole", "julie"):
        name, _, role, _, bio, love, langs = by[slug]
        blocks.append(f'''<article class="split split--center" id="{slug}" style="gap:clamp(24px,4vw,64px)" data-reveal>
  <figure class="lead-portrait" data-initial="{name[0]}">{cut("team-" + slug, "Portrait of " + name)}</figure>
  <div class="stack" style="--stack:20px">
    <span class="eyebrow"><span class="num">{E(role)}</span></span>
    <h3 class="h2">{name}<em class="accent">.</em></h3>
    <p class="lead">{E(bio)}</p>
    <p class="prose">{E(love)}</p>
    <div class="chips">{"".join(f'<span class="chip">{E(l)}</span>' for l in langs)}</div>
  </div>
</article>''')
    return f'''<section class="section" id="leadership">
  <div class="container">
    {sec_head("01", "Leadership", "Since day one", "The women <em class='accent'>behind the name.</em>")}
    <div class="stack" style="--stack:clamp(56px,7vw,112px)">{"".join(blocks)}</div>
  </div>
</section>'''


def grid():
    cards = []
    for name, slug, role, cats, bio, love, langs in TEAM:
        if slug in ("carole", "julie"):
            continue
        first = cats.split()[0]
        cards.append(f'''<article class="member" id="{slug}" data-cat="{cats}" data-reveal>
  <figure data-initial="{E(name[0])}">{cut("team-" + slug, "Portrait of " + name)}<span class="chip">{CAT_LABEL.get(first, "")}</span></figure>
  <div><h3>{E(name)}</h3><p class="role">{E(role)}</p></div>
  <details><summary>About {E(name)} <span class="pm">+</span></summary>
    <p>{E(bio)}</p><p><strong>Guests love:</strong> {E(love)}</p>
    <div class="langs">{"".join(f"<span>{E(l)}</span>" for l in langs)}</div>
  </details>
</article>''')
    filters = "".join(f'<button type="button" data-filter="{k}" aria-pressed="{"true" if k == "all" else "false"}">{t} <span class="c"></span></button>'
                      for k, t in TEAM_CATS if k != "lead")
    return f'''<section class="section is-paper2" id="specialists">
  <div class="container">
    {sec_head("02", "Specialists", "Filter by expertise", "Find <em class='accent'>your person.</em>", "Every guest is matched with the right specialist. Filter by what you need, then book by name online or by phone.")}
    <div class="filters" data-filter-group="team-grid" role="group" aria-label="Filter team" data-reveal>{filters}</div>
    <div class="team-grid mt-l" id="team-grid">{"".join(cards)}</div>
  </div>
</section>'''


def join():
    return f'''<section class="section">
  <div class="container">
    <div class="band" data-parallax-root data-reveal="fade">
      {img("salon-floor", "The salon floor at Carole St-Pierre", "100vw", parallax=12)}
      <div class="band-body">
        <span class="eyebrow" style="color:var(--on-dark-2)"><span class="num" style="color:var(--lime)">✦</span> Careers &amp; internships</span>
        <h2 class="h2">Love what you do? <em class="accent">Do it here.</em></h2>
        <p class="lead" style="color:var(--on-dark-2)">Competitive pay, flexible hours, perks beyond the norm, and real work-life balance. We also offer permanent internships for stylists, estheticians and massage therapists.</p>
        <div class="btn-row">{btn("Send your résumé", "mailto:" + EMAIL + "?subject=Career%20application", "lime")}{btn("Careers page", "about.html#careers", "ghost")}</div>
      </div>
    </div>
  </div>
</section>'''


def build():
    hero = phero("Team", ["Meet the", "<em>specialists.</em>"],
                 "Stylists, estheticians, massage therapists, laser technicians and a front-desk team that remembers your name. Many guests have followed their specialist for ten years or more.",
                 None, "Carole St-Pierre with members of her team",
                 [("Leadership", "45+ years"), ("Professionals", "35+"), ("Disciplines", "Hair · skin · body"), ("Languages", "FR · EN · +8")],
                 [("leadership", "Leadership"), ("specialists", "All specialists")], tag="10 languages spoken",
                 cta=f'<div class="btn-row">{btn("Book by name", BOOK, "lime", ext=True)}{btn("Filter the team", "#specialists", "ghost")}</div>',
                 cast=["team-christelle", "team-carole", "team-jeff"])
    body = "\n".join([hero, leadership(), grid(), join(), cta_band("Book with <em>your favourite.</em>")])
    return page("team.html", "Our Team | Stylists, Estheticians & Massage Therapists | Carole St-Pierre salon & spa",
                "Meet the 35+ specialists of Carole St-Pierre salon & spa in Vaudreuil-Dorion: Aveda stylists and colourists, estheticians, laser technicians and massage therapists.", body)

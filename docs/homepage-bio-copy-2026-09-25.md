# yash.is homepage bio, draft copy for review (2026-09-25)

Status: DRAFT for Yash to view. Not applied to live. Supersedes `docs/homepage-bio-copy-2026-09-24.md`, whose Now philosophy block was rejected.

Scope: copy only. Same layout, nav, theme, fonts, and section order as the live page (Identity, Now, Work, Contact). Zero em dashes anywhere, including meta. Work list separators change from an em dash to a colon.

Source of truth for intent: `uploads/homepage-bio-rewrite-packet-2026-09-25.md`.

## What changed vs the Sep 24 draft

| Area | Sep 24 draft | Sep 25 draft |
| --- | --- | --- |
| Now, optimist line | "Call me a delusional optimist, but..." | Stated directly: "I'm a delusional optimist" |
| Now, personal rule | "personal rule: whenever that chapter starts, show up as an incredible dad" | North star arc: lead, leave behind, uplift the next generation in AI and being human; great dad; spaces for future generations |
| Now, products | BBB and Dear Kid Books in one "That lens is why I'm building..." sentence | BBB alone as the current product focus line |
| Work | Dear Kid Books removed | Dear Kid Books restored to its live position (after Men in the Arena) |
| Contact | "as of Sept 2026" | "as of October 2026" |

Everything else (Identity, Alpha School line, recomp line, Work items, Contact structure) is carried over unchanged.

## Links

| Name | href |
| --- | --- |
| Alpha School | `https://alpha.school` |
| Getting juicy | `/getting-juicy` |
| Brain Building Beats | `https://brainbuildingbeats.com` |
| Men in the Arena | `https://meninthearena.co` |
| Dear Kid Books | `https://dearkidbooks.com` |

## Plain text

### Identity

I'm an athlete, builder, educator, and I love to host. My life mission is to Create Serendipity.

I (un)fortunately kept a fairly low profile online. August and September 2026 rocked me with the understanding that I'm running out of time, so I'm running it up.

### Now

I'm leading GTM Engineering at Alpha School.

I'm also in the middle of a public recomposition of my body. Every day is measured at yash.is/getting-juicy.

I've spent the last year surrounded by people building the future of education. I'm a delusional optimist, and I'm extremely excited about the future kids get to grow into.

That year reshaped who I am and gave me a north star for the next two decades: live as a man who leads, leaves behind, and uplifts the next generation as they navigate the world of AI and being human. It starts with how I see myself. I will be a great dad who gives my kids a space to thrive, and I will build spaces and environments where future generations can do the same.

My current product focus is Brain Building Beats: ceiling projection and sound for a baby's first year. The first release is in development.

### Work

Some of the more interesting things I've worked on:

- Alpha School: Two-hour learning followed by life skills.
- Men in the Arena: Co-founded an Austin men's brotherhood, now a 501(c)(3) nonprofit. We fight male isolation through fellowship and shared challenges.
- Dear Kid Books: Personalized storybooks with your kid's face in them.
- Radio Room: Built my first fully automated podcast studio.
- Athlete lane: 4 HYROXes. 2 half marathons. 1 30k.

### Contact

Email me at yash.chitneni@gmail.com. I'm also on X, IG, and YouTube, bringing those back to life as of October 2026.

## HTML-ready

Drop-in replacement for the `<article class="prose">` body on the live page. Classes match the live markup (`identity`, `work`). Escaping (`&#39;`) matches the live output.

```html
<h1>Yash Chitneni</h1>

<p class="identity">I&#39;m an athlete, builder, educator, and I love to host. My life mission is to Create Serendipity.</p>

<p>I (un)fortunately kept a fairly low profile online. August and September 2026 rocked me with the understanding that I&#39;m running out of time, so I&#39;m running it up.</p>

<h2>Now</h2>

<p>I&#39;m leading GTM Engineering at <a href="https://alpha.school">Alpha School</a>.</p>

<p>I&#39;m also in the middle of a public recomposition of my body. Every day is measured at <a href="/getting-juicy">yash.is/getting-juicy</a>.</p>

<p>I&#39;ve spent the last year surrounded by people building the future of education. I&#39;m a delusional optimist, and I&#39;m extremely excited about the future kids get to grow into.</p>

<p>That year reshaped who I am and gave me a north star for the next two decades: live as a man who leads, leaves behind, and uplifts the next generation as they navigate the world of AI and being human. It starts with how I see myself. I will be a great dad who gives my kids a space to thrive, and I will build spaces and environments where future generations can do the same.</p>

<p>My current product focus is <strong><a href="https://brainbuildingbeats.com">Brain Building Beats</a></strong>: ceiling projection and sound for a baby&#39;s first year. The first release is in development.</p>

<h2>Work</h2>

<p>Some of the more interesting things I&#39;ve worked on:</p>

<ul class="work">
  <li><strong>Alpha School</strong>: Two-hour learning followed by life skills.</li>
  <li><strong><a href="https://meninthearena.co">Men in the Arena</a></strong>: Co-founded an Austin men&#39;s brotherhood, now a 501(c)(3) nonprofit. We fight male isolation through fellowship and shared challenges.</li>
  <li><strong><a href="https://dearkidbooks.com">Dear Kid Books</a></strong>: Personalized storybooks with your kid&#39;s face in them.</li>
  <li><strong>Radio Room</strong>: Built my first fully automated podcast studio.</li>
  <li><strong>Athlete lane</strong>: 4 HYROXes. 2 half marathons. 1 30k.</li>
</ul>

<h2>Contact</h2>

<p>Email me at <a href="mailto:yash.chitneni@gmail.com">yash.chitneni@gmail.com</a>. I&#39;m also on <a href="https://x.com/yashchitneni" rel="me">X</a>, <a href="https://instagram.com/yashchitneni" rel="me">IG</a>, and <a href="https://www.youtube.com/channel/UCaaI2myRFdtpJFXpphi5HHQ" rel="me">YouTube</a>, bringing those back to life as of October 2026.</p>
```

## Meta description

Live `<meta name="description">` and `<meta property="og:description">` currently contain an em dash. Replace both with:

```
Yash Chitneni: athlete, builder, educator, and host. Create Serendipity. Leading GTM Engineering at Alpha School and building Brain Building Beats.
```

Alternate if Yash prefers the meta to stay identical to the Sep 24 draft (no BBB mention):

```
Yash Chitneni: athlete, builder, educator, and host. Create Serendipity. Leading GTM Engineering at Alpha School; public recomposition at yash.is/getting-juicy.
```

## Notes on choices

- "Delusional optimist" is stated, not hedged. "I'm a delusional optimist, and I'm extremely excited about the future kids get to grow into" keeps his exact adjective and his exact "extremely excited".
- The north star, great dad, and spaces for future generations are one paragraph with one arc: the year reshaped him, that produced the north star, the north star starts with how he sees himself, and that view extends from his own kids to future generations. No slogans, no pep-talk filler.
- His raw notes said both "next two decades" and "next few decades". The draft uses "next two decades" once so the Now block has a single time horizon.
- The north star triad "leads, leaves behind, and uplifts the next generation" is kept verbatim because it is his framing. "as they navigate the world of AI and being human" is a light smoothing of "in navigating the world of AI and being human". If he wants the original preposition, swap in: "in navigating the world of AI and being human."
- "I will be a great dad" uses the full "I will" rather than "I'll" for weight. Everywhere else the contractions match the live voice.
- Brain Building Beats gets its own Now line as the current product focus. The one-liner stays literal: ceiling projection and sound for a baby's first year, first release in development. Bold plus link matches how Dear Kid Books is presented on the live page.
- Dear Kid Books lives only in Work, restored to its live position (after Men in the Arena, before Radio Room) and its live one-liner. It does not appear in Now.
- Men in the Arena keeps the Sep 24 line ("now a 501(c)(3) nonprofit" plus the mission sentence), which was not part of the rejection.
- Contact: timing updated to "as of October 2026". Light grammar pass carried over from Sep 24 ("Email me at", serial comma, "those").
- Work list separator is a colon instead of the live em dash. Every em dash on the live page (Identity, recomp line, Work items, Contact, meta) is replaced with a comma, period, or colon.
- Meta description mentions Brain Building Beats so the search snippet reflects the new Now focus. An alternate that matches the Sep 24 meta is included in case Yash wants the recomp link in the snippet instead.

## EXECUTION BRIEF (for Opus, after Yash approves; do not run now)

Repo: `yashchitneni/yash-is`. Text-only change. No layout, nav, theme, or getting-juicy UI changes.

1. In `src/pages/home.tsx`, replace the `<article class="prose">` body with the HTML-ready block above. Keep `identity` and `work` classes, `rel="me"` on the social links, and the existing `&#39;` escaping style.
2. Update both `<meta name="description">` and `<meta property="og:description">` to the approved meta description (primary or alternate, per Yash).
3. Confirm the rendered page and meta contain zero U+2014 characters (for example `grep -rn $'\u2014' src/` or a test asserting the rendered HTML has none).
4. Update any snapshot or copy tests that assert the old text (em dash Work separators, "Sept 2026", the old recomp sentence, the Sep 24 philosophy block if it was ever applied).
5. Open a PR titled "copy: homepage bio (Sep 25 approved)" linking to this docs file.

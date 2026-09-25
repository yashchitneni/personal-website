# yash.is homepage bio, final copy (2026-09-24)

Scope: copy only. Same layout, nav, theme, fonts, and section order as the live page. Zero em dashes. Work list separators change from an em dash to a colon.

Source of truth for intent: `uploads/homepage-bio-copy-packet-2026-09-24.md`.

## Links

| Name | href |
| --- | --- |
| Alpha School | `https://alpha.school` |
| Getting juicy | `/getting-juicy` |
| Brain Building Beats | `https://brainbuildingbeats.com` |
| Dear Kid Books | `https://dearkidbooks.com` |
| Men in the Arena | `https://meninthearena.co` |

## Plain text

### Identity

I'm an athlete, builder, educator, and I love to host. My life mission is to Create Serendipity.

I (un)fortunately kept a fairly low profile online. August and September 2026 rocked me with the understanding that I'm running out of time, so I'm running it up.

### Now

I'm leading GTM Engineering at Alpha School.

I'm also in the middle of a public recomposition of my body. Every day is measured at yash.is/getting-juicy.

I've spent the last year surrounded by people building the future of education. Call me a delusional optimist, but I'm genuinely excited about the future kids get to grow into. It also gave me a personal rule: whenever that chapter starts, show up as an incredible dad. That changes how I carry myself today.

That lens is why I'm building Brain Building Beats (ceiling projection and sound for a baby's first year, with the first release in development) and Dear Kid Books (personalized storybooks with your kid's face in them).

### Work

Some of the more interesting things I've worked on:

- Alpha School: Two-hour learning followed by life skills.
- Men in the Arena: Co-founded an Austin men's brotherhood, now a 501(c)(3) nonprofit. We fight male isolation through fellowship and shared challenges.
- Radio Room: Built my first fully automated podcast studio.
- Athlete lane: 4 HYROXes. 2 half marathons. 1 30k.

### Contact

Email me at yash.chitneni@gmail.com. I'm also on X, IG, and YouTube, bringing those back to life as of Sept 2026.

## HTML-ready

Drop-in replacement for the `<article class="prose">` body on the live page. Classes match the live markup (`identity`, `work`). Escaping (`&#39;`) matches the live output.

```html
<h1>Yash Chitneni</h1>

<p class="identity">I&#39;m an athlete, builder, educator, and I love to host. My life mission is to Create Serendipity.</p>

<p>I (un)fortunately kept a fairly low profile online. August and September 2026 rocked me with the understanding that I&#39;m running out of time, so I&#39;m running it up.</p>

<h2>Now</h2>

<p>I&#39;m leading GTM Engineering at <a href="https://alpha.school">Alpha School</a>.</p>

<p>I&#39;m also in the middle of a public recomposition of my body. Every day is measured at <a href="/getting-juicy">yash.is/getting-juicy</a>.</p>

<p>I&#39;ve spent the last year surrounded by people building the future of education. Call me a delusional optimist, but I&#39;m genuinely excited about the future kids get to grow into. It also gave me a personal rule: whenever that chapter starts, show up as an incredible dad. That changes how I carry myself today.</p>

<p>That lens is why I&#39;m building <strong><a href="https://brainbuildingbeats.com">Brain Building Beats</a></strong> (ceiling projection and sound for a baby&#39;s first year, with the first release in development) and <strong><a href="https://dearkidbooks.com">Dear Kid Books</a></strong> (personalized storybooks with your kid&#39;s face in them).</p>

<h2>Work</h2>

<p>Some of the more interesting things I&#39;ve worked on:</p>

<ul class="work">
  <li><strong>Alpha School</strong>: Two-hour learning followed by life skills.</li>
  <li><strong><a href="https://meninthearena.co">Men in the Arena</a></strong>: Co-founded an Austin men&#39;s brotherhood, now a 501(c)(3) nonprofit. We fight male isolation through fellowship and shared challenges.</li>
  <li><strong>Radio Room</strong>: Built my first fully automated podcast studio.</li>
  <li><strong>Athlete lane</strong>: 4 HYROXes. 2 half marathons. 1 30k.</li>
</ul>

<h2>Contact</h2>

<p>Email me at <a href="mailto:yash.chitneni@gmail.com">yash.chitneni@gmail.com</a>. I&#39;m also on <a href="https://x.com/yashchitneni" rel="me">X</a>, <a href="https://instagram.com/yashchitneni" rel="me">IG</a>, and <a href="https://www.youtube.com/channel/UCaaI2myRFdtpJFXpphi5HHQ" rel="me">YouTube</a>, bringing those back to life as of Sept 2026.</p>
```

### Meta description (currently contains an em dash)

Replace both `<meta name="description">` and `<meta property="og:description">` content with:

```
Yash Chitneni: athlete, builder, educator, and host. Create Serendipity. Leading GTM Engineering at Alpha School; public recomposition at yash.is/getting-juicy.
```

## Notes on choices

- Dear Kid Books moved to Now and removed from Work (Now-only, per packet).
- Brain Building Beats leads the kids/education sentence and is linked the same way as Dear Kid (bold name + href). The one-liner stays literal: ceiling projection and sound for a baby's first year, first release in development.
- "Delusional optimist" kept. "Call me a delusional optimist, but" carries the rhythm better than "As a delusional optimist" and keeps Yash's words.
- Men in the Arena: meninthearena.co lists "Fall 2025: Became a 501(c)(3) Non-Profit" and describes itself as "a 501(c)(3) nonprofit", so the line says "now a 501(c)(3) nonprofit". If Yash prefers the packet's phrasing, swap in: "Co-founded an Austin men's brotherhood on a nonprofit path. We fight male isolation through fellowship and shared challenges."
- Work list separator is a colon instead of the live em dash. Every other em dash was replaced with a period, comma, or parenthetical.
- Contact got a light grammar pass only (added "at", serial comma, and "those" instead of "this" since it refers to the three accounts).

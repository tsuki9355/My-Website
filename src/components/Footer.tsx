import "./Footer.css";

const SOCIAL_LINKS = [
  { id: "github-icon", label: "GitHub", href: "https://github.com/tsuki9355" },
  { id: "discord-icon", label: "Discord", href: "https://discord.com/users/441105547391926283" },
  { id: "instagram-icon", label: "Instagram", href: "https://www.instagram.com/no_fxxkin_angel" },
  { id: "itch-icon", label: "Itch.io", href: "https://tsuki-0505.itch.io" },
];

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-socials">
        {SOCIAL_LINKS.map((social) => (
          <a
            key={social.id}
            className="social-icon"
            href={social.href}
            target="_blank"
            rel="noreferrer"
            aria-label={social.label}
          >
            <svg viewBox="0 0 20 20">
              <use href={`/icons.svg#${social.id}`} />
            </svg>
          </a>
        ))}
      </div>
      <a className="btn btn-primary resume-btn" href="/Angus_Resume.pdf" download="Angus-Chou-Resume.pdf">
        Download Resume
      </a>
    </footer>
  );
}

export default Footer;

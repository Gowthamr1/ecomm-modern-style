import { Link } from "react-router";
import { Brand } from "./SiteHeader";

const SHOP_LINKS = [
  { to: "/shop", label: "All objects" },
  { to: "/shop?category=Home", label: "Home" },
  { to: "/shop?category=Technology", label: "Technology" },
  { to: "/shop?category=Wearables", label: "Wearables" },
];

const ACCOUNT_LINKS = [
  { to: "/orders", label: "Orders" },
  { to: "/payments", label: "Payments" },
  { to: "/profile", label: "Profile" },
  { to: "/cart", label: "Bag" },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t hairline bg-background">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-xs">
            <Brand />
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Considered everyday objects, made to be used rather than
              displayed. Designed in small batches, shipped from Portland.
            </p>
            <p className="mt-6 inline-flex items-center gap-2 rounded-full border hairline px-3 py-1.5 text-[11px] text-muted-foreground">
              <span className="size-1.5 rounded-full bg-primary" />
              Demo checkout — nothing is charged
            </p>
          </div>
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Shop
            </h3>
            <ul className="mt-4 space-y-3">
              {SHOP_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-foreground/80 transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Account
            </h3>
            <ul className="mt-4 space-y-3">
              {ACCOUNT_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-foreground/80 transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Support
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-foreground/80">
              <li>Shipping &amp; returns</li>
              <li>Care guide</li>
              <li>hello@forma.demo</li>
              <li>Mon–Fri, 9–5 PT</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t hairline pt-6 text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Forma Studio. A demo storefront.</p>
          <p className="uppercase tracking-[0.16em]">
            Browse · Bag · Demo payment
          </p>
        </div>
      </div>
    </footer>
  );
}

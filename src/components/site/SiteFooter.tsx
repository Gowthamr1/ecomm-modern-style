import { Link } from "react-router";
import { Brand } from "./SiteHeader";

const SHOP_LINKS = [
  { to: "/shop", label: "All Spices" },
  { to: "/shop?category=Whole%20Pods%20%26%20Seeds", label: "Whole Pods & Seeds" },
  { to: "/shop?category=Rare%20Terroirs", label: "Rare Terroirs" },
  { to: "/shop?category=Single-Origin%20Peppers", label: "Single-Origin Peppers" },
  { to: "/shop?category=Heritage%20Blends", label: "Heritage Blends" },
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
              Single-origin Indian heirloom spices harvested at peak maturity from
              biodiverse family estates across Kerala, Kashmir, Meghalaya, and
              Rajasthan. Kiln-fresh and airtight sealed.
            </p>
            <p className="mt-6 inline-flex items-center gap-2 rounded-full border hairline px-3 py-1.5 text-[11px] text-muted-foreground">
              <span className="size-1.5 rounded-full bg-emerald-600" />
              100% Single-Estate Terroir Guarantee
            </p>
          </div>
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Collection
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
              Heritage Care
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-foreground/80">
              <li>Harvest &amp; Origin Certificates</li>
              <li>Airtight Storage Guide</li>
              <li>concierge@formaspices.com</li>
              <li>Pan-India Express: 2–4 Business Days</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t hairline pt-6 text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Forma Spices Estate. Pure Single-Origin Indian Spices.</p>
          <p className="uppercase tracking-[0.16em]">
            Idukki Cardamom · Pampore Saffron · Wayanad Pepper
          </p>
        </div>
      </div>
    </footer>
  );
}

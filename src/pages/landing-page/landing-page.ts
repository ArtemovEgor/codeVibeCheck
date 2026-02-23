import BaseComponent from "@/components/base/base-component";
import Link from "@/components/link/link";
import "./landing-page.scss";
import { Header } from "@/components/layout/header/header";
import { EN } from "@/locale/en";
import { ICONS } from "@/assets/icons";

export class LandingPage extends BaseComponent {
  constructor() {
    super({ tag: "div", className: "landing" });
    this.init();
  }

  private init(): void {
    this.addChildren([
      new Header(),
      this.createHero(),
      this.createFeatures(),
      this.createCTA(),
    ]);
  }

  // SECTION: Hero

  private createHero(): BaseComponent {
    const hero = new BaseComponent({ tag: "section", className: "hero" });
    this.renderHeroContents(this.createHeroContainer(hero));

    return hero;
  }

  private createHeroContainer(parent: BaseComponent): BaseComponent {
    const container = new BaseComponent({
      className: "container hero__container",
      parent: parent,
    });

    new BaseComponent({
      className: "hero__code hero__code--left",
      text: EN.landing.hero.examples.first,
      parent: parent,
    });

    new BaseComponent({
      className: "hero__code hero__code--right",
      text: EN.landing.hero.examples.second,
      parent: parent,
    });

    return container;
  }

  private renderHeroContents(container: BaseComponent): void {
    new BaseComponent({
      tag: "h1",
      className: "hero__title",
      parent: container,
    }).addChildren([
      new BaseComponent({ tag: "span", text: EN.landing.hero.title.start }),
      new BaseComponent({
        tag: "span",
        className: "hero__title--js",
        text: "JS",
      }),
      new BaseComponent({ tag: "span", text: "/" }),
      new BaseComponent({
        tag: "span",
        className: "hero__title--ts",
        text: "TS",
      }),
      new BaseComponent({ tag: "span", text: EN.landing.hero.title.end }),
    ]);

    new BaseComponent({
      tag: "p",
      className: "hero__subtitle",
      text: EN.landing.hero.subtitle,
      parent: container,
    });

    this.renderCTAAction(container);
  }

  // SECTION: Features

  private createFeatures(): BaseComponent {
    const section = new BaseComponent({
      tag: "section",
      className: "features",
    });
    const container = new BaseComponent({
      className: "container",
      parent: section,
    });

    this.renderFeaturesHeader(container);
    this.renderFeaturesGrid(container);

    return section;
  }

  private renderFeaturesHeader(parent: BaseComponent): void {
    new BaseComponent({
      tag: "h2",
      className: "features__title",
      text: EN.landing.features.title,
      parent,
    });
  }

  private renderFeaturesGrid(parent: BaseComponent): void {
    const grid = new BaseComponent({ className: "features__grid", parent });

    for (const item of EN.landing.features.items) {
      this.createFeatureCard(grid, item);
    }
  }

  private createFeatureCard(
    parent: BaseComponent,
    { icon, title, desc }: { icon: string; title: string; desc: string },
  ): void {
    const card = new BaseComponent({ className: "feature-card", parent });

    const iconWrapper = new BaseComponent({
      className: "feature-card__icon-wrapper",
      parent: card,
    });

    const iconSvg = new BaseComponent({
      tag: "span",
      className: "feature-card__icon",
      parent: iconWrapper,
    });

    iconSvg.getNode().innerHTML = ICONS[icon as keyof typeof ICONS] || "";

    new BaseComponent({
      tag: "h3",
      className: "feature-card__title",
      text: title,
      parent: card,
    });

    new BaseComponent({
      tag: "p",
      className: "feature-card__desc",
      text: desc,
      parent: card,
    });
  }

  // SECTION: CTA

  private createCTA(): BaseComponent {
    const section = new BaseComponent({ tag: "section", className: "cta" });
    const container = new BaseComponent({
      className: "container cta__container",
      parent: section,
    });

    this.renderCTAContent(container);
    this.renderCTAAction(container);

    return section;
  }

  private renderCTAContent(parent: BaseComponent): void {
    new BaseComponent({
      tag: "h2",
      className: "cta__title",
      text: EN.landing.cta.title,
      parent,
    });

    new BaseComponent({
      tag: "p",
      className: "cta__subtitle",
      text: EN.landing.cta.subtitle,
      parent,
    });
  }

  private renderCTAAction(parent: BaseComponent): void {
    new Link({
      text: EN.landing.cta.button,
      variant: "primary",
      className: "action__btn",
      href: "#register",
      parent,
    });
  }
}

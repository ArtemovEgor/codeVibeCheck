import { LandingPage } from "./pages/landing-page/landing-page";

export default class App {
  private readonly parentNode: HTMLElement;

  constructor(parentNode: HTMLElement) {
    this.parentNode = parentNode;
    new LandingPage().addTo(this.parentNode);
  }
}

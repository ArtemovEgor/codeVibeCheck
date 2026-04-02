import BaseComponent from "../base/base-component";
import { i18n } from "@/services/localization-service";
import { Button } from "../button/button";
import { router } from "@/router/router";
import { ROUTES } from "@/constants/routes";
import { renderMarkdown } from "@/utils/markdown";
import type { IUserChatStats } from "@/types/shared";
import "./ai-interview-performance.scss";

interface IParsedReport {
  persona: string;
  verdict: string;
  vibe: string;
  competencies: { label: string; value: string }[];
}

const CHART_CONFIG = {
  VIEWBOX_WIDTH: 350,
  VIEWBOX_HEIGHT: 200,
  MAX_RADIUS: 70,
  LEVELS: 5,
  LABEL_MARGIN: 15,
  POINT_RADIUS: 3,
};

export default class AIInterviewPerformance extends BaseComponent {
  constructor(stats: IUserChatStats) {
    super({ className: "ai-performance" });

    if (stats.chatSessionsCompleted === 0) {
      this.renderEmptyState();
    } else {
      this.render(stats);
    }
  }

  private render(stats: IUserChatStats): void {
    const t = i18n.t().dashboard.components.ai_performance;

    new BaseComponent({
      tag: "h2",
      className: "ai-performance__title",
      text: t.title,
      parent: this,
    });

    if (stats.lastSessionResult) {
      const parsed = this.parseReport(stats.lastSessionResult);
      this.renderReport(parsed);
    }

    new Button({
      className: "ai-performance__cta",
      parent: this,
      text: t.review_session,
      onClick: () => router.navigate(ROUTES.AI_CHAT),
    });
  }

  private renderEmptyState(): void {
    const t = i18n.t().dashboard.components.ai_performance;

    new BaseComponent({
      tag: "h2",
      className: "ai-performance__title",
      text: t.title,
      parent: this,
    });

    new BaseComponent({
      tag: "p",
      className: "ai-performance__empty-text",
      text: t.empty_title,
      parent: this,
    });

    new Button({
      className: "ai-performance__cta",
      parent: this,
      text: t.empty_cta,
      onClick: () => router.navigate(ROUTES.AI_CHAT),
    });
  }

  private parseReport(markdown: string): IParsedReport {
    const personaMatch = markdown.match(/Persona:\s*(.+?)(?:\n|$)/);
    const verdictMatch = markdown.match(
      /\*?\*?Verdict:?\*?\*?\s*(.+?)(?:\n|$)/,
    );
    const vibeMatch = markdown.match(/\*?\*?The Vibe:?\*?\*?\s*(.+?)(?:\n|$)/);

    const competencies: { label: string; value: string }[] = [];
    const compRegex = /^\s*\*\s*\*?\*?([^:*]+?)[*: -]+(\d+)/gm;

    const assessmentIndex = markdown.indexOf("Competency Assessment");
    const assessmentSection = markdown.includes("Competency Assessment")
      ? markdown.slice(assessmentIndex)
      : "";

    let match: RegExpExecArray | null;
    while ((match = compRegex.exec(assessmentSection)) !== null) {
      competencies.push({
        label: match[1].trim(),
        value: `${match[2]}%`,
      });
    }

    return {
      persona: personaMatch?.[1]?.trim().replaceAll(/[*"]/g, "") ?? "",
      verdict: verdictMatch?.[1]?.trim().replaceAll(/[*"]/g, "") ?? "",
      vibe: vibeMatch?.[1]?.trim().replaceAll(/[*"]/g, "") ?? "",
      competencies,
    };
  }

  private renderReport(report: IParsedReport): void {
    this.renderPersona(report.persona);
    this.renderVerdict(report.verdict);
    this.renderVibe(report.vibe);
    this.renderCompetencies(report.competencies);
  }

  private renderPersona(persona: string): void {
    if (!persona) return;

    const personaElement = new BaseComponent({
      tag: "div",
      className: "ai-performance__persona",
      parent: this,
    });

    personaElement.getNode().innerHTML = renderMarkdown(
      `🏆 **Persona: ${persona}**`,
    );
  }

  private renderVerdict(verdict: string): void {
    if (!verdict) return;

    const verdictElement = new BaseComponent({
      tag: "div",
      className: "ai-performance__verdict",
      parent: this,
    });

    const verdictClass = this.getVerdictClass(verdict);

    verdictElement.getNode().innerHTML = `Verdict: <span class="ai-performance__verdict-badge ${verdictClass}">"${verdict}"</span>`;
  }

  private renderVibe(vibe: string): void {
    if (!vibe) return;

    const vibeElement = new BaseComponent({
      tag: "div",
      className: "ai-performance__vibe",
      parent: this,
    });

    vibeElement.getNode().innerHTML = renderMarkdown(`**The Vibe:** ${vibe}`);
  }

  private renderCompetencies(
    competencies: { label: string; value: string }[],
  ): void {
    if (competencies.length === 0) return;

    const t = i18n.t().dashboard.components.ai_performance;

    new BaseComponent({
      tag: "h3",
      className: "ai-performance__breakdown-title",
      text: `📊 ${t.xp_breakdown}`,
      parent: this,
    });

    const chartContainer = new BaseComponent({
      className: "ai-performance__radar-chart",
      parent: this,
    });

    const svg = this.createRadarChartSvg(competencies);
    chartContainer.getNode().append(svg);
  }

  private createRadarChartSvg(
    data: { label: string; value: string }[],
  ): SVGSVGElement {
    const svgNamespace = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNamespace, "svg");

    svg.setAttribute(
      "viewBox",
      `0 0 ${CHART_CONFIG.VIEWBOX_WIDTH} ${CHART_CONFIG.VIEWBOX_HEIGHT}`,
    );
    svg.classList.add("ai-performance__radar-svg");

    this.drawRadarGrid(svg, svgNamespace, data.length);
    this.drawRadarDataPolygon(svg, svgNamespace, data);
    this.drawRadarInteractiveItems(svg, svgNamespace, data);

    return svg;
  }

  private drawRadarGrid(
    svg: SVGSVGElement,
    namespace: string,
    numberPoints: number,
  ): void {
    const centerX = CHART_CONFIG.VIEWBOX_WIDTH / 2;
    const centerY = CHART_CONFIG.VIEWBOX_HEIGHT / 2;

    for (let level = 1; level <= CHART_CONFIG.LEVELS; level++) {
      const radius = (CHART_CONFIG.MAX_RADIUS / CHART_CONFIG.LEVELS) * level;
      const points = [];
      for (let index = 0; index < numberPoints; index++) {
        const angle = (Math.PI * 2 * index) / numberPoints - Math.PI / 2;
        points.push(
          `${centerX + radius * Math.cos(angle)},${centerY + radius * Math.sin(angle)}`,
        );
      }
      const polygon = document.createElementNS(namespace, "polygon");
      polygon.setAttribute("points", points.join(" "));
      polygon.classList.add("ai-performance__radar-grid");
      svg.append(polygon);
    }
  }

  private drawRadarDataPolygon(
    svg: SVGSVGElement,
    namespace: string,
    data: { label: string; value: string }[],
  ): void {
    const centerX = CHART_CONFIG.VIEWBOX_WIDTH / 2;
    const centerY = CHART_CONFIG.VIEWBOX_HEIGHT / 2;

    const dataPoints = [];
    const numberPoints = data.length;

    for (let index = 0; index < numberPoints; index++) {
      const numericValue = Number.parseInt(
        data[index].value.replace("%", "").trim(),
        10,
      );
      const percentage = Number.isNaN(numericValue)
        ? 0
        : Math.min(Math.max(numericValue, 0), 100);
      const radius = (CHART_CONFIG.MAX_RADIUS * percentage) / 100;
      const angle = (Math.PI * 2 * index) / numberPoints - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      dataPoints.push(`${x},${y}`);
    }

    const dataPolygon = document.createElementNS(
      namespace,
      "polygon",
    ) as SVGPolygonElement;
    dataPolygon.setAttribute("points", dataPoints.join(" "));
    dataPolygon.classList.add("ai-performance__radar-data");
    svg.append(dataPolygon);
  }

  private drawRadarInteractiveItems(
    svg: SVGSVGElement,
    namespace: string,
    data: { label: string; value: string }[],
  ): void {
    for (let index = 0; index < data.length; index++) {
      const group = document.createElementNS(namespace, "g");
      group.classList.add("ai-performance__radar-item");

      group.append(this.createHoverArea(namespace, data.length, index));
      group.append(
        this.createAxis(namespace, data.length, index, data[index].value),
      );
      group.append(
        this.createLabel(namespace, data.length, index, data[index].label),
      );
      group.append(
        this.createDataPoint(namespace, data.length, index, data[index].value),
      );
      group.append(
        this.createPercentText(
          namespace,
          data.length,
          index,
          data[index].value,
        ),
      );

      svg.append(group);
    }
  }

  private createHoverArea(
    namespace: string,
    numberPoints: number,
    index: number,
  ): SVGPolygonElement {
    const angle = (Math.PI * 2 * index) / numberPoints - Math.PI / 2;
    const angleStep = (Math.PI * 2) / numberPoints;
    const hitRadius = CHART_CONFIG.MAX_RADIUS + 30;
    const cx = CHART_CONFIG.VIEWBOX_WIDTH / 2;
    const cy = CHART_CONFIG.VIEWBOX_HEIGHT / 2;

    const p1x = cx + hitRadius * Math.cos(angle - angleStep / 2);
    const p1y = cy + hitRadius * Math.sin(angle - angleStep / 2);
    const p2x = cx + hitRadius * Math.cos(angle + angleStep / 2);
    const p2y = cy + hitRadius * Math.sin(angle + angleStep / 2);

    const hoverArea = document.createElementNS(
      namespace,
      "polygon",
    ) as SVGPolygonElement;
    hoverArea.setAttribute("points", `${cx},${cy} ${p1x},${p1y} ${p2x},${p2y}`);
    hoverArea.classList.add("ai-performance__radar-hover-area");
    return hoverArea;
  }

  private createAxis(
    namespace: string,
    numberPoints: number,
    index: number,
    value: string,
  ): SVGLineElement {
    const angle = (Math.PI * 2 * index) / numberPoints - Math.PI / 2;
    const cx = CHART_CONFIG.VIEWBOX_WIDTH / 2;
    const cy = CHART_CONFIG.VIEWBOX_HEIGHT / 2;

    const numericValue = Number.parseInt(value.replace("%", "").trim(), 10);
    const percentage = Number.isNaN(numericValue)
      ? 0
      : Math.min(Math.max(numericValue, 0), 100);
    const radius = (CHART_CONFIG.MAX_RADIUS * percentage) / 100;

    const line = document.createElementNS(namespace, "line") as SVGLineElement;
    line.setAttribute("x1", cx.toString());
    line.setAttribute("y1", cy.toString());
    line.setAttribute("x2", (cx + radius * Math.cos(angle)).toString());
    line.setAttribute("y2", (cy + radius * Math.sin(angle)).toString());
    line.classList.add("ai-performance__radar-axis");
    return line;
  }

  private createLabel(
    namespace: string,
    numberPoints: number,
    index: number,
    textContent: string,
  ): SVGTextElement {
    const angle = (Math.PI * 2 * index) / numberPoints - Math.PI / 2;
    const radius = CHART_CONFIG.MAX_RADIUS + CHART_CONFIG.LABEL_MARGIN;
    const cx = CHART_CONFIG.VIEWBOX_WIDTH / 2;
    const cy = CHART_CONFIG.VIEWBOX_HEIGHT / 2;

    const text = document.createElementNS(namespace, "text") as SVGTextElement;
    text.setAttribute("x", (cx + radius * Math.cos(angle)).toString());
    text.setAttribute("y", (cy + radius * Math.sin(angle)).toString());
    text.textContent = textContent;
    text.classList.add("ai-performance__radar-label");
    text.setAttribute(
      "text-anchor",
      Math.abs(Math.cos(angle)) < 0.1
        ? "middle"
        : Math.cos(angle) > 0
          ? "start"
          : "end",
    );
    return text;
  }

  private createPercentText(
    namespace: string,
    numberPoints: number,
    index: number,
    value: string,
  ): SVGTextElement {
    const angle = (Math.PI * 2 * index) / numberPoints - Math.PI / 2;
    const numericValue = Number.parseInt(value.replace("%", "").trim(), 10);
    const percentage = Number.isNaN(numericValue)
      ? 0
      : Math.min(Math.max(numericValue, 0), 100);
    const pointRadius = (CHART_CONFIG.MAX_RADIUS * percentage) / 100;
    const radius = Math.max(pointRadius - 16, 5);
    const cx = CHART_CONFIG.VIEWBOX_WIDTH / 2;
    const cy = CHART_CONFIG.VIEWBOX_HEIGHT / 2;

    const text = document.createElementNS(namespace, "text") as SVGTextElement;
    text.setAttribute("x", (cx + radius * Math.cos(angle)).toString());
    text.setAttribute("y", (cy + radius * Math.sin(angle)).toString());
    text.textContent = value;
    text.classList.add("ai-performance__radar-percent");
    text.setAttribute(
      "text-anchor",
      Math.abs(Math.cos(angle)) < 0.1
        ? "middle"
        : Math.cos(angle) > 0
          ? "start"
          : "end",
    );
    return text;
  }

  private createDataPoint(
    namespace: string,
    numberPoints: number,
    index: number,
    value: string,
  ): SVGCircleElement {
    const angle = (Math.PI * 2 * index) / numberPoints - Math.PI / 2;
    const cx = CHART_CONFIG.VIEWBOX_WIDTH / 2;
    const cy = CHART_CONFIG.VIEWBOX_HEIGHT / 2;

    const numericValue = Number.parseInt(value.replace("%", "").trim(), 10);
    const percentage = Number.isNaN(numericValue)
      ? 0
      : Math.min(Math.max(numericValue, 0), 100);
    const radius = (CHART_CONFIG.MAX_RADIUS * percentage) / 100;

    const circle = document.createElementNS(
      namespace,
      "circle",
    ) as SVGCircleElement;
    circle.setAttribute("cx", (cx + radius * Math.cos(angle)).toString());
    circle.setAttribute("cy", (cy + radius * Math.sin(angle)).toString());
    circle.setAttribute("r", CHART_CONFIG.POINT_RADIUS.toString());
    circle.classList.add("ai-performance__radar-point");
    return circle;
  }

  private getVerdictClass(verdict: string): string {
    const lower = verdict.toLowerCase();
    if (lower.includes("strong hire") || lower.includes("hire")) {
      return "ai-performance__verdict-badge--success";
    }
    if (lower.includes("needs training")) {
      return "ai-performance__verdict-badge--warning";
    }
    return "";
  }
}

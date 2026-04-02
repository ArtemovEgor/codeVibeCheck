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

    const size = 200;
    const center = size / 2;
    const maxRadius = 70;

    svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
    svg.classList.add("ai-performance__radar-svg");

    this.drawRadarGrid(svg, svgNamespace, center, maxRadius, data.length);
    this.drawRadarAxes(svg, svgNamespace, center, maxRadius, data);
    this.drawRadarLabels(svg, svgNamespace, center, maxRadius, data);
    this.drawRadarData(svg, svgNamespace, center, maxRadius, data);

    return svg;
  }

  private drawRadarGrid(
    svg: SVGSVGElement,
    namespace: string,
    center: number,
    maxRadius: number,
    numberPoints: number,
  ): void {
    const levels = 5;
    for (let level = 1; level <= levels; level++) {
      const radius = (maxRadius / levels) * level;
      const points = [];
      for (let index = 0; index < numberPoints; index++) {
        const angle = (Math.PI * 2 * index) / numberPoints - Math.PI / 2;
        points.push(
          `${center + radius * Math.cos(angle)},${center + radius * Math.sin(angle)}`,
        );
      }
      const polygon = document.createElementNS(namespace, "polygon");
      polygon.setAttribute("points", points.join(" "));
      polygon.classList.add("ai-performance__radar-grid");
      svg.append(polygon);
    }
  }

  private drawRadarAxes(
    svg: SVGSVGElement,
    namespace: string,
    center: number,
    maxRadius: number,
    data: { label: string; value: string }[],
  ): void {
    const numberPoints = data.length;
    for (let index = 0; index < numberPoints; index++) {
      const angle = (Math.PI * 2 * index) / numberPoints - Math.PI / 2;
      const xEnd = center + maxRadius * Math.cos(angle);
      const yEnd = center + maxRadius * Math.sin(angle);

      const line = document.createElementNS(namespace, "line");
      line.setAttribute("x1", center.toString());
      line.setAttribute("y1", center.toString());
      line.setAttribute("x2", xEnd.toString());
      line.setAttribute("y2", yEnd.toString());
      line.classList.add("ai-performance__radar-axis");
      svg.append(line);
    }
  }

  private drawRadarLabels(
    svg: SVGSVGElement,
    namespace: string,
    center: number,
    maxRadius: number,
    data: { label: string; value: string }[],
  ): void {
    const numberPoints = data.length;
    for (let index = 0; index < numberPoints; index++) {
      const angle = (Math.PI * 2 * index) / numberPoints - Math.PI / 2;
      const labelRadius = maxRadius + 15;
      const text = document.createElementNS(namespace, "text");
      text.setAttribute(
        "x",
        (center + labelRadius * Math.cos(angle)).toString(),
      );
      text.setAttribute(
        "y",
        (center + labelRadius * Math.sin(angle)).toString(),
      );
      text.textContent = data[index].label;
      text.classList.add("ai-performance__radar-label");
      text.setAttribute(
        "text-anchor",
        Math.abs(Math.cos(angle)) < 0.1
          ? "middle"
          : Math.cos(angle) > 0
            ? "start"
            : "end",
      );
      svg.append(text);
    }
  }

  private drawRadarData(
    svg: SVGSVGElement,
    namespace: string,
    center: number,
    maxRadius: number,
    data: { label: string; value: string }[],
  ): void {
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
      const radius = (maxRadius * percentage) / 100;
      const angle = (Math.PI * 2 * index) / numberPoints - Math.PI / 2;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      dataPoints.push(`${x},${y}`);

      const circle = document.createElementNS(namespace, "circle");
      circle.setAttribute("cx", x.toString());
      circle.setAttribute("cy", y.toString());
      circle.setAttribute("r", "3");
      circle.classList.add("ai-performance__radar-point");
      svg.append(circle);
    }

    const dataPolygon = document.createElementNS(namespace, "polygon");
    dataPolygon.setAttribute("points", dataPoints.join(" "));
    dataPolygon.classList.add("ai-performance__radar-data");
    svg.insertBefore(
      dataPolygon,
      svg.querySelector(".ai-performance__radar-point"),
    );
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

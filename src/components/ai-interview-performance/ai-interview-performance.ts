import BaseComponent from "../base/base-component";
import { i18n } from "@/services/localization-service";
import { Button } from "../button/button";
import { router } from "@/router/router";
import { ROUTES } from "@/constants/routes";
import { renderMarkdown } from "@/utils/markdown";
import type { IUserChatStats } from "@/types/shared";
import "./ai-interview-performance.scss";
import RadarChart from "../radar-chart/radar-chart";

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

    const radarChart = new RadarChart(competencies);
    chartContainer.getNode().append(radarChart.getNode());
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

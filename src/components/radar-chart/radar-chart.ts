import BaseComponent from "../base/base-component";
import "./radar-chart.scss";

export interface IRadarChartData {
  label: string;
  value: string;
}

const CHART_CONFIG = {
  VIEWBOX_WIDTH: 350,
  VIEWBOX_HEIGHT: 200,
  MAX_RADIUS: 70,
  LEVELS: 5,
  LABEL_MARGIN: 15,
  POINT_RADIUS: 3,
};

export default class RadarChart extends BaseComponent {
  private data: IRadarChartData[];

  constructor(data: IRadarChartData[]) {
    super({ className: "radar-chart" });
    this.data = data;
    this.render();
  }

  private render(): void {
    const svg = this.createRadarChartSvg();
    this.getNode().append(svg);
  }

  private createRadarChartSvg(): SVGSVGElement {
    const svgNamespace = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNamespace, "svg");

    svg.setAttribute(
      "viewBox",
      `0 0 ${CHART_CONFIG.VIEWBOX_WIDTH} ${CHART_CONFIG.VIEWBOX_HEIGHT}`,
    );
    svg.classList.add("radar-chart__svg");

    this.drawRadarGrid(svg, svgNamespace, this.data.length);
    this.drawRadarDataPolygon(svg, svgNamespace, this.data);
    this.drawRadarInteractiveItems(svg, svgNamespace, this.data);

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
      polygon.classList.add("radar-chart__grid");
      svg.append(polygon);
    }
  }

  private drawRadarDataPolygon(
    svg: SVGSVGElement,
    namespace: string,
    data: IRadarChartData[],
  ): void {
    const cx = CHART_CONFIG.VIEWBOX_WIDTH / 2;
    const cy = CHART_CONFIG.VIEWBOX_HEIGHT / 2;

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
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      dataPoints.push(`${x},${y}`);
    }

    const dataPolygon = document.createElementNS(
      namespace,
      "polygon",
    ) as SVGPolygonElement;
    dataPolygon.setAttribute("points", dataPoints.join(" "));
    dataPolygon.classList.add("radar-chart__data");
    svg.append(dataPolygon);
  }

  private drawRadarInteractiveItems(
    svg: SVGSVGElement,
    namespace: string,
    data: IRadarChartData[],
  ): void {
    for (let index = 0; index < data.length; index++) {
      const group = document.createElementNS(namespace, "g");
      group.classList.add("radar-chart__item");

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
    hoverArea.classList.add("radar-chart__hover-area");
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
    line.classList.add("radar-chart__axis");
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
    text.classList.add("radar-chart__label");
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
    text.classList.add("radar-chart__percent");
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
    circle.classList.add("radar-chart__point");
    return circle;
  }
}

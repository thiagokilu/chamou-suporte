import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Markdown from "./ReactMarkdown";

describe("Markdown", () => {
  it("renderiza markdown formatado e listas", () => {
    render(<Markdown>{"**Importante**\n\n- primeiro\n- segundo"}</Markdown>);
    expect(screen.getByText("Importante").tagName).toBe("STRONG");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("abre links externos em nova aba com proteção contra acesso à janela", () => {
    render(<Markdown>{"[documentação](https://example.com)"}</Markdown>);
    expect(screen.getByRole("link", { name: "documentação" })).toHaveAttribute(
      "rel",
      "noopener noreferrer",
    );
    expect(screen.getByRole("link", { name: "documentação" })).toHaveAttribute(
      "target",
      "_blank",
    );
  });
});

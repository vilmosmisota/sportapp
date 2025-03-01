import React from "react";
import { render, screen } from "@testing-library/react";

describe("Jest DOM Types Test", () => {
  it("should have the jest-dom matchers available", () => {
    render(<div data-testid="test-element">Test Content</div>);

    const element = screen.getByTestId("test-element");

    // These should compile correctly if the jest-dom types are working
    expect(element).toBeInTheDocument();
    expect(element).toHaveTextContent("Test Content");
    expect(element).toBeVisible();
  });
});

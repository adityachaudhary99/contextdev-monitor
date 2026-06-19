import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import DomainForm from "./DomainForm.js";

afterEach(() => cleanup());

describe("DomainForm", () => {
  it("calls onRun with the domain when the form is submitted", () => {
    const onRun = vi.fn();
    render(<DomainForm onRun={onRun} />);

    const input = screen.getByPlaceholderText(/e\.g\. stripe\.com/i);
    fireEvent.change(input, { target: { value: "stripe.com" } });

    const button = screen.getByRole("button", { name: /run/i });
    fireEvent.click(button);

    expect(onRun).toHaveBeenCalledOnce();
    expect(onRun).toHaveBeenCalledWith("stripe.com", undefined);
  });

  it("shows a password field and disclosure text in BYO mode", () => {
    render(<DomainForm onRun={vi.fn()} />);

    // Switch to BYO mode
    const byoButton = screen.getByRole("button", { name: /bring your own key/i });
    fireEvent.click(byoButton);

    const keyInput = screen.getByPlaceholderText(/paste your context\.dev api key/i);
    expect(keyInput).toHaveAttribute("type", "password");

    expect(
      screen.getByText(/your key is sent to our server/i),
    ).toBeInTheDocument();
  });

  it("calls onRun with domain and byoKey in BYO mode", () => {
    const onRun = vi.fn();
    render(<DomainForm onRun={onRun} />);

    // Switch to BYO mode
    const byoButton = screen.getByRole("button", { name: /bring your own key/i });
    fireEvent.click(byoButton);

    const domainInput = screen.getByPlaceholderText(/e\.g\. stripe\.com/i);
    fireEvent.change(domainInput, { target: { value: "acme.com" } });

    const keyInput = screen.getByPlaceholderText(/paste your context\.dev api key/i);
    fireEvent.change(keyInput, { target: { value: "ctx_testkey123" } });

    const button = screen.getByRole("button", { name: /run/i });
    fireEvent.click(button);

    expect(onRun).toHaveBeenCalledWith("acme.com", "ctx_testkey123");
  });

  it("disables the Run button when loading prop is true", () => {
    render(<DomainForm onRun={vi.fn()} loading />);

    const button = screen.getByRole("button", { name: /loading/i });
    expect(button).toBeDisabled();
  });
});

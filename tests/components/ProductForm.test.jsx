import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ProductForm from "@/components/ProductForm";

function jsonResponse(status, body) {
  return Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(body) });
}

describe("ProductForm", () => {
  it("ties each invalid field to its visible error and focuses the first one", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ProductForm onSubmit={onSubmit} showDraft={false} />);

    await user.click(screen.getByRole("button", { name: "Save product" }));

    const name = screen.getByLabelText("Product name");
    expect(name).toHaveAttribute("aria-invalid", "true");
    expect(name.getAttribute("aria-describedby")).toContain("name-error");
    expect(document.getElementById("name-error")).toHaveTextContent("Product name is required.");
    expect(name).toHaveFocus();

    const price = screen.getByLabelText("Price (KES)");
    expect(price).toHaveAttribute("aria-invalid", "true");
    expect(price).toHaveAccessibleDescription(/Price is required/);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits validated values with a numeric price", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(() => true);
    render(<ProductForm onSubmit={onSubmit} showDraft={false} />);

    await user.type(screen.getByLabelText("Product name"), "Farm eggs");
    await user.type(screen.getByLabelText(/Description/), "Free-range, collected daily.");
    await user.type(screen.getByLabelText("Price (KES)"), "1,200");
    await user.selectOptions(screen.getByLabelText("Availability"), "limited");
    await user.click(screen.getByRole("button", { name: "Save product" }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: "Farm eggs",
      description: "Free-range, collected daily.",
      price: 1200,
      availability: "limited",
    });
    expect(screen.getByLabelText("Product name")).not.toHaveAttribute("aria-invalid");
  });

  it("pre-fills from an existing product", () => {
    render(
      <ProductForm
        onSubmit={vi.fn()}
        showDraft={false}
        currency="USD"
        product={{ id: "x", name: "Honey", description: "Raw", price: 8, availability: "sold_out" }}
      />,
    );
    expect(screen.getByLabelText("Product name")).toHaveValue("Honey");
    expect(screen.getByLabelText("Price (USD)")).toHaveValue("8");
    expect(screen.getByLabelText("Availability")).toHaveValue("sold_out");
  });

  it("shows a storage error when saving fails", async () => {
    const user = userEvent.setup();
    render(<ProductForm onSubmit={() => false} showDraft={false} />);
    await user.type(screen.getByLabelText("Product name"), "Honey");
    await user.type(screen.getByLabelText("Price (KES)"), "800");
    await user.click(screen.getByRole("button", { name: "Save product" }));
    expect(screen.getByRole("alert")).toHaveTextContent(/blocked saving/);
  });

  it("fills the form from an AI draft without saving it", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        jsonResponse(200, {
          values: {
            name: "Fresh chapati",
            description: "Soft chapati made every morning.",
            price: "",
            availability: "limited",
          },
          warnings: ["No price was mentioned.", "Price is required."],
        }),
      ),
    );
    render(<ProductForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Your notes"), "chapati, soft, only 20 a day");
    await user.click(screen.getByRole("button", { name: "Draft listing" }));

    expect(await screen.findByDisplayValue("Fresh chapati")).toBeInTheDocument();
    expect(screen.getByLabelText("Availability")).toHaveValue("limited");
    const warnings = screen.getByText("Check before saving:").parentElement;
    expect(within(warnings).getByText("No price was mentioned.")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

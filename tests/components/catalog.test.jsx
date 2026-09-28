import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const { push, pathname } = vi.hoisted(() => ({ push: vi.fn(), pathname: { current: "/" } }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => pathname.current,
}));

import CatalogView, { CatalogContent } from "@/components/CatalogView";
import NavLinks from "@/components/NavLinks";
import ProductDetail from "@/components/ProductDetail";
import ProductEditor from "@/components/ProductEditor";
import ProductManager from "@/components/ProductManager";
import { DEFAULT_SETTINGS, SETTINGS_STORAGE_KEY } from "@/lib/settings-store";
import { PRODUCTS_STORAGE_KEY, SEED_PRODUCTS } from "@/lib/product-store";

function storeProducts(products) {
  window.localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
}

function storedProducts() {
  return JSON.parse(window.localStorage.getItem(PRODUCTS_STORAGE_KEY));
}

describe("CatalogView", () => {
  it("shows seed products and a prompt to add shop details on first visit", () => {
    render(<CatalogView />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Your backyard shop");
    expect(screen.getByRole("link", { name: "Add your shop details" })).toHaveAttribute("href", "/settings");
    const list = screen.getByRole("list");
    expect(within(list).getAllByRole("listitem")).toHaveLength(SEED_PRODUCTS.length);
    expect(screen.getByRole("link", { name: "Backyard honey (500g)" })).toHaveAttribute(
      "href",
      "/products/backyard-honey",
    );
  });

  it("uses saved settings for the shop header", () => {
    window.localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({ ...DEFAULT_SETTINGS, shopName: "Amina Yard", contactPhone: "0712345678", acceptingOrders: false }),
    );
    render(<CatalogView />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Amina Yard");
    expect(screen.getByText("Not taking orders right now")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "0712345678" })).toHaveAttribute("href", "tel:0712345678");
  });

  it("shows loading and empty states", () => {
    const { rerender } = render(
      <CatalogContent products={[]} settings={DEFAULT_SETTINGS} ready={false} />,
    );
    expect(screen.getByText("Loading products…")).toBeInTheDocument();
    rerender(<CatalogContent products={[]} settings={DEFAULT_SETTINGS} ready />);
    expect(screen.getByText("No products listed yet.")).toBeInTheDocument();
  });

  it("marks sold-out prices for screen readers", () => {
    render(<CatalogView />);
    expect(screen.getAllByText("(sold out)")).toHaveLength(1);
  });
});

describe("ProductManager", () => {
  it("deletes a product after confirmation and announces it", async () => {
    const user = userEvent.setup();
    vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<ProductManager />);

    await user.click(screen.getByRole("button", { name: "Delete Farm eggs (tray of 30)" }));

    expect(screen.getByRole("status")).toHaveTextContent('Deleted "Farm eggs (tray of 30)".');
    expect(storedProducts().map((p) => p.id)).not.toContain("farm-eggs-tray");
    expect(screen.queryByRole("button", { name: "Delete Farm eggs (tray of 30)" })).not.toBeInTheDocument();
  });

  it("keeps the product when deletion is cancelled", async () => {
    const user = userEvent.setup();
    vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<ProductManager />);
    await user.click(screen.getByRole("button", { name: "Delete Backyard honey (500g)" }));
    expect(window.localStorage.getItem(PRODUCTS_STORAGE_KEY)).toBeNull();
    expect(screen.getByRole("button", { name: "Delete Backyard honey (500g)" })).toBeInTheDocument();
  });

  it("shows an empty state when every product is gone", () => {
    storeProducts([]);
    render(<ProductManager />);
    expect(screen.getByText(/No products yet/)).toBeInTheDocument();
  });
});

describe("ProductDetail", () => {
  it("renders a stored product with order contact", () => {
    window.localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({ ...DEFAULT_SETTINGS, contactPhone: "0712345678" }),
    );
    render(<ProductDetail productId="farm-eggs-tray" />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Farm eggs (tray of 30)");
    expect(screen.getByText("Limited stock")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Edit product" })).toHaveAttribute(
      "href",
      "/products/farm-eggs-tray/edit",
    );
  });

  it("shows a not-found state for unknown ids", () => {
    render(<ProductDetail productId="missing" />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Product not found");
  });
});

describe("ProductEditor", () => {
  it("creates a product and navigates to it", async () => {
    const user = userEvent.setup();
    push.mockReset();
    render(<ProductEditor />);

    await user.type(screen.getByLabelText("Product name"), "Fresh chapati");
    await user.type(screen.getByLabelText("Price (KES)"), "50");
    await user.click(screen.getByRole("button", { name: "Add product" }));

    expect(storedProducts()[0]).toMatchObject({ id: "fresh-chapati", name: "Fresh chapati", price: 50 });
    expect(push).toHaveBeenCalledWith("/products/fresh-chapati");
  });

  it("edits an existing product", async () => {
    const user = userEvent.setup();
    push.mockReset();
    render(<ProductEditor productId="backyard-honey" />);

    const availability = screen.getByLabelText("Availability");
    expect(availability).toHaveValue("sold_out");
    await user.selectOptions(availability, "in_stock");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(storedProducts().find((p) => p.id === "backyard-honey").availability).toBe("in_stock");
    expect(push).toHaveBeenCalledWith("/products/backyard-honey");
  });

  it("explains when the product to edit is gone", () => {
    render(<ProductEditor productId="missing" />);
    expect(screen.getByText(/doesn't exist/)).toBeInTheDocument();
  });
});

describe("NavLinks", () => {
  it("marks the current section with aria-current", () => {
    pathname.current = "/products/new";
    render(<NavLinks />);
    expect(screen.getByRole("link", { name: "Manage products" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Catalog" })).not.toHaveAttribute("aria-current");
    pathname.current = "/";
  });
});

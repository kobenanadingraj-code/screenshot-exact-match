import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { DemoProvider } from "@/lib/demo-provider";
import { useDemo } from "@/lib/demo-context";

afterEach(cleanup);

function Consumer() {
  const { engineer, setEngineer } = useDemo();
  return <button onClick={() => setEngineer("Verified Engineer")}>{engineer}</button>;
}

describe("Shared demo provider", () => {
  it("shares live state with every nested consumer", () => {
    render(
      <DemoProvider>
        <Consumer />
        <Consumer />
      </DemoProvider>,
    );
    const consumers = screen.getAllByRole("button", { name: "Jean Adingra" });
    const first = consumers[0];
    if (!first) throw new Error("Consumer missing");
    fireEvent.click(first);
    expect(screen.getAllByRole("button", { name: "Verified Engineer" })).toHaveLength(2);
  });

  it("keeps consumers connected when the provider subtree rerenders", () => {
    const view = render(
      <DemoProvider>
        <Consumer />
      </DemoProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Jean Adingra" }));
    view.rerender(
      <DemoProvider>
        <div>
          <Consumer />
        </div>
      </DemoProvider>,
    );
    expect(screen.getByRole("button", { name: "Verified Engineer" })).toBeInTheDocument();
  });
});
